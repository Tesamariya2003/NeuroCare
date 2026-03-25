from flask import Blueprint, request, jsonify
import numpy as np
import os
import pickle
from werkzeug.utils import secure_filename
from pydub import AudioSegment
import pdfplumber
import re

from utils.praat_audio_features import extract_praat_features, format_to_uci

AudioSegment.converter = "ffmpeg"

parkinsons_bp = Blueprint("parkinsons", __name__)

# ======================================================
# PATH SETUP
# ======================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "..", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ======================================================
# LOAD MODELS
# ======================================================

AUDIO_MODEL_PATH = os.path.join(BASE_DIR, "..", "..", "ml", "audio_model.pkl")
AUDIO_SCALER_PATH = os.path.join(BASE_DIR, "..", "..", "ml", "audio_scaler.pkl")

audio_model = pickle.load(open(AUDIO_MODEL_PATH, "rb"))
audio_scaler = pickle.load(open(AUDIO_SCALER_PATH, "rb"))

MODEL_PATH = os.path.join(BASE_DIR, "..", "..", "ml", "model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "..", "..", "ml", "scaler.pkl")

feature_model = pickle.load(open(MODEL_PATH, "rb"))
feature_scaler = pickle.load(open(SCALER_PATH, "rb"))

# ======================================================
# HEALTHY BASELINE
# ======================================================

HEALTHY_MEAN_PATH = os.path.join(BASE_DIR, "..", "..", "ml", "healthy_mean.npy")
HEALTHY_STD_PATH = os.path.join(BASE_DIR, "..", "..", "ml", "healthy_std.npy")

healthy_mean = np.load(HEALTHY_MEAN_PATH)
healthy_std = np.load(HEALTHY_STD_PATH)

# ======================================================
# AUDIO STANDARDIZATION
# ======================================================

def preprocess_audio(filepath):

    print("Processing file:", filepath)

    ext = filepath.lower().split(".")[-1]

    # ✅ IMPORTANT: DO NOT TOUCH WAV (dataset files)
    if ext == "wav":
        print("WAV detected → using original")
        return filepath

    try:
        print("Converting non-wav file...")

        audio = AudioSegment.from_file(filepath)

        audio = audio.set_channels(1)
        audio = audio.set_frame_rate(44100)

        clean_path = filepath.rsplit(".", 1)[0] + "_clean.wav"

        audio.export(clean_path, format="wav")

        print("Converted to:", clean_path)

        return clean_path

    except Exception as e:
        print("Audio preprocessing failed:", e)
        return None

# ======================================================
# SHARED AUDIO PREDICTION FUNCTION
# ======================================================

def process_and_predict(filepath):

    clean_path = preprocess_audio(filepath)
    if clean_path is None:
        return None

    raw = extract_praat_features(clean_path)

    print("Extracted features:", raw)

    if raw is None:
        return None

    features = format_to_uci(raw)
    features = np.array(features).reshape(1, -1)

    print("Features for model:", features)

    features_scaled = audio_scaler.transform(features)

    prob = audio_model.predict_proba(features_scaled)[0][1]

    print("Predicted probability:", prob)

    return float(prob)

# ======================================================
# HEALTHY DEVIATION CALCULATION
# ======================================================

def healthy_distance(features):

    z = (features - healthy_mean) / (healthy_std + 1e-6)
    z = np.clip(z, -5, 5)

    return np.linalg.norm(z)

def deviation_decision(deviation):

    if deviation < 6:
        return "Low", "Voice Pattern Within Healthy Range"

    elif deviation < 10:
        return "Moderate", "Mild Voice Deviation Detected – Further Evaluation Recommended"

    else:
        return "High", "Strong Parkinson-like Voice Pattern Detected"

# ======================================================
# DIRECT FEATURE API
# ======================================================

@parkinsons_bp.route("/predict-features", methods=["POST"])
def predict_features():

    data = request.json

    if not data or "features" not in data:
        return jsonify({"error": "No features provided"}), 400

    try:
        features = np.array(data["features"], dtype=float)
    except:
        return jsonify({"error": "Invalid feature format"}), 400

    deviation = healthy_distance(features)

    risk_level, decision = deviation_decision(deviation)

    return jsonify({
        "prediction": decision,
        "risk_level": risk_level,
        "healthy_deviation_score": round(float(deviation), 2),
        "note": "Statistical voice deviation screening. Not a medical diagnosis."
    })

# ======================================================
# AUDIO TESTING ROUTE (POSTMAN)
# ======================================================

@parkinsons_bp.route("/predict-audio", methods=["POST"])
def predict_audio():

    files = request.files.getlist("audio")

    if not files:
        return jsonify({"error": "No audio files uploaded"}), 400

    scores = []

    for file in files:

        path = os.path.join(UPLOAD_FOLDER, secure_filename(file.filename))
        file.save(path)

        prob = process_and_predict(path)

        if prob is None:
            continue

        scores.append(prob)

    if len(scores) == 0:
        return jsonify({"error": "Feature extraction failed"}), 400

    final_prob = float(np.mean(scores))

    if final_prob >= 0.7:
        decision = "High Risk of Parkinson’s"
        risk_level = "High"

    elif final_prob >= 0.5:
        decision = "Moderate Risk – Further Evaluation Recommended"
        risk_level = "Moderate"

    else:
        decision = "Likely Healthy Voice Pattern"
        risk_level = "Low"

    return jsonify({
        "prediction": decision,
        "risk_level": risk_level,
        "parkinson_probability": round(final_prob, 3),
        "samples_used": len(scores),
        "note": "Audio-trained SVM screening model. Not a medical diagnosis."
    })
@parkinsons_bp.route("/predict-audio-browser", methods=["POST"])
def predict_audio_browser():

    file = request.files.get("audio")

    if not file:
        return jsonify({"error": "No audio uploaded"}), 400

    path = os.path.join(UPLOAD_FOLDER, secure_filename(file.filename))
    file.save(path)

    # 🔥 FORCE conversion (browser specific)
    try:
        audio = AudioSegment.from_file(path)
        audio = audio.set_channels(1)
        audio = audio.set_frame_rate(44100)

        clean_path = path.rsplit(".", 1)[0] + "_browser.wav"
        audio.export(clean_path, format="wav")

    except Exception as e:
        return jsonify({"error": f"Conversion failed: {str(e)}"}), 400

    # 🔥 Extract + Predict
    raw = extract_praat_features(clean_path)

    if raw is None:
        return jsonify({"error": "Feature extraction failed"}), 400

    features = format_to_uci(raw)
    features = np.array(features).reshape(1, -1)

    features_scaled = audio_scaler.transform(features)

    prob = audio_model.predict_proba(features_scaled)[0][1]

    # 🔥 Slight compensation for browser noise
    prob = min(prob + 0.1, 1.0)

    # 🔥 Decision
    if prob >= 0.7:
        decision = "High Risk of Parkinson’s"
        risk_level = "High"

    elif prob >= 0.5:
        decision = "Moderate Risk"
        risk_level = "Moderate"

    else:
        decision = "Low Risk"
        risk_level = "Low"

    return jsonify({
        "prediction": decision,
        "risk_level": risk_level,
        "parkinson_probability": round(prob, 3),
        "note": "Browser audio adjusted prediction"
    })
# ======================================================
# WORKFLOW FUNCTION USED BY CASE SYSTEM
# ======================================================

def run_parkinsons_audio(case):

    filepath = os.path.join(UPLOAD_FOLDER, case["test_file"])

    try:

        print("Processing audio for workflow:", filepath)

        prob = process_and_predict(filepath)

        if prob is None:
            return {
                "disease": "Parkinson’s",
                "prediction": "Analysis Failed",
                "probability": 0,
                "severity": "Unknown",
                "recommendation": "Feature extraction failed.",
                "model_used": "Audio SVM Model"
            }

        if prob >= 0.7:
            prediction = "High Risk of Parkinson’s"
            severity = "High"
            recommendation = "Strong voice irregularities detected."

        elif prob >= 0.5:
            prediction = "Moderate Risk"
            severity = "Moderate"
            recommendation = "Voice deviation detected."

        else:
            prediction = "Low Risk"
            severity = "Low"
            recommendation = "Voice pattern within healthy range."

        return {
            "disease": "Parkinson’s",
            "prediction": prediction,
            "probability": round(prob, 3),
            "severity": severity,
            "recommendation": recommendation,
            "model_used": "Audio SVM Model"
        }

    except Exception as e:

        print("PARKINSON AUDIO ERROR:", str(e))

        return {
            "disease": "Parkinson’s",
            "prediction": "Analysis Failed",
            "probability": 0,
            "severity": "Unknown",
            "recommendation": str(e),
            "model_used": "Audio SVM Model"
        }

# ======================================================
# FEATURE MODEL WORKFLOW
# ======================================================

def run_parkinsons_features(case):

    if not case.get("clinical_features"):
        raise ValueError("Clinical features missing")

    features = np.array(case["clinical_features"], dtype=float)

    deviation = healthy_distance(features)

    risk_level, decision = deviation_decision(deviation)
    probability = min(deviation / 12, 1.0)

    if risk_level == "Low":
        severity = "Low"
        prediction = "Low Risk"

    elif risk_level == "Moderate":
        severity = "Moderate"
        prediction = "Moderate Risk"

    else:
        severity = "High"
        prediction = "High Risk of Parkinson’s"

    return {
        "disease": "Parkinson’s",
        "prediction": prediction,
        "probability": round(probability, 3), 
        "deviation_score": round(float(deviation), 2),
        "severity": severity,
        "recommendation": decision,
        "model_used": "Statistical Healthy Deviation Model"
    }

# ======================================================
# PDF FEATURE EXTRACTION
# ======================================================

def extract_parkinson_features_from_pdf(filepath):

    try:

        text = ""

        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                content = page.extract_text()
                if content:
                    text += content + "\n"

        feature_names = [
            "MDVP:Fo(Hz)", "MDVP:Fhi(Hz)", "MDVP:Flo(Hz)",
            "MDVP:Jitter(%)", "MDVP:Jitter(Abs)", "MDVP:RAP",
            "MDVP:PPQ", "Jitter:DDP",
            "MDVP:Shimmer", "MDVP:Shimmer(dB)",
            "Shimmer:APQ3", "Shimmer:APQ5", "MDVP:APQ",
            "Shimmer:DDA",
            "NHR", "HNR",
            "RPDE", "DFA",
            "spread1", "spread2", "D2", "PPE"
        ]

        extracted = []

        for name in feature_names:

            pattern = rf"{re.escape(name)}\s*:\s*(-?\d+\.?\d*)"

            match = re.search(pattern, text)

            if match:
                extracted.append(float(match.group(1)))
            else:
                print(f"Missing feature: {name}")
                return None

        return extracted

    except Exception as e:
        print("PDF extraction error:", e)
        return None

# ======================================================
# FEATURE DESCRIPTIONS
# ======================================================

FEATURE_DESCRIPTIONS = {
    "MDVP:Fo(Hz)": "Average vocal frequency",
    "MDVP:Fhi(Hz)": "Maximum vocal frequency",
    "MDVP:Flo(Hz)": "Minimum vocal frequency",
    "MDVP:Jitter(%)": "Frequency variation",
    "MDVP:Jitter(Abs)": "Absolute jitter",
    "MDVP:RAP": "Relative amplitude perturbation",
    "MDVP:PPQ": "Pitch perturbation quotient",
    "Jitter:DDP": "Jitter difference of differences",
    "MDVP:Shimmer": "Amplitude variation",
    "MDVP:Shimmer(dB)": "Amplitude variation in dB",
    "Shimmer:APQ3": "Amplitude perturbation quotient 3",
    "Shimmer:APQ5": "Amplitude perturbation quotient 5",
    "MDVP:APQ": "Amplitude perturbation quotient",
    "Shimmer:DDA": "Difference of amplitude differences",
    "NHR": "Noise to harmonic ratio",
    "HNR": "Harmonic to noise ratio",
    "RPDE": "Recurrence period density entropy",
    "DFA": "Detrended fluctuation analysis",
    "spread1": "Fundamental frequency variation",
    "spread2": "Second frequency variation",
    "D2": "Correlation dimension",
    "PPE": "Pitch period entropy"
}

# ======================================================
# EXPORT HELPERS
# ======================================================

def get_feature_descriptions():
    return FEATURE_DESCRIPTIONS

def get_feature_unit(feature_name):

    if "Hz" in feature_name:
        return "Hz"

    elif "%" in feature_name:
        return "%"

    elif "dB" in feature_name:
        return "dB"

    else:
        return "dimensionless"