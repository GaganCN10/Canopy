import re


def load_keywords():
    return [
        'ivory', 'tusk', 'rhino horn', 'pangolin', 'tiger bone', 'leopard skin',
        'bear bile', 'elephant tail', 'shark fin', 'turtle shell', 'coral',
        'eagle', 'falcon', 'parrot', 'tortoise', 'snake venom', 'lizard skin',
        'endangered', 'threatened', 'protected species', ' CITES', 'wildlife trafficking',
        'poached', 'smuggled', 'illegal wildlife trade', 'exotic pet', 'traditional medicine',
        'taxidermy', 'rug', 'jacket', 'belt', 'medicine', 'powder', 'oil',
        'endangered species', 'protected animal', 'wildlife product', 'animal part',
    ]


def simple_classify(text: str):
    keywords = load_keywords()
    text_lower = text.lower()
    matches = [kw for kw in keywords if kw.lower() in text_lower]
    confidence = min(0.95, 0.3 + len(matches) * 0.15)
    is_flagged = len(matches) >= 1 and confidence >= 0.45
    return {
        'is_flagged': is_flagged,
        'confidence': float(confidence),
        'matched_keywords': matches,
        'text_length': len(text),
    }


def scan_text(text: str, source: str = ''):
    if not text or not text.strip():
        return {'is_flagged': False, 'confidence': 0.0, 'matched_keywords': [], 'text_length': 0, 'source': source}

    result = simple_classify(text)
    result['source'] = source
    return result
