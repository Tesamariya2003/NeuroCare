from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.user_model import UserModel

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


# -----------------------------------------
# 📝 Register
# -----------------------------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "patient")

    # ❌ Prevent public admin registration
    if role == "admin":
        return jsonify({"error": "Admin registration not allowed"}), 403

    if not name or not email or not password:
        return jsonify({"error": "All fields required"}), 400

    doctor_details = None

    # 👨‍⚕️ Doctor Registration Fields
    if role == "doctor":
        specialization = data.get("specialization")
        experience = data.get("experience")
        license_number = data.get("license_number")
        qualification = data.get("qualification")

        if not specialization or not experience or not license_number:
            return jsonify({
                "error": "Doctor details incomplete"
            }), 400

        doctor_details = {
            "specialization": specialization,
            "experience": int(experience),
            "license_number": license_number,
            "qualification": qualification,
        }

    user, error = UserModel.create_user(
        name,
        email,
        password,
        role,
        doctor_details
    )

    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "message": "User registered successfully",
        "user": user
    }), 201


# -----------------------------------------
# 🔐 Login
# -----------------------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = UserModel.authenticate(email, password)

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    # Include role + verified in JWT
    access_token = create_access_token(
        identity=str(user["_id"]),
        additional_claims={
            "role": user["role"],
            "verified": user.get("verified", True)
        }
    )

    return jsonify({
        "message": "Login successful",
        "token": access_token,
        "user": user
    })