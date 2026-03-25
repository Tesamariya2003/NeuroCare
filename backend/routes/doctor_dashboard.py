from flask import Blueprint, jsonify,request
from flask_jwt_extended import jwt_required, get_jwt,get_jwt_identity
from config.db import db
from bson import ObjectId

doctor_bp = Blueprint("doctor", __name__, url_prefix="/doctor")

@doctor_bp.route("/cases", methods=["GET"])
@jwt_required()
def get_assigned_cases():

    if get_jwt()["role"] != "doctor":
        return jsonify({"error": "Access denied"}), 403

    doctor_id = str(get_jwt_identity())

    cases = list(
    db.cases.find({"doctor_id": doctor_id})
    .sort("updated_at", -1)
)

    for c in cases:
        c["_id"] = str(c["_id"])

    return jsonify(cases)
@doctor_bp.route("/approved", methods=["GET"])
def get_approved_doctors():

    doctors = list(db.users.find({
        "role": "doctor",
        "verification_status": "approved"
    }, {"password": 0}))

    for d in doctors:
        d["_id"] = str(d["_id"])

    return jsonify(doctors)
@doctor_bp.route("/cases/<case_id>/review", methods=["PUT"])
@jwt_required()
def review_case(case_id):
    claims = get_jwt()

    if claims["role"] != "doctor":
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()

    suspected_disease = data.get("suspected_disease")
    required_test = data.get("required_test")
    notes = data.get("notes")

    db.cases.update_one(
        {"_id": ObjectId(case_id)},
        {
            "$set": {
                "status": "awaiting_test",
                "suspected_disease": suspected_disease,
                "required_test": required_test,
                "doctor_notes": notes
            }
        }
    )

    return jsonify({"message": "Case reviewed and test requested"})
@doctor_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_doctor_profile():

    if get_jwt()["role"] != "doctor":
        return jsonify({"error": "Access denied"}), 403

    doctor_id = get_jwt_identity()

    # Fetch doctor basic info
    doctor = db.users.find_one(
        {"_id": ObjectId(doctor_id)},
        {"password": 0}
    )

    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404

    # Fetch all assigned cases
    cases = list(db.cases.find({"doctor_id": doctor_id}))

    total_cases = len(cases)

    submitted = len([c for c in cases if c.get("status") == "submitted"])
    awaiting_test = len([c for c in cases if c.get("status") == "awaiting_test"])
    ai_completed = len([c for c in cases if c.get("status") == "ai_completed"])
    reviewed = len([c for c in cases if c.get("status") == "reviewed"])
    finalized = len([c for c in cases if c.get("status") == "closed"])

    doctor["_id"] = str(doctor["_id"])

    # Attach stats
    doctor["total_cases"] = total_cases
    doctor["submitted_cases"] = submitted
    doctor["awaiting_test_cases"] = awaiting_test
    doctor["ai_completed_cases"] = ai_completed
    doctor["reviewed_cases"] = reviewed
    doctor["completed_cases"] = finalized

    return jsonify(doctor), 200
@doctor_bp.route("/history", methods=["GET"])
@jwt_required()
def get_case_history():

    doctor_id = get_jwt_identity()

    cases = list(db.cases.find({
        "doctor_id": doctor_id,
        "status": "closed"
    }).sort("updated_at", -1))

    for case in cases:
        case["_id"] = str(case["_id"])

    return jsonify(cases), 200
@doctor_bp.route("/case/<case_id>/create-slots", methods=["POST"])
def create_slots(case_id):

    data = request.json
    slots = data["slots"]

    case = db.cases.find_one({"_id": ObjectId(case_id)})

    for slot in slots:

        db.appointment_slots.insert_one({
            "case_id": case_id,
            "doctor_id": case["doctor_id"],
            "date": slot["date"],
            "time": slot["time"],
            "booked": False
        })

    return jsonify({"message": "Slots created"})
@doctor_bp.route("/delete-slot", methods=["DELETE"])
def delete_slot():

    data = request.json

    db.appointment_slots.delete_one({
        "date": data["date"],
        "time": data["time"]
    })

    return jsonify({"message":"Slot deleted"})
@doctor_bp.route("/bookings", methods=["GET"])
@jwt_required()
def get_doctor_bookings():

    doctor_id = get_jwt_identity()

    slots = list(db.appointment_slots.find({
        "doctor_id": doctor_id,
        "booked": True
    }))

    result = []

    for slot in slots:

     case = db.cases.find_one({"_id": ObjectId(slot["case_id"])})

     patient = db.users.find_one({"_id": ObjectId(case["patient_id"])})

     result.append({
        "patient": case["name"],
        "age": case["age"],
        "disease": case["ai_result"]["disease"],
        "date": slot["date"],
        "time": slot["time"],
        "case_id": slot["case_id"],
        "status": "Confirmed"
    })

    return jsonify(result)