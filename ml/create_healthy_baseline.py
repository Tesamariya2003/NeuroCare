import pandas as pd
import numpy as np

# Correct path
df = pd.read_csv("ml/dataset/parkinsons.csv")

healthy = df[df["status"] == 0]

X_healthy = healthy.drop(["name", "status"], axis=1).values

healthy_mean = X_healthy.mean(axis=0)
healthy_std = X_healthy.std(axis=0)

np.save("ml/healthy_mean.npy", healthy_mean)
np.save("ml/healthy_std.npy", healthy_std)

print("Healthy baseline generated successfully")
print("Feature count:", healthy_mean.shape)
