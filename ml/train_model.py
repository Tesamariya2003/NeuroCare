import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.calibration import CalibratedClassifierCV
from imblearn.over_sampling import SMOTE

df = pd.read_csv("ml/dataset/parkinsons.csv")

# Remove unreliable features
drop_cols = [
    "name",
    "status",
    "NHR",
    "HNR",
    "RPDE",
    "DFA",
    "spread1",
    "spread2",
    "D2",
    "PPE"
]

X = df.drop(columns=drop_cols)
y = df["status"]

print("Using features:", X.columns.tolist())

# Balance
smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X, y)

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X_resampled, y_resampled,
    test_size=0.2,
    random_state=42,
    stratify=y_resampled
)

# Scale
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Train
base_svm = SVC(kernel="rbf", class_weight="balanced")
model = CalibratedClassifierCV(base_svm, cv=5)
model.fit(X_train, y_train)

# Save
pickle.dump(model, open("ml/model.pkl", "wb"))
pickle.dump(scaler, open("ml/scaler.pkl", "wb"))

print("Model retrained successfully with reduced features!")
