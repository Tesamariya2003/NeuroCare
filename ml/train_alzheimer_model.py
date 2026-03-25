import pandas as pd
import numpy as np
import pickle

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import accuracy_score, classification_report, roc_auc_score

from imblearn.over_sampling import SMOTE

DATASET_PATH = "ml/dataset/alzheimer.csv"   # change name if needed
df = pd.read_csv(DATASET_PATH)

print("Dataset Loaded Successfully")
print(df.head())
print(df.info())

df = df.drop(columns=["PatientID", "DoctorInCharge"])

print("\nColumns after cleanup:")
print(df.columns)

X = df.drop("Diagnosis", axis=1)
y = df["Diagnosis"]

print("\nClass distribution before balancing:")
print(y.value_counts())

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

smote = SMOTE(random_state=42)
X_train, y_train = smote.fit_resample(X_train, y_train)

print("\nClass distribution after SMOTE:")
print(pd.Series(y_train).value_counts())

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    random_state=42,
    class_weight="balanced"
)

model.fit(X_train, y_train)

y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

accuracy = accuracy_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_prob)

print("\n================ MODEL PERFORMANCE ================")
print("Accuracy:", round(accuracy, 4))
print("\nClassification Report:")
print(classification_report(y_test, y_pred))
print("ROC AUC Score:", round(roc_auc, 4))

MODEL_PATH = "ml/alzheimer_model.pkl"
SCALER_PATH = "ml/alzheimer_scaler.pkl"

pickle.dump(model, open(MODEL_PATH, "wb"))
pickle.dump(scaler, open(SCALER_PATH, "wb"))

print("\nAlzheimer Model & Scaler Saved Successfully!")
