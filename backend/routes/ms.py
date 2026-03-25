from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from tensorflow.keras.models import load_model

from utils.ms_preprocess import preprocess_mri_image

ms_bp = Blueprint("ms", __name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "..", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

MODEL_PATH = os.path.join(BASE_DIR, "..", "..", "ml", "ms_model.h5")

model = load_model(MODEL_PATH)

@ms_bp.route("/predict-ms", methods=["POST"])
def predict_ms():
    if "image" not in request.files:
        return jsonify({"error": "MRI image not uploaded"}), 400

    file = request.files["image"]
    filename = secure_filename(file.filename)

    if not filename.lower().endswith((".jpg", ".png", ".jpeg")):
        return jsonify({"error": "Invalid image format"}), 400

    image_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(image_path)

    image = preprocess_mri_image(image_path)
    if image is None:
        return jsonify({"error": "Invalid MRI image"}), 400

    probability = float(model.predict(image)[0][0])

    # Decision thresholds
    if probability >= 0.70:
        result = "High Risk of Multiple Sclerosis"
    elif probability <= 0.40:
        result = "Low Risk"
    else:
        result = "Moderate Risk – Further Evaluation Recommended"

    return jsonify({
        "prediction": result,
        "ms_probability": round(probability, 3),
        "note": "This is a clinical decision support output, not a diagnosis."
    })
# =====================================================
# INTERNAL FUNCTION FOR CASE WORKFLOW (NOT API ROUTE)
# =====================================================
def run_ms_analysis(case):

    filename = case.get("test_file")

    if not filename:
        raise ValueError("MRI file missing")

    filepath = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(filepath):
        raise ValueError("MRI file not found on server")

    image = preprocess_mri_image(filepath)

    if image is None:
        raise ValueError("Invalid MRI image")

    probability = float(model.predict(image)[0][0])

    # Decision logic
    if probability >= 0.70:
        prediction = "High Risk of Multiple Sclerosis"
        severity = "High"
        recommendation = (
            "MRI patterns suggest demyelinating lesions. "
            "Neurology consultation and further imaging recommended."
        )
    elif probability <= 0.40:
        prediction = "Low Risk"
        severity = "Low"
        recommendation = (
            "MRI does not show strong indicators of MS. "
            "Clinical monitoring advised."
        )
    else:
        prediction = "Moderate Risk"
        severity = "Moderate"
        recommendation = (
            "Possible early MS-related patterns detected. "
            "Further neurological evaluation recommended."
        )

    return {
        "disease": "Multiple Sclerosis",
        "prediction": prediction,
        "probability": round(probability, 4),
        "severity": severity,
        "recommendation": recommendation,
        "model_used": "MS CNN MRI Model"
    }