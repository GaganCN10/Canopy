import requests

names = ['Panthera tigris', 'Rhinoceros unicornis', 'Panthera uncia', 'Sus scrofa']
for name in names:
    try:
        r = requests.get('https://api.gbif.org/v1/species/search', params={'q': name, 'rank': 'SPECIES'}, timeout=30)
        data = r.json()
        results = data.get('results', [])
        if results:
            t = results[0]
            print(f"{name}: key={t.get('key')}, name={t.get('scientificName')}, vernacular={t.get('vernacularName')}")
        else:
            print(f"{name}: NOT FOUND")
    except Exception as e:
        print(f"{name}: ERROR - {e}")
