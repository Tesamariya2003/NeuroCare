from flask import Blueprint, request, jsonify
import numpy as np
import pickle
import os

alzheimer_bp = Blueprint("alzheimer", __name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "..", "ml", "alzheimer_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "..", "..", "ml", "alzheimer_scaler.pkl")

model = pickle.load(open(MODEL_PATH, "rb"))
scaler = pickle.load(open(SCALER_PATH, "rb"))

# EXACT order used during training
FEATURE_ORDER = [
    "Age","Gender","Ethnicity","EducationLevel","BMI","Smoking",
    "AlcoholConsumption","PhysicalActivity","DietQuality","SleepQuality",
    "FamilyHistoryAlzheimers","CardiovascularDisease","Diabetes","Depression",
    "HeadInjury","Hypertension","SystolicBP","DiastolicBP",
    "CholesterolTotal","CholesterolLDL","CholesterolHDL","CholesterolTriglycerides",
    "MMSE","FunctionalAssessment","MemoryComplaints","BehavioralProblems",
    "ADL","Confusion","Disorientation","PersonalityChanges",
    "DifficultyCompletingTasks","Forgetfulness"
]

@alzheimer_bp.route("/predict", methods=["POST"])
def predict_alzheimer():
    try:
        # ✅ FIX: define data FIRST
        data = request.json
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Build feature vector safely
        features = []
        for col in FEATURE_ORDER:
            features.append(float(data.get(col, 0)))

        X = np.array(features).reshape(1, -1)
        X_scaled = scaler.transform(X)

        probability = model.predict_proba(X_scaled)[0][1]

        if probability >= 0.65:
            result = "High Risk of Alzheimer’s"
        elif probability <= 0.40:
            result = "Low Risk"
        else:
            result = "Moderate Risk – Further Evaluation Recommended"

        return jsonify({
            "prediction": result,
            "alzheimer_probability": round(float(probability), 3),
            "note": "This is a clinical decision support output, not a diagnosis."
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def run_alzheimer_analysis(case):

    questionnaire = case.get("cognitive_form")
    mmse = case.get("mmse_score")

    if questionnaire is None or mmse is None:
        raise ValueError("MMSE score or cognitive form missing")

    input_data = {
        "Age": case.get("age", 65),
        "Gender": case.get("gender", 0),
        "Ethnicity": 0,
        "EducationLevel": case.get("education", 2),
        "BMI": 25,
        "Smoking": 0,
        "AlcoholConsumption": 1,
        "PhysicalActivity": 2,
        "DietQuality": 2,
        "SleepQuality": 2,
        "FamilyHistoryAlzheimers": case.get("family_history", 0),
        "CardiovascularDisease": 0,
        "Diabetes": case.get("diabetes", 0),
        "Depression": case.get("depression", 0),
        "HeadInjury": 0,
        "Hypertension": case.get("hypertension", 0),
        "SystolicBP": 120,
        "DiastolicBP": 80,
        "CholesterolTotal": 180,
        "CholesterolLDL": 100,
        "CholesterolHDL": 50,
        "CholesterolTriglycerides": 120,
        "MMSE": mmse,
        "FunctionalAssessment": questionnaire["FunctionalAssessment"],
        "MemoryComplaints": questionnaire["MemoryComplaints"],
        "BehavioralProblems": questionnaire["BehavioralProblems"],
        "ADL": questionnaire["ADL"],
        "Confusion": questionnaire["Disorientation"],
        "Disorientation": questionnaire["Disorientation"],
        "PersonalityChanges": questionnaire["BehavioralProblems"],
        "DifficultyCompletingTasks": questionnaire["FunctionalAssessment"],
        "Forgetfulness": questionnaire["MemoryComplaints"],
    }

    features = [float(input_data[col]) for col in FEATURE_ORDER]

    X = np.array(features).reshape(1, -1)
    X_scaled = scaler.transform(X)

    probability = model.predict_proba(X_scaled)[0][1]

    if probability >= 0.65:
        severity = "High"
        prediction = "High Risk of Alzheimer’s"
    elif probability >= 0.40:
        severity = "Moderate"
        prediction = "Moderate Risk"
    else:
        severity = "Low"
        prediction = "Low Risk"

    return {
        "disease": "Alzheimer’s",
        "prediction": prediction,
        "probability": round(probability * 100, 2),
        "severity": severity,
        "recommendation": "Further neurological evaluation recommended.",
        "model_used": "RandomForest + SMOTE Model"
    }