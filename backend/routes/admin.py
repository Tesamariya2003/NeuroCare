from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from config.db import db
from bson import ObjectId

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

@admin_bp.route("/pending-doctors", methods=["GET"])
@jwt_required()
def get_pending_doctors():

    if get_jwt()["role"] != "admin":
        return jsonify({"error": "Access denied"}), 403

    doctors = db.users.find(
        {"role": "doctor", "verification_status": "pending"},
        {"password": 0}
    )

    return jsonify([
        {
            **doc,
            "_id": str(doc["_id"])
        }
        for doc in doctors
    ])

@admin_bp.route("/approve-doctor/<doctor_id>", methods=["PUT"])
@jwt_required()
def approve_doctor(doctor_id):

    if get_jwt()["role"] != "admin":
        return jsonify({"error": "Access denied"}), 403

    db.users.update_one(
        {"_id": ObjectId(doctor_id)},
        {"$set": {
            "verified": True,
            "verification_status": "approved"
        }}
    )

    return jsonify({"message": "Doctor approved successfully"})
@admin_bp.route("/overview", methods=["GET"])
@jwt_required()
def admin_overview():

    if get_jwt()["role"] != "admin":
        return jsonify({"error": "Access denied"}), 403

    total_doctors = db.users.count_documents({"role": "doctor"})
    pending_doctors = db.users.count_documents({
        "role": "doctor",
        "verification_status": "pending"
    })
    total_patients = db.users.count_documents({"role": "patient"})
    total_cases = db.cases.count_documents({})
    active_cases = db.cases.count_documents({"status": {"$ne": "closed"}})
    closed_cases = db.cases.count_documents({"status": "closed"})

    return jsonify({
        "total_doctors": total_doctors,
        "pending_doctors": pending_doctors,
        "total_patients": total_patients,
        "total_cases": total_cases,
        "active_cases": active_cases,
        "closed_cases": closed_cases
    })

@admin_bp.route("/cases", methods=["GET"])
@jwt_required()
def get_all_cases():

    if get_jwt()["role"] != "admin":
        return jsonify({"error": "Access denied"}), 403

    cases = list(db.cases.find())

    for case in cases:
        case["_id"] = str(case["_id"])

        # Add doctor name
        if case.get("doctor_id"):
            doctor = db.users.find_one({"_id": ObjectId(case["doctor_id"])})
            case["doctor_name"] = doctor["name"] if doctor else "Unassigned"
        else:
            case["doctor_name"] = "Unassigned"

    return jsonify(cases)
@admin_bp.route("/all-doctors", methods=["GET"])
@jwt_required()
def get_all_doctors():

    if get_jwt()["role"] != "admin":
        return jsonify({"error": "Access denied"}), 403

    doctors = db.users.find(
        {"role": "doctor"},
        {"password": 0}
    )

    return jsonify([
        {**doc, "_id": str(doc["_id"])}
        for doc in doctors
    ])
@admin_bp.route("/all-patients", methods=["GET"])
@jwt_required()
def get_all_patients():

    if get_jwt()["role"] != "admin":
        return jsonify({"error": "Access denied"}), 403

    patients = db.users.find(
        {"role": "patient"},
        {"password": 0}
    )

    return jsonify([
        {**p, "_id": str(p["_id"])}
        for p in patients
    ])
@admin_bp.route("/case/<case_id>", methods=["GET"])
@jwt_required()
def get_single_case(case_id):

    if get_jwt()["role"] != "admin":
        return jsonify({"error": "Access denied"}), 403

    case = db.cases.find_one({"_id": ObjectId(case_id)})

    if not case:
        return jsonify({"error": "Case not found"}), 404

    case["_id"] = str(case["_id"])

    if case.get("doctor_id"):
        doctor = db.users.find_one({"_id": ObjectId(case["doctor_id"])})
        case["doctor_name"] = doctor["name"] if doctor else "Unassigned"
    else:
        case["doctor_name"] = "Unassigned"

    return jsonify(case)