import os
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

random.seed(42)
np.random.seed(42)

OUTPUT_DIR = Path("datasets/camera_trap")
TRAIN_DIR = OUTPUT_DIR / "train"
VAL_DIR = OUTPUT_DIR / "val"
CLASS_NAMES = ["animal", "person", "vehicle", "blank"]
IMAGES_PER_CLASS = 80
VAL_SPLIT = 0.2


def make_animal_image(size=(224, 224)):
    img = Image.new("RGB", size, color=(34 + random.randint(-20, 20), 85 + random.randint(-20, 20), 34 + random.randint(-20, 20)))
    draw = ImageDraw.Draw(img)
    cx, cy = random.randint(40, size[0] - 40), random.randint(40, size[1] - 40)
    color = (random.randint(120, 200), random.randint(80, 140), random.randint(60, 100))
    draw.ellipse([cx - 30, cy - 20, cx + 30, cy + 20], fill=color)
    draw.ellipse([cx - 10, cy - 35, cx + 10, cy - 15], fill=color)
    draw.line([(cx, cy + 20), (cx - 20, cy + 55), (cx + 20, cy + 55)], fill=color, width=4)
    return img


def make_person_image(size=(224, 224)):
    img = Image.new("RGB", size, color=(random.randint(60, 120), random.randint(60, 120), random.randint(60, 120)))
    draw = ImageDraw.Draw(img)
    cx, cy = random.randint(70, size[0] - 70), random.randint(50, size[1] - 50)
    skin = (random.randint(180, 230), random.randint(140, 190), random.randint(110, 160))
    shirt = (random.randint(40, 100), random.randint(40, 100), random.randint(120, 180))
    draw.ellipse([cx - 12, cy - 35, cx + 12, cy - 10], fill=skin)
    draw.rectangle([cx - 18, cy - 10, cx + 18, cy + 40], fill=shirt)
    draw.rectangle([cx - 8, cy + 40, cx - 3, cy + 70], fill=(random.randint(40, 80), random.randint(40, 80), random.randint(40, 80)))
    draw.rectangle([cx + 3, cy + 40, cx + 8, cy + 70], fill=(random.randint(40, 80), random.randint(40, 80), random.randint(40, 80)))
    return img


def make_vehicle_image(size=(224, 224)):
    img = Image.new("RGB", size, color=(random.randint(90, 130), random.randint(110, 150), random.randint(90, 130)))
    draw = ImageDraw.Draw(img)
    body_color = (random.randint(150, 220), random.randint(20, 60), random.randint(20, 60))
    draw.rectangle([30, size[1] // 2 - 15, size[0] - 30, size[1] // 2 + 15], fill=body_color)
    draw.rectangle([50, size[1] // 2 - 35, size[0] - 50, size[1] // 2 - 15], fill=tuple(min(c + 30, 255) for c in body_color))
    draw.ellipse([40, size[1] // 2 + 5, 65, size[1] // 2 + 30], fill=(20, 20, 20))
    draw.ellipse([size[0] - 65, size[1] // 2 + 5, size[0] - 40, size[1] // 2 + 30], fill=(20, 20, 20))
    return img


def make_blank_image(size=(224, 224)):
    base = random.randint(160, 220)
    img = Image.new("RGB", size, color=(base, base, base))
    draw = ImageDraw.Draw(img)
    for _ in range(20):
        x1, y1 = random.randint(0, size[0]), random.randint(0, size[1])
        x2, y2 = x1 + random.randint(2, 8), y1 + random.randint(2, 8)
        draw.rectangle([x1, y1, x2, y2], fill=(base + random.randint(-10, 10),) * 3)
    return img


GENERATORS = {
    "animal": make_animal_image,
    "person": make_person_image,
    "vehicle": make_vehicle_image,
    "blank": make_blank_image,
}


def prepare_dataset():
    TRAIN_DIR.mkdir(parents=True, exist_ok=True)
    VAL_DIR.mkdir(parents=True, exist_ok=True)

    for cls in CLASS_NAMES:
        (TRAIN_DIR / cls).mkdir(parents=True, exist_ok=True)
        (VAL_DIR / cls).mkdir(parents=True, exist_ok=True)

        train_count = int(IMAGES_PER_CLASS * (1 - VAL_SPLIT))
        val_count = IMAGES_PER_CLASS - train_count

        print(f"Generating {cls}: {train_count} train, {val_count} val")

        for i in range(train_count):
            img = GENERATORS[cls]()
            img.save(TRAIN_DIR / cls / f"{cls}_{i}.jpg")

        for i in range(val_count):
            img = GENERATORS[cls]()
            img.save(VAL_DIR / cls / f"{cls}_{i}.jpg")

    print("Camera trap dataset preparation complete.")


if __name__ == "__main__":
    prepare_dataset()
