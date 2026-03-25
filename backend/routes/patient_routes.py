from flask import Blueprint, jsonify,request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from bson import ObjectId
from config.db import db
from datetime import datetime

patient_bp = Blueprint("patient_bp", __name__)

@patient_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_patient_profile():

    if get_jwt()["role"] != "patient":
        return jsonify({"error": "Access denied"}), 403

    patient_id = get_jwt_identity()

    patient = db.users.find_one(
        {"_id": ObjectId(patient_id)},
        {"password": 0}
    )

    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    patient["_id"] = str(patient["_id"])

    return jsonify(patient), 200

@patient_bp.route("/history", methods=["GET"])
@jwt_required()
def get_patient_history():

    if get_jwt()["role"] != "patient":
        return jsonify({"error": "Access denied"}), 403

    patient_id = get_jwt_identity()

    cases = list(db.cases.find({
        "patient_id": patient_id,
        "status": "closed"
    }).sort("updated_at", -1))

    for case in cases:
        case["_id"] = str(case["_id"])

        # DO NOT override the name
        # case["name"] should come from case document itself

    return jsonify(cases), 200

@patient_bp.route("/reports", methods=["GET"])
@jwt_required()
def get_patient_reports():

    if get_jwt()["role"] != "patient":
        return jsonify({"error": "Access denied"}), 403

    patient_id = get_jwt_identity()

    cases = list(db.cases.find({
        "patient_id": patient_id,
        "final_diagnosis": {"$ne": None}
    }))

    for case in cases:
        case["_id"] = str(case["_id"])

    return jsonify(cases), 200
@patient_bp.route("/case/<case_id>/report", methods=["GET"])
@jwt_required()
def get_patient_report(case_id):

    try:

        patient_id = get_jwt_identity()

        case = db.cases.find_one({
            "_id": ObjectId(case_id),
            "patient_id": patient_id
        })

        if not case:
            return jsonify({"error": "Case not found"}), 404


        # Default doctor info
        case["doctor_name"] = "Specialist"
        case["doctor_specialization"] = "Neurology"


        # Fetch doctor info safely
        if case.get("doctor_id"):

            doctor_id = case["doctor_id"]

            if isinstance(doctor_id, str):
                doctor_id = ObjectId(doctor_id)

            doctor = db.users.find_one({"_id": doctor_id})

            if doctor:
                case["doctor_name"] = doctor.get("name", "Specialist")
                case["doctor_specialization"] = doctor.get("specialization", "Neurology")


        # ---------------------------------------------------
        # CHECK IF CONSULTATION SLOT IS BOOKED
        # ---------------------------------------------------

        appointment = db.appointment_slots.find_one({
    "case_id": case_id,
    "booked": True
})
        print("FOUND APPOINTMENT:", appointment)

        if appointment:
         case["consultation_booked"] = True
         case["consultation_date"] = appointment.get("date")
         case["consultation_time"] = appointment.get("time")
        else:
         case["consultation_booked"] = False


        # Convert ObjectId to string
        case["_id"] = str(case["_id"])

        return jsonify(case), 200


    except Exception as e:

        print("REPORT API ERROR:", e)

        return jsonify({
            "error": "Failed to load report"
        }), 500
@patient_bp.route("/case/<case_id>/slots")
def get_slots(case_id):

    slots = list(db.appointment_slots.find({
        "case_id": case_id,
        "booked": False
    }))

    for s in slots:
        s["_id"] = str(s["_id"])

    return jsonify(slots)

@patient_bp.route("/book-slot", methods=["POST"])
@jwt_required()
def book_slot():

    data = request.json
    slot_id = data["slot_id"]
    patient_id = get_jwt_identity()

    slot = db.appointment_slots.find_one({"_id": ObjectId(slot_id)})

    if not slot:
        return jsonify({"error": "Slot not found"}), 404

    if slot.get("booked"):
        return jsonify({"error": "Slot already booked"}), 400

    db.appointment_slots.update_one(
        {"_id": ObjectId(slot_id)},
        {
            "$set": {
                "booked": True,
                "patient_id": patient_id,
                "status": "confirmed"
            }
        }
    )

    return jsonify({"message": "Appointment booked successfully"})