from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models.case_model import CaseModel
from werkzeug.utils import secure_filename
from config.db import db
from bson import ObjectId
import os
import uuid

# Disease-specific AI
from routes.alzheimer_mri import run_alzheimer_mri
from routes.alzheimer import run_alzheimer_analysis
from routes.ms import run_ms_analysis
from routes.parkinsons import run_parkinsons_audio, run_parkinsons_features

cases_bp = Blueprint("cases", __name__, url_prefix="/cases")
case_collection = db["cases"]

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ==========================================================
# 🧑 PATIENT SUBMIT CASE
# ==========================================================
@cases_bp.route("/submit", methods=["POST"])
@jwt_required()
def submit_case():
    print("JWT identity:", get_jwt_identity())
    print("JWT claims:", get_jwt())

    # Only patients can submit cases
    if get_jwt()["role"] != "patient":
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()

    name = data.get("name")
    age = data.get("age")
    gender = data.get("gender")
    doctor_id = data.get("doctor_id")
    subject = data.get("subject")
    symptoms = data.get("symptoms")

    # NEW FIELDS
    duration = data.get("duration")
    severity = data.get("severity")
    description = data.get("description")
    email = data.get("email")
    contact_number = data.get("contact_number")
    follow_up_answers = data.get("follow_up_answers", {})

    if (
    not name
    or not age
    or not gender
    or not doctor_id
    or not subject
    or not symptoms
    or not isinstance(symptoms, list)
):
        return jsonify({"error": "Invalid input"}), 400

    case = CaseModel.create_case(
        patient_id=get_jwt_identity(),
        doctor_id=doctor_id,
        name=name,
        age=age,
        gender=gender,
        email=email,
        contact_number=contact_number,
        subject=subject,
        symptoms=symptoms,
        duration=duration,
        severity=severity,
        description=description,
        follow_up_answers=follow_up_answers
    )

    return jsonify({
        "message": "Case submitted successfully",
        "case": case
    }), 201
@cases_bp.route("/<case_id>", methods=["GET"])
@jwt_required()
def get_single_case(case_id):
    case = db.cases.find_one({"_id": ObjectId(case_id)})

    if not case:
        return jsonify({"error": "Case not found"}), 404

    case["_id"] = str(case["_id"])
    return jsonify(case)
# ==========================================================
# 👨‍⚕️ DOCTOR VIEW ALL CASES
# ==========================================================
@cases_bp.route("/all", methods=["GET"])
@jwt_required()
def get_all_cases():
    claims = get_jwt()

    if claims["role"] != "doctor" or not claims.get("verified", False):
       return jsonify({"error": "Access denied"}), 403
    cases = CaseModel.get_all_cases()

    return jsonify(cases), 200

# ==========================================================
# 👨‍⚕️ DOCTOR SET SUSPECTED DISEASE
# ==========================================================
@cases_bp.route("/doctor/suspect/<case_id>", methods=["POST"])
@jwt_required()
def set_suspected_disease(case_id):

    claims = get_jwt()

    if claims["role"] != "doctor" or not claims.get("verified", False):
       return jsonify({"error": "Access denied"}), 403, 403

    case = CaseModel.get_case_by_id(case_id)
    if not case:
        return jsonify({"error": "Case not found"}), 404

    disease = request.json.get("suspected_disease")
    if not disease:
        return jsonify({"error": "Disease required"}), 400

    disease = disease.lower()

    update = {
        "suspected_disease": disease,
        "doctor_id": get_jwt_identity(),
        "selected_test": None
    }

    if disease == "alzheimer":
        update["available_tests"] = ["mri", "cognitive"]
        update["status"] = "awaiting_patient_test_choice"

    elif disease == "parkinsons":
        update["available_tests"] = ["audio", "features"]
        update["status"] = "awaiting_patient_test_choice"

    elif disease == "ms":
        update["available_tests"] = ["mri"]
        update["selected_test"] = "mri"
        update["status"] = "test_requested"
    elif disease == "hemorrhage":
        update["available_tests"] = ["ct_scan"]
        update["selected_test"] = "ct_scan"
        update["status"] = "test_requested"

    else:
        return jsonify({"error": "Unsupported disease"}), 400

    CaseModel.update_case(case_id, update)

    return jsonify({
        "message": "Suspected disease set",
        "available_tests": update.get("available_tests"),
        "status": update.get("status")
    }), 200
# ==========================================================
# 🧑 PATIENT CHOOSE TEST
# ==========================================================
@cases_bp.route("/<case_id>/choose-test", methods=["POST"])
@jwt_required()
def choose_test(case_id):

    if get_jwt()["role"] != "patient":
        return jsonify({"error": "Access denied"}), 403

    case = CaseModel.get_case_by_id(case_id)
    if not case:
        return jsonify({"error": "Case not found"}), 404

    if case.get("status") != "awaiting_patient_test_choice":
        return jsonify({"error": "Test already selected"}), 400

    selected = request.json.get("selected_test")

    if selected not in case.get("available_tests", []):
        return jsonify({"error": "Invalid test option"}), 400

    # 🔥 Smart Status Handling
    if selected == "cognitive":
        new_status = "awaiting_cognitive_form"
    else:
        new_status = "test_requested"

    CaseModel.update_case(case_id, {
        "selected_test": selected,
        "status": new_status
    })

    return jsonify({
        "message": "Test option selected",
        "selected_test": selected,
        "status": new_status
    }), 200
# ==========================================================
# 🧑 PATIENT UPLOAD FILE (MRI / AUDIO)
# ==========================================================
@cases_bp.route("/<case_id>/upload-file", methods=["POST"])
@jwt_required()
def upload_file(case_id):

    claims = get_jwt()

    if claims["role"] != "patient":
        return jsonify({"error": "Access denied"}), 403

    case = CaseModel.get_case_by_id(case_id)
    if not case:
        return jsonify({"error": "Case not found"}), 404

    # 🔒 Ensure patient owns this case
    if case.get("patient_id") != get_jwt_identity():
        return jsonify({"error": "Unauthorized case access"}), 403

    # 🔒 Ensure correct workflow state
    if case.get("status") != "test_requested":
        return jsonify({"error": "File upload not allowed at this stage"}), 400

    selected_test = case.get("selected_test")

    # ✅ NOW allow features also
    if selected_test not in ["mri", "audio", "features","ct_scan"]:
        return jsonify({"error": "Invalid test for file upload"}), 400

    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    filename = secure_filename(file.filename)
    if filename == "":
        return jsonify({"error": "Invalid filename"}), 400

    # ============================
    # 🔍 File Type Validation
    # ============================

    allowed_audio = (".wav", ".mp3", ".webm", ".ogg")
    allowed_images = (".jpg", ".jpeg", ".png")
    allowed_pdf = (".pdf",)

    if selected_test == "audio":
        if not filename.lower().endswith(allowed_audio):
            return jsonify({"error": "Only WAV or MP3 allowed"}), 400

    elif selected_test == "mri":
        if not filename.lower().endswith(allowed_images):
            return jsonify({"error": "Only JPG, JPEG, PNG allowed"}), 400

    elif selected_test == "features":
        if not filename.lower().endswith(allowed_pdf):
            return jsonify({"error": "Only PDF allowed for Parkinson features"}), 400
    elif selected_test == "ct_scan":
        if not filename.lower().endswith(allowed_images):
           return jsonify({"error": "Only JPG, JPEG, PNG allowed for CT scan"}), 400

    # ============================
    # 📦 Unique Filename
    # ============================

    unique_name = f"{uuid.uuid4().hex}_{filename}"
    filepath = os.path.join(UPLOAD_FOLDER, unique_name)

    file.save(filepath)

    # ============================
    # 🧠 Parkinson PDF Extraction
    # ============================

    if case.get("suspected_disease") == "parkinsons" and selected_test == "features":

        from routes.parkinsons import extract_parkinson_features_from_pdf

        features = extract_parkinson_features_from_pdf(filepath)

        if not features:
            return jsonify({"error": "Could not extract features from PDF"}), 400

        CaseModel.update_case(case_id, {
            "clinical_features": features,
            "test_file": unique_name,
            "status": "test_submitted"
        })

        return jsonify({
            "message": "PDF uploaded and features extracted successfully"
        }), 200

    # ============================
    # Normal MRI / Audio Upload
    # ============================

    CaseModel.update_case(case_id, {
        "test_file": unique_name,
        "status": "test_submitted"
    })

    return jsonify({"message": "File uploaded successfully"}), 200
# ==========================================================
# 🧠 PATIENT SUBMIT COGNITIVE FORM
# ==========================================================
@cases_bp.route("/<case_id>/submit-cognitive", methods=["POST"])
@jwt_required()
def submit_cognitive(case_id):

    if get_jwt()["role"] != "patient":
        return jsonify({"error": "Access denied"}), 403

    data = request.json

    required_fields = [
        "MemoryComplaints",
        "FunctionalAssessment",
        "ADL",
        "BehavioralProblems",
        "Disorientation",
        "RepeatingQuestions",
        "MisplacingObjects",
        "AppointmentMemory",
        "GettingLost",
        "PlanningProblems",
        "ConcentrationIssues",
        "age",
        "gender"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400


    # 🧠 Cognitive Score (11 questions)

    questionnaire_total = (
        data["MemoryComplaints"] +
        data["FunctionalAssessment"] +
        data["ADL"] +
        data["BehavioralProblems"] +
        data["Disorientation"] +
        data["RepeatingQuestions"] +
        data["MisplacingObjects"] +
        data["AppointmentMemory"] +
        data["GettingLost"] +
        data["PlanningProblems"] +
        data["ConcentrationIssues"]
    )


    # 🧠 Save case

    CaseModel.update_case(case_id, {

        "cognitive_form": {

            "MemoryComplaints": data["MemoryComplaints"],
            "FunctionalAssessment": data["FunctionalAssessment"],
            "ADL": data["ADL"],
            "BehavioralProblems": data["BehavioralProblems"],
            "Disorientation": data["Disorientation"],

            "RepeatingQuestions": data["RepeatingQuestions"],
            "MisplacingObjects": data["MisplacingObjects"],
            "AppointmentMemory": data["AppointmentMemory"],
            "GettingLost": data["GettingLost"],
            "PlanningProblems": data["PlanningProblems"],
            "ConcentrationIssues": data["ConcentrationIssues"]
        },

        # 🩺 clinical data
        "age": data.get("age"),
        "gender": data.get("gender"),
        "education": data.get("education", 2),
        "family_history": data.get("family_history", 0),
        "hypertension": data.get("hypertension", 0),
        "diabetes": data.get("diabetes", 0),
        "depression": data.get("depression", 0),

        "questionnaire_total": questionnaire_total,
        "status": "awaiting_mmse_slot_selection"
    })


    return jsonify({
        "message": "Cognitive questionnaire submitted",
        "questionnaire_total": questionnaire_total
    }), 200
# ==========================================================
# 🤖 DOCTOR RUN AI
# ==========================================================
@cases_bp.route("/doctor/run-ai/<case_id>", methods=["POST"])
@jwt_required()
def run_ai(case_id):
    claims = get_jwt()

    if claims["role"] != "doctor" or not claims.get("verified", False):
     return jsonify({"error": "Access denied"}), 403, 403

    case = CaseModel.get_case_by_id(case_id)
    if not case:
        return jsonify({"error": "Case not found"}), 404

    if case.get("status") not in ["test_submitted", "mmse_confirmed"]:
        return jsonify({"error": "Test not completed yet"}), 400

    disease = case.get("suspected_disease")
    selected = case.get("selected_test")

    # ================= Alzheimer =================
    if disease == "alzheimer":

        if selected == "mri":
            if not case.get("test_file"):
                return jsonify({"error": "MRI not uploaded"}), 400
            result = run_alzheimer_mri(case)

        elif selected == "cognitive":

           if not case.get("cognitive_form"):
             return jsonify({"error": "Cognitive form not submitted"}), 400

           if case.get("mmse_score") is None:
             return jsonify({"error": "MMSE score required"}), 400

           result = run_alzheimer_analysis(case)

        else:
            return jsonify({"error": "Invalid Alzheimer test"}), 400

    # ================= Parkinson =================
    elif disease == "parkinsons":

        if selected == "audio":
            if not case.get("test_file"):
                return jsonify({"error": "Audio not uploaded"}), 400
            result = run_parkinsons_audio(case)

        elif selected == "features":
            if not case.get("clinical_features"):
                return jsonify({"error": "Clinical features missing"}), 400
            result = run_parkinsons_features(case)

        else:
            return jsonify({"error": "Invalid Parkinson test"}), 400

    # ================= MS =================
    elif disease == "ms":

        if not case.get("test_file"):
            return jsonify({"error": "MRI not uploaded"}), 400

        result = run_ms_analysis(case)
   
    elif disease == "hemorrhage":
      if selected != "ct_scan":
        return jsonify({"error": "Invalid hemorrhage test"}), 400
      if not case.get("test_file"):
        return jsonify({"error": "CT Scan not uploaded"}), 400
      result = run_hemorrhage_analysis(case)

    else:
        return jsonify({"error": "Unsupported disease"}), 400
    

    CaseModel.update_case(case_id, {
        "ai_result": result,
        "severity": result.get("severity"),
        "status": "ai_completed"
    })

    return jsonify({"message": "AI analysis complete", "result": result}), 200
# ==========================================================
# 👨‍⚕️ DOCTOR SUBMITS MMSE SCORE
# ==========================================================
@cases_bp.route("/doctor/set-mmse-slots/<case_id>", methods=["POST"])
@jwt_required()
def set_mmse_slots(case_id):
    claims = get_jwt()
    if claims["role"] != "doctor" or not claims.get("verified", False):
        return jsonify({"error": "Access denied"}), 403

    data = request.json
    slots = data.get("mmse_slots")

    if not slots or not isinstance(slots, list):
        return jsonify({"error": "MMSE slots list required"}), 400

    CaseModel.update_case(case_id, {
        "mmse_slots": slots,
        "selected_mmse_slot": None,  # Reset if re-scheduling
        "status": "awaiting_mmse_slot_selection"
    })
    return jsonify({"message": "MMSE slots published successfully"}), 200

# ==========================================================
# 🧑 PATIENT SELECT MMSE SLOT
# ==========================================================
@cases_bp.route("/<case_id>/select-mmse-slot", methods=["POST"])
@jwt_required()
def select_mmse_slot(case_id):
    if get_jwt()["role"] != "patient":
        return jsonify({"error": "Access denied"}), 403

    data = request.json
    selected = data.get("selected_slot")

    case = CaseModel.get_case_by_id(case_id)
    if not case or selected not in case.get("mmse_slots", []):
        return jsonify({"error": "Invalid slot selected"}), 400

    CaseModel.update_case(case_id, {
        "selected_mmse_slot": selected,
        "status": "mmse_confirmed"
    })
    return jsonify({"message": "Appointment confirmed", "selected_slot": selected}), 200
# ==========================================================
# 👨‍⚕️ DOCTOR REVIEWS RESULT
# ==========================================================
@cases_bp.route("/doctor/review/<case_id>", methods=["POST"])
@jwt_required()
def doctor_review(case_id):
    claims = get_jwt()

    if claims["role"] != "doctor" or not claims.get("verified", False):
     return jsonify({"error": "Access denied"}), 403
    notes = request.json.get("doctor_notes")

    CaseModel.update_case(case_id, {
        "doctor_notes": notes,
        "status": "reviewed"
    })

    return jsonify({"message": "Review saved"}), 200
# ==========================================================
# 🧠 DOCTOR SCHEDULES MMSE TEST
# ==========================================================
#@cases_bp.route("/<case_id>/schedule-mmse", methods=["POST"])
@jwt_required()
def schedule_mmse(case_id):

    claims = get_jwt()
    if claims["role"] != "doctor":
        return jsonify({"error": "Only doctor can schedule MMSE"}), 403

    data = request.get_json()
    appointment_date = data.get("appointment_date")

    if not appointment_date:
        return jsonify({"error": "Appointment date required"}), 400

    case = CaseModel.get_case_by_id(case_id)
    if not case:
        return jsonify({"error": "Case not found"}), 404

    if case.get("selected_test") != "cognitive":
        return jsonify({"error": "MMSE only for cognitive test path"}), 400

    CaseModel.update_case(case_id, {
        "mmse_scheduled_date": appointment_date,
        "status": "mmse_scheduled"
    })

    return jsonify({
        "message": "MMSE scheduled successfully",
        "appointment_date": appointment_date
    }), 200

# ==========================================================
# 🏥 DOCTOR FINALIZES CASE
# ==========================================================
@cases_bp.route("/doctor/finalize/<case_id>", methods=["POST"])
@jwt_required()
def finalize_case(case_id):

    claims = get_jwt()

    if claims["role"] != "doctor" or not claims.get("verified", False):
     return jsonify({"error": "Access denied"}), 403, 403

    case = CaseModel.get_case_by_id(case_id)
    if not case:
        return jsonify({"error": "Case not found"}), 404

    if case.get("status") != "reviewed":
        return jsonify({"error": "Case must be reviewed before finalizing"}), 400

    final_diagnosis = request.json.get("final_diagnosis")
    notes = request.json.get("doctor_notes")

    if not final_diagnosis:
        return jsonify({"error": "Final diagnosis required"}), 400

    CaseModel.update_case(case_id, {
        "final_diagnosis": final_diagnosis,
        "doctor_notes": notes,
        "report_ready": True,   # 🔥 important
        "status": "closed"
    })

    return jsonify({"message": "Case finalized and report generated"}), 200
@cases_bp.route("/my-cases", methods=["GET"])
@jwt_required()
def my_cases():

    user_id = get_jwt_identity()
    role = get_jwt()["role"]

    if role != "patient":
        return jsonify({"error": "Access denied"}), 403

    cases = CaseModel.get_patient_cases(user_id)
    return jsonify(cases), 200
#@cases_bp.route("/<case_id>/request-mmse-reschedule", methods=["POST"])
@jwt_required()
def request_mmse_reschedule(case_id):

    if get_jwt()["role"] != "patient":
        return jsonify({"error": "Access denied"}), 403

    data = request.json
    preferred = data.get("preferred_date")

    if not preferred:
        return jsonify({"error": "Preferred date required"}), 400

    CaseModel.update_case(case_id, {
        "reschedule_request": preferred,
        "status": "mmse_reschedule_requested"
    })

    return jsonify({"message": "Reschedule request sent"})
#@cases_bp.route("/doctor/approve-mmse/<case_id>", methods=["POST"])
@jwt_required()
def approve_mmse(case_id):

    if get_jwt()["role"] != "doctor":
        return jsonify({"error": "Access denied"}), 403

    case = CaseModel.get_case_by_id(case_id)

    if not case or not case.get("reschedule_request"):
        return jsonify({"error": "No reschedule request found"}), 400

    approved_date = case["reschedule_request"]

    CaseModel.update_case(case_id, {
        "selected_mmse_slot": approved_date,
        "reschedule_request": None,
        "status": "mmse_confirmed"
    })

    return jsonify({"message": "MMSE reschedule approved"})
# ==========================================================
# 👨‍⚕️ DOCTOR SUBMIT MMSE SCORE
# ==========================================================
@cases_bp.route("/doctor/submit-mmse/<case_id>", methods=["POST"])
@jwt_required()
def submit_mmse(case_id):
    claims = get_jwt()

    if claims["role"] != "doctor" or not claims.get("verified", False):
     return jsonify({"error": "Access denied"}), 403, 403

    data = request.get_json()
    mmse_score = data.get("mmse_score")

    if mmse_score is None:
        return jsonify({"error": "MMSE score required"}), 400

    case = CaseModel.get_case_by_id(case_id)
    if not case:
        return jsonify({"error": "Case not found"}), 404

    CaseModel.update_case(case_id, {
        "mmse_score": mmse_score,
        "status": "test_submitted"
    })

    return jsonify({"message": "MMSE score submitted"}), 200

@cases_bp.route("/assign/<case_id>/<doctor_id>", methods=["PUT"])
@jwt_required()
def assign_case(case_id, doctor_id):

    if get_jwt()["role"] != "admin":
        return jsonify({"error": "Access denied"}), 403

    db.cases.update_one(
        {"_id": ObjectId(case_id)},
        {"$set": {"doctor_id": str(doctor_id)}}  # force string
    )

    return jsonify({"message": "Case assigned"})

@cases_bp.route("/doctor/reopen/<case_id>", methods=["POST"])
def reopen_case(case_id):
    case = cases_collection.find_one({"_id": ObjectId(case_id)})

    if not case:
        return {"error": "Case not found"}, 404

    if case.get("status") == "finalized":
        return {"error": "Finalized cases cannot be reopened"}, 400

    cases_collection.update_one(
        {"_id": ObjectId(case_id)},
        {"$set": {"status": "ai_completed"}}
    )

    return {"message": "Case reopened successfully"}, 200
