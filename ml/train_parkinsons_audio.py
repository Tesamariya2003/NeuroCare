import sys
import os
import numpy as np
import pickle

# 🔹 Add backend to path (important for import)
sys.path.append(os.path.abspath("backend"))

from utils.praat_audio_features import extract_praat_features, format_to_uci

from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import classification_report, accuracy_score


# ===============================
# 🔹 DATASET PATHS
# ===============================

HC_PATH = "ml/dataset/HC_AH"
PD_PATH = "ml/dataset/PD_AH"

data = []
labels = []

print("Extracting Healthy samples...")

for root, dirs, files in os.walk(HC_PATH):
    for file in files:
        if file.lower().endswith(".wav"):
            path = os.path.join(root, file)
            raw = extract_praat_features(path)
            if raw:
                features = format_to_uci(raw)
                data.append(features)
                labels.append(0)

print("Extracting Parkinson samples...")

for root, dirs, files in os.walk(PD_PATH):
    for file in files:
        if file.lower().endswith(".wav"):
            path = os.path.join(root, file)
            raw = extract_praat_features(path)
            if raw:
                features = format_to_uci(raw)
                data.append(features)
                labels.append(1)

X = np.array(data)
y = np.array(labels)

print("\nTotal samples:", len(X))
print("Healthy:", sum(y == 0))
print("Parkinson:", sum(y == 1))

if len(X) == 0:
    raise ValueError("No audio features extracted. Check dataset paths.")


# ===============================
# 🔹 5-FOLD CROSS VALIDATION
# ===============================

from sklearn.model_selection import GridSearchCV

pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("svm", SVC(probability=True))
])

param_grid = {
    "svm__C": [0.1, 1, 10, 50, 100],
    "svm__gamma": ["scale", 0.01, 0.1, 1],
    "svm__kernel": ["rbf"]
}

grid = GridSearchCV(
    pipeline,
    param_grid,
    cv=5,
    scoring="accuracy"
)

grid.fit(X, y)

print("Best Params:", grid.best_params_)
print("Best CV Accuracy:", grid.best_score_)


# ===============================
# 🔹 FINAL TRAINING ON FULL DATA
# ===============================

print("\nTraining final model on full dataset...")

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = SVC(kernel="rbf", C=10, gamma="scale", probability=True)
model.fit(X_scaled, y)

# Save model
pickle.dump(model, open("ml/audio_model.pkl", "wb"))
pickle.dump(scaler, open("ml/audio_scaler.pkl", "wb"))

print("\nAudio-based Parkinson model saved successfully!")