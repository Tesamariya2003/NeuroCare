import numpy as np
import os
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from flask import Blueprint
alzheimer_mri_bp = Blueprint("alzheimer_mri", __name__)
# -------- PATH SETUP --------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "..",
    "..",
    "ml",
    "alzheimer_mri_model.h5"
)

model = load_model(MODEL_PATH)

IMG_SIZE = 224


# ==========================================================
# 🤖 INTERNAL MRI FUNCTION (Used by cases.py)
# ==========================================================
def run_alzheimer_mri(case):

    filename = case.get("test_file")

    if not filename:
        raise ValueError("MRI file not found")

    filepath = os.path.join("uploads", filename)

    if not os.path.exists(filepath):
        raise ValueError("MRI file does not exist on server")

    # Preprocess
    img = image.load_img(filepath, target_size=(IMG_SIZE, IMG_SIZE))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array)[0][0]

    if prediction < 0.5:
        result = "Alzheimer-related Impairment Detected"
        confidence = float(1 - prediction)
        severity = "High Risk"
        recommendation = (
            "MRI findings suggest cognitive impairment. "
            "Clinical consultation with a neurologist is strongly recommended."
        )
    else:
        result = "No Significant Impairment Detected"
        confidence = float(prediction)
        severity = "Low Risk"
        recommendation = (
            "MRI analysis does not indicate signs of Alzheimer-related impairment. "
            "Regular monitoring is advised."
        )

    confidence = round(confidence, 4)

    return {
        "disease": "Alzheimer’s",
        "prediction": result,
        "confidence": confidence,
        "severity": severity,
        "recommendation": recommendation,
        "model_used": "Alzheimer MRI Binary CNN"
    }