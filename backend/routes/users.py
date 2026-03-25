# routes/users.py
from flask import Blueprint, request, jsonify

users_bp = Blueprint("users", __name__)

@users_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    return jsonify({
        "status": "success",
        "role": data.get("role", "patient"),
        "message": "Login successful"
    })

@users_bp.route("/request-test", methods=["POST"])
def request_test():
    data = request.json

    return jsonify({
        "status": "request_sent",
        "requested_test": data.get("test_type"),
        "assigned_doctor": "Pending doctor review"
    })

@users_bp.route("/doctor-review", methods=["POST"])
def doctor_review():
    data = request.json

    return jsonify({
        "final_decision": data.get("decision"),
        "remarks": data.get("remarks"),
        "follow_up": data.get("follow_up"),
        "status": "Report sent to patient"
    })
