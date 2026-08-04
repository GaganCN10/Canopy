import requests
import time
from pathlib import Path

SPECIES_LIST = [
    {"common_name": "Asiatic Lion", "scientific_name": "Panthera leo persica", "taxon_id": 42044},
    {"common_name": "Bengal Tiger", "scientific_name": "Panthera tigris tigris", "taxon_id": 41802},
    {"common_name": "Gharial", "scientific_name": "Gavialis gangeticus", "taxon_id": 38799},
    {"common_name": "Golden Jackal", "scientific_name": "Canis aureus", "taxon_id": 42096},
    {"common_name": "Great Indian Bustard", "scientific_name": "Ardeotis nigriceps", "taxon_id": 43886},
    {"common_name": "Himalayan Monal", "scientific_name": "Lophophorus impejanus", "taxon_id": 43306},
    {"common_name": "Indian Elephant", "scientific_name": "Elephas maximus indicus", "taxon_id": 43691},
    {"common_name": "Indian Gazelle", "scientific_name": "Gazella bennettii", "taxon_id": 43392},
    {"common_name": "Indian Peafowl", "scientific_name": "Pavo cristatus", "taxon_id": 41737},
    {"common_name": "Indian Rhinoceros", "scientific_name": "Rhinoceros unicornis", "taxon_id": 43307},
    {"common_name": "Indian Rock Python", "scientific_name": "Python molurus", "taxon_id": 39819},
    {"common_name": "Indian Wolf", "scientific_name": "Canis lupus pallipes", "taxon_id": 71380},
    {"common_name": "King Cobra", "scientific_name": "Ophiophagus hannah", "taxon_id": 39822},
    {"common_name": "Mugger Crocodile", "scientific_name": "Crocodylus palustris", "taxon_id": 39438},
    {"common_name": "Nilgiri Tahr", "scientific_name": "Nilgiritragus hylocrius", "taxon_id": 74874},
    {"common_name": "Sambar Deer", "scientific_name": "Rusa unicolor", "taxon_id": 42098},
    {"common_name": "Sloth Bear", "scientific_name": "Melursus ursinus", "taxon_id": 41798},
    {"common_name": "Snow Leopard", "scientific_name": "Panthera uncia", "taxon_id": 41498},
    {"common_name": "Spotted Deer", "scientific_name": "Axis axis", "taxon_id": 42160},
    {"common_name": "Wild Boar", "scientific_name": "Sus scrofa", "taxon_id": 41978},
]

IMAGES_PER_SPECIES = 100
OUTPUT_DIR = Path("datasets/species")
TRAIN_DIR = OUTPUT_DIR / "train"
VAL_DIR = OUTPUT_DIR / "val"
HEADERS = {"User-Agent": "CanopyML/1.0 (conservation research)"}


def fetch_observations(scientific_name, per_page=100, page=1):
    url = "https://api.inaturalist.org/v1/observations"
    params = {
        "scientific_name": scientific_name,
        "per_page": per_page,
        "page": page,
        "photos": "true",
        "geo": "true",
    }
    resp = requests.get(url, headers=HEADERS, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json().get("results", [])


def download_image(url, dest):
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        dest.write_bytes(resp.content)
        return True
    except Exception as e:
        return False


def prepare_dataset():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    TRAIN_DIR.mkdir(parents=True, exist_ok=True)
    VAL_DIR.mkdir(parents=True, exist_ok=True)

    for species in SPECIES_LIST:
        name = species["common_name"].replace(" ", "_")
        sci_name = species["scientific_name"]
        print(f"\nFetching {species['common_name']} ({sci_name})...")

        train_species_dir = TRAIN_DIR / name
        val_species_dir = VAL_DIR / name
        train_species_dir.mkdir(parents=True, exist_ok=True)
        val_species_dir.mkdir(parents=True, exist_ok=True)

        collected = 0
        page = 1
        max_pages = 10
        while collected < IMAGES_PER_SPECIES and page <= max_pages:
            try:
                observations = fetch_observations(sci_name, per_page=100, page=page)
                if not observations:
                    print(f"  No observations on page {page}")
                    break
                for obs in observations:
                    if collected >= IMAGES_PER_SPECIES:
                        break
                    photos = obs.get("photos", [])
                    if not photos:
                        continue
                    photo = photos[0]
                    img_url = photo.get("url", "")
                    if not img_url:
                        continue
                    if img_url.startswith("//"):
                        img_url = "https:" + img_url
                    ext = ".jpg"
                    is_val = (collected % 5 == 0)
                    dest = (val_species_dir if is_val else train_species_dir) / f"{name}_{collected}{ext}"
                    if download_image(img_url, dest):
                        collected += 1
                page += 1
                time.sleep(1)
            except Exception as e:
                print(f"  Error on page {page}: {e}")
                break
        print(f"  Downloaded {collected} images")


if __name__ == "__main__":
    prepare_dataset()
