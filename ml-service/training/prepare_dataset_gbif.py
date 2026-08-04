import requests
import time
from pathlib import Path

SPECIES_LIST = [
    {"common_name": "Asiatic Lion", "scientific_name": "Panthera leo persica"},
    {"common_name": "Bengal Tiger", "scientific_name": "Panthera tigris tigris"},
    {"common_name": "Gharial", "scientific_name": "Gavialis gangeticus"},
    {"common_name": "Golden Jackal", "scientific_name": "Canis aureus"},
    {"common_name": "Great Indian Bustard", "scientific_name": "Ardeotis nigriceps"},
    {"common_name": "Himalayan Monal", "scientific_name": "Lophophorus impejanus"},
    {"common_name": "Indian Elephant", "scientific_name": "Elephas maximus indicus"},
    {"common_name": "Indian Gazelle", "scientific_name": "Gazella bennettii"},
    {"common_name": "Indian Peafowl", "scientific_name": "Pavo cristatus"},
    {"common_name": "Indian Rhinoceros", "scientific_name": "Rhinoceros unicornis"},
    {"common_name": "Indian Rock Python", "scientific_name": "Python molurus"},
    {"common_name": "Indian Wolf", "scientific_name": "Canis lupus pallipes"},
    {"common_name": "King Cobra", "scientific_name": "Ophiophagus hannah"},
    {"common_name": "Mugger Crocodile", "scientific_name": "Crocodylus palustris"},
    {"common_name": "Nilgiri Tahr", "scientific_name": "Nilgiritragus hylocrius"},
    {"common_name": "Sambar Deer", "scientific_name": "Rusa unicolor"},
    {"common_name": "Sloth Bear", "scientific_name": "Melursus ursinus"},
    {"common_name": "Snow Leopard", "scientific_name": "Panthera uncia"},
    {"common_name": "Spotted Deer", "scientific_name": "Axis axis"},
    {"common_name": "Wild Boar", "scientific_name": "Sus scrofa"},
]

IMAGES_PER_SPECIES = 100
OUTPUT_DIR = Path("datasets/species")
TRAIN_DIR = OUTPUT_DIR / "train"
VAL_DIR = OUTPUT_DIR / "val"
HEADERS = {"User-Agent": "CanopyML/1.0 (conservation research)"}


def get_gbif_key(scientific_name):
    url = "https://api.gbif.org/v1/species/search"
    params = {"q": scientific_name, "rank": "SPECIES", "limit": 1}
    resp = requests.get(url, params=params, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    results = resp.json().get("results", [])
    if results:
        return results[0].get("key")
    return None


def fetch_gbif_images(species_key, limit=100):
    url = "https://api.gbif.org/v1/occurrence/search"
    params = {
        "taxon_key": species_key,
        "media_type": "StillImage",
        "limit": min(limit, 300),
        "fields": "media",
    }
    resp = requests.get(url, params=params, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    images = []
    for occ in data.get("results", []):
        for media in occ.get("media", []):
            img_url = media.get("identifier")
            if img_url and img_url not in images:
                images.append(img_url)
            if len(images) >= limit:
                break
        if len(images) >= limit:
            break
    return images


def download_image(url, dest):
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        dest.write_bytes(resp.content)
        return True
    except Exception as e:
        print(f"  Failed to download {url}: {e}")
        return False


def prepare_dataset():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    TRAIN_DIR.mkdir(parents=True, exist_ok=True)
    VAL_DIR.mkdir(parents=True, exist_ok=True)

    for species in SPECIES_LIST:
        name = species["common_name"].replace(" ", "_")
        print(f"\nResolving GBIF key for {species['common_name']}...")
        gbif_key = get_gbif_key(species["scientific_name"])
        if not gbif_key:
            print(f"  No GBIF key found, skipping")
            continue
        print(f"  GBIF key: {gbif_key}")

        train_species_dir = TRAIN_DIR / name
        val_species_dir = VAL_DIR / name
        train_species_dir.mkdir(parents=True, exist_ok=True)
        val_species_dir.mkdir(parents=True, exist_ok=True)

        try:
            image_urls = fetch_gbif_images(gbif_key, limit=IMAGES_PER_SPECIES)
            print(f"  Found {len(image_urls)} images")
        except Exception as e:
            print(f"  Error fetching from GBIF: {e}")
            continue

        collected = 0
        for img_url in image_urls:
            if collected >= IMAGES_PER_SPECIES:
                break
            is_val = (collected % 5 == 0)
            dest = (val_species_dir if is_val else train_species_dir) / f"{name}_{collected}.jpg"
            if download_image(img_url, dest):
                collected += 1
            time.sleep(0.2)

        print(f"  Downloaded {collected} images")


if __name__ == "__main__":
    prepare_dataset()
