import requests
import time
from pathlib import Path

MISSING = [
    {"common_name": "Snow Leopard", "scientific_name": "Panthera uncia", "taxon_id": 41498},
    {"common_name": "Wild Boar", "scientific_name": "Sus scrofa", "taxon_id": 41978},
    {"common_name": "Nilgiri Tahr", "scientific_name": "Nilgiritragus hylocrius", "taxon_id": 74874},
]

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


for species in MISSING:
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
    while collected < 80 and page <= max_pages:
        try:
            observations = fetch_observations(sci_name, per_page=100, page=page)
            if not observations:
                print(f"  No observations on page {page}")
                break
            for obs in observations:
                if collected >= 80:
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
