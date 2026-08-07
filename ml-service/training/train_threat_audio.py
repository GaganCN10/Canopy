import os
import sys
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import json
import librosa

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.models.threat_audio_model import preprocess_audio, _build_model

DATA_DIR = Path("datasets/threat_audio")
MODEL_DIR = Path("models")
MODEL_DIR.mkdir(parents=True, exist_ok=True)

NUM_CLASSES = 2
BATCH_SIZE = 16
NUM_EPOCHS = 10
LEARNING_RATE = 1e-4
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

CLASS_NAMES = ["non_threat", "threat"]


class ThreatAudioDataset(torch.utils.data.Dataset):
    def __init__(self, root_dir, split="train"):
        self.root = Path(root_dir) / split
        self.files = []
        self.labels = []
        for class_idx, class_name in enumerate(CLASS_NAMES):
            class_dir = self.root / class_name
            if class_dir.exists():
                for f in class_dir.glob("*.wav"):
                    self.files.append(f)
                    self.labels.append(class_idx)

    def __len__(self):
        return len(self.files)

    def __getitem__(self, idx):
        audio_path = self.files[idx]
        y, sr = librosa.load(str(audio_path), sr=16000, mono=True)
        tensor = preprocess_audio(y, sample_rate=sr)
        label = self.labels[idx]
        return tensor, torch.tensor(label, dtype=torch.long)


def get_dataloaders():
    train_dataset = ThreatAudioDataset(DATA_DIR, split="train")
    val_dataset = ThreatAudioDataset(DATA_DIR, split="val")
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=4)
    return train_loader, val_loader


def build_model():
    return _build_model(num_classes=NUM_CLASSES)


def train_one_epoch(model, loader, criterion, optimizer):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    for inputs, targets in loader:
        inputs, targets = inputs.to(DEVICE), targets.to(DEVICE)
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()
        running_loss += loss.item() * inputs.size(0)
        _, predicted = torch.max(outputs, 1)
        correct += (predicted == targets).sum().item()
        total += targets.size(0)
    return running_loss / total, correct / total


def validate(model, loader, criterion):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    with torch.no_grad():
        for inputs, targets in loader:
            inputs, targets = inputs.to(DEVICE), targets.to(DEVICE)
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            running_loss += loss.item() * inputs.size(0)
            _, predicted = torch.max(outputs, 1)
            correct += (predicted == targets).sum().item()
            total += targets.size(0)
    return running_loss / total, correct / total


def main():
    print(f"Using device: {DEVICE}")
    if not (DATA_DIR / "train").exists():
        print("Dataset not found. Run prepare_dataset.py first.")
        return

    train_loader, val_loader = get_dataloaders()
    print(f"Train batches: {len(train_loader)}, Val batches: {len(val_loader)}")

    model = build_model()
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

    best_val_acc = 0.0
    for epoch in range(NUM_EPOCHS):
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer)
        val_loss, val_acc = validate(model, val_loader, criterion)
        print(f"Epoch {epoch+1}/{NUM_EPOCHS} | Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | Val Loss: {val_loss:.4f} Acc: {val_acc:.4f}")
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), MODEL_DIR / "threat_audio_classifier_best.pth")
            with open(MODEL_DIR / "threat_audio_classes.json", "w") as f:
                json.dump(CLASS_NAMES, f)
            print(f"  Saved best model (val_acc={val_acc:.4f})")

    print(f"Training complete. Best val_acc: {best_val_acc:.4f}")


if __name__ == "__main__":
    main()
