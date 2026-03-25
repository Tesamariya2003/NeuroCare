import cv2
import numpy as np

IMG_SIZE = 224   # must match training

def preprocess_mri_image(image_path):
    """
    Preprocess MRI image for MS CNN model
    """
    img = cv2.imread(image_path)
    if img is None:
        return None

    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img / 255.0
    img = np.expand_dims(img, axis=0)

    return img
