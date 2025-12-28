import os
import onnxruntime as ort
import numpy as np
from PIL import Image

# --------------------------------------------------
# Paths
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "convnext_khana.onnx")
LABEL_PATH = os.path.join(BASE_DIR, "model", "labels.txt")

# --------------------------------------------------
# Load labels
# --------------------------------------------------
with open(LABEL_PATH, "r", encoding="utf-8") as f:
    LABELS = [line.strip() for line in f if line.strip()]

# --------------------------------------------------
# Load ONNX model
# --------------------------------------------------
session = ort.InferenceSession(
    MODEL_PATH,
    providers=["CPUExecutionProvider"]
)

input_name = session.get_inputs()[0].name

# --------------------------------------------------
# Preprocessing (MATCH TRAINING EXACTLY)
# --------------------------------------------------
def preprocess(image: Image.Image):
    # Resize + Center Crop
    image = image.resize((256, 256))
    w, h = image.size
    left = (w - 224) // 2
    top = (h - 224) // 2
    image = image.crop((left, top, left + 224, top + 224))

    # Convert to float32
    image = np.array(image).astype(np.float32) / 255.0

    # ImageNet normalization (FORCE float32)
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std  = np.array([0.229, 0.224, 0.225], dtype=np.float32)

    image = (image - mean) / std

    # HWC → CHW
    image = image.transpose(2, 0, 1)

    # 🔴 CRITICAL: ensure float32
    image = image.astype(np.float32)

    return np.expand_dims(image, axis=0)

# --------------------------------------------------
# Prediction
# --------------------------------------------------
def predict(image: Image.Image):
    inp = preprocess(image)

    outputs = session.run(None, {input_name: inp})

    probs = outputs[0]

    # Handle ONNX output shapes safely
    if probs.ndim == 2:
        probs = probs[0]
    elif probs.ndim != 1:
        raise ValueError(f"Unexpected output shape: {probs.shape}")

    # Apply softmax to convert logits → probabilities
    exp_probs = np.exp(probs - np.max(probs))
    softmax_probs = exp_probs / np.sum(exp_probs)

    idx = int(np.argmax(softmax_probs))
    confidence = float(softmax_probs[idx])


    return LABELS[idx], confidence
