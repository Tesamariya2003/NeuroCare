import os
import random
import shutil

random.seed(42)

BASE = "ml/dataset/ms_dataset"
TRAIN = os.path.join(BASE, "train")
VAL = os.path.join(BASE, "val")

CLASSES = ["control", "ms"]
SPLIT = 0.2  # 20%

for cls in CLASSES:
    train_cls = os.path.join(TRAIN, cls)
    val_cls = os.path.join(VAL, cls)
    os.makedirs(val_cls, exist_ok=True)

    images = [f for f in os.listdir(train_cls) if f.endswith(".png")]
    random.shuffle(images)

    n_val = int(len(images) * SPLIT)
    val_images = images[:n_val]

    for img in val_images:
        shutil.move(
            os.path.join(train_cls, img),
            os.path.join(val_cls, img)
        )

    print(f"{cls}: moved {n_val} images to validation")
