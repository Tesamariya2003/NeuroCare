import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

csv_path = os.path.join(BASE_DIR, "..", "..", "ml", "dataset", "parkinsons.csv")

df = pd.read_csv(csv_path)

print("UCI Feature Order:")
print(list(df.drop(["name", "status"], axis=1).columns))
