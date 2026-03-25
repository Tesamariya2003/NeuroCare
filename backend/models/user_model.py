from datetime import datetime
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from config.db import db


class UserModel:

    @staticmethod
    def create_user(name, email, password, role="patient", doctor_details=None):

        # Prevent invalid roles
        if role not in ["patient", "doctor"]:
            return None, "Invalid role"

        # Check if user already exists
        existing = db.users.find_one({"email": email})
        if existing:
            return None, "User already exists"

        hashed_pw = generate_password_hash(password)

        user_data = {
            "name": name,
            "email": email,
            "password": hashed_pw,
            "role": role,
            "created_at": datetime.utcnow()
        }

        # 👨‍⚕️ If Doctor, add verification + professional fields
        if role == "doctor" and doctor_details:

            user_data.update({
                "specialization": doctor_details.get("specialization"),
                "experience": doctor_details.get("experience"),
                "license_number": doctor_details.get("license_number"),
                "qualification": doctor_details.get("qualification"),

                # Doctor starts unverified
                "verified": False,
                "verification_status": "pending"
            })

        # Insert into DB
        result = db.users.insert_one(user_data)
        user_data["_id"] = str(result.inserted_id)

        return user_data, None


    @staticmethod
    def authenticate(email, password):
        user = db.users.find_one({"email": email})
        if not user:
            return None

        if check_password_hash(user["password"], password):
            user["_id"] = str(user["_id"])
            return user

        return None


    @staticmethod
    def get_user_by_id(user_id):
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if user:
            user["_id"] = str(user["_id"])
            return user
        return None