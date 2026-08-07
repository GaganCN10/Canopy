import os
import random
from pathlib import Path

import numpy as np
from scipy.io.wavfile import write as wav_write

random.seed(42)
np.random.seed(42)

OUTPUT_DIR = Path("datasets/threat_audio")
TRAIN_DIR = OUTPUT_DIR / "train"
VAL_DIR = OUTPUT_DIR / "val"
CLASS_NAMES = ["non_threat", "threat"]
SAMPLE_RATE = 16000
DURATION_SECONDS = 2.0
SAMPLES_PER_CLASS = 80
VAL_SPLIT = 0.2


def generate_non_threat(length):
    t = np.linspace(0, DURATION_SECONDS, length, endpoint=False)
    freqs = random.choice([200, 400, 600, 800, 1000])
    signal = 0.3 * np.sin(2 * np.pi * freqs * t)
    signal += 0.05 * np.random.randn(length)
    envelope = np.ones_like(t)
    attack = int(0.1 * length)
    release = int(0.1 * length)
    envelope[:attack] = np.linspace(0, 1, attack)
    envelope[-release:] = np.linspace(1, 0, release)
    signal = signal * envelope
    return (np.clip(signal, -1.0, 1.0) * 32767).astype(np.int16)


def generate_threat(length):
    t = np.linspace(0, DURATION_SECONDS, length, endpoint=False)
    base = 0.4 * np.sin(2 * np.pi * random.choice([80, 120, 160]) * t)
    burst = np.zeros_like(t)
    burst_start = random.randint(length // 4, 3 * length // 4)
    burst_end = min(burst_start + random.randint(2000, 6000), length)
    burst[burst_start:burst_end] = 0.8 * np.random.randn(burst_end - burst_start)
    signal = base + burst
    return (np.clip(signal, -1.0, 1.0) * 32767).astype(np.int16)


GENERATORS = {
    "non_threat": generate_non_threat,
    "threat": generate_threat,
}


def prepare_dataset():
    length = int(SAMPLE_RATE * DURATION_SECONDS)
    TRAIN_DIR.mkdir(parents=True, exist_ok=True)
    VAL_DIR.mkdir(parents=True, exist_ok=True)

    for cls in CLASS_NAMES:
        (TRAIN_DIR / cls).mkdir(parents=True, exist_ok=True)
        (VAL_DIR / cls).mkdir(parents=True, exist_ok=True)

        train_count = int(SAMPLES_PER_CLASS * (1 - VAL_SPLIT))
        val_count = SAMPLES_PER_CLASS - train_count

        print(f"Generating {cls}: {train_count} train, {val_count} val")

        for i in range(train_count):
            signal = GENERATORS[cls](length)
            wav_write(str(TRAIN_DIR / cls / f"{cls}_{i}.wav"), SAMPLE_RATE, signal)

        for i in range(val_count):
            signal = GENERATORS[cls](length)
            wav_write(str(VAL_DIR / cls / f"{cls}_{i}.wav"), SAMPLE_RATE, signal)

    print("Threat audio dataset preparation complete.")


if __name__ == "__main__":
    prepare_dataset()
