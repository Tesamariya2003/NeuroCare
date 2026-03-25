from config.db import db
from datetime import datetime
from bson import ObjectId


class CaseModel:

    # -------------------------
    # Create Case (Patient)
    # -------------------------
    @staticmethod
    def create_case(patient_id, doctor_id, name, age, gender,email,contact_number ,subject, symptoms,duration, severity, description ,follow_up_answers ):

     case = {
        "patient_id": patient_id,
        "doctor_id": doctor_id,

        "name": name,
        "age": age,
        "gender": gender,
        "email": email,
        "contact_number": contact_number,

        "subject": subject,
        "symptoms": symptoms,
        "duration": duration,
        "severity": severity,
        "description": description,
        "follow_up_answers": follow_up_answers,

        "suspected_disease": None,

        "available_tests": None,
        "selected_test": None,

        "test_file": None,
        "clinical_features": None,
        "cognitive_form": None,
        "mmse_score": None,

        "mmse_slots": None,
        "selected_mmse_slot": None,
        "reschedule_request": None,

        "ai_result": None,

        "final_diagnosis": None,
        "doctor_notes": None,

        "status": "submitted",

        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

     result = db.cases.insert_one(case)
     case["_id"] = str(result.inserted_id)

     return case
    # -------------------------
    # Get Cases for Patient
    # -------------------------
    @staticmethod
    def get_patient_cases(patient_id):

        cases = list(db.cases.find({"patient_id": patient_id}))

        for case in cases:
            case["_id"] = str(case["_id"])

            # Hide sensitive/internal fields
            case.pop("doctor_id", None)
            case.pop("clinical_features", None)
            case.pop("cognitive_form", None)
            case.pop("mmse_score", None)
            case.pop("reschedule_request", None)

            # IMPORTANT:
            # Do NOT remove available_tests, selected_test, mmse_slots
            # because patient workflow depends on them.

            # Hide AI result unless case is closed
            if case.get("status") != "closed":
                case.pop("ai_result", None)
                case.pop("final_diagnosis", None)
                case.pop("doctor_notes", None)
            else:
                if case.get("ai_result") and isinstance(case["ai_result"], dict):
                    case["ai_result"].pop("probability", None)

        return cases   # ✅ moved outside loop


    # -------------------------
    # Get All Cases (Doctor)
    # -------------------------
    @staticmethod
    def get_all_cases():

        cases = list(db.cases.find())

        for case in cases:
            case["_id"] = str(case["_id"])

        return cases


    # -------------------------
    # Get Single Case
    # -------------------------
    @staticmethod
    def get_case_by_id(case_id):

        case = db.cases.find_one({"_id": ObjectId(case_id)})

        if case:
            case["_id"] = str(case["_id"])

        return case


    # -------------------------
    # Update Case
    # -------------------------
    @staticmethod
    def update_case(case_id, update_data):

        update_data["updated_at"] = datetime.utcnow()

        db.cases.update_one(
            {"_id": ObjectId(case_id)},
            {"$set": update_data}
        )