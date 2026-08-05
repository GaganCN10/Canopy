import pytest
from app.models.trade_scanner_model import simple_classify, scan_text


def test_simple_classify_clean_text():
    result = simple_classify("The quick brown fox jumps over the lazy dog")
    assert result["is_flagged"] is False
    assert result["confidence"] == pytest.approx(0.3)
    assert result["matched_keywords"] == []
    assert result["text_length"] > 0


def test_simple_classify_single_match():
    result = simple_classify("ivory tusk for sale")
    assert result["is_flagged"] is True
    assert len(result["matched_keywords"]) >= 1
    assert "ivory" in result["matched_keywords"]


def test_simple_classify_multiple_matches():
    result = simple_classify("Illegal wildlife trade involving ivory and tiger bone")
    assert result["is_flagged"] is True
    assert len(result["matched_keywords"]) >= 2
    assert result["confidence"] > 0.45


def test_simple_classify_empty_text():
    result = simple_classify("")
    assert result["is_flagged"] is False
    assert result["confidence"] == pytest.approx(0.3)
    assert result["matched_keywords"] == []
    assert result["text_length"] == 0


def test_simple_classify_case_insensitive():
    result = simple_classify("IVORY TUSK RHINO HORN")
    assert result["is_flagged"] is True
    assert len(result["matched_keywords"]) >= 1


def test_simple_classify_confidence_cap():
    long_flagged = " ".join(["ivory"] * 50)
    result = simple_classify(long_flagged)
    assert result["confidence"] <= 0.95


def test_scan_text_normal():
    result = scan_text("This is a normal text about nature", source="web")
    assert result["is_flagged"] is False
    assert result["source"] == "web"


def test_scan_text_flagged():
    result = scan_text("Selling ivory tusks", source="market")
    assert result["is_flagged"] is True
    assert result["source"] == "market"
    assert "ivory" in result["matched_keywords"]
    assert "tusk" in result["matched_keywords"]


def test_scan_text_empty():
    result = scan_text("", source="web")
    assert result["is_flagged"] is False
    assert result["confidence"] == 0.0
    assert result["matched_keywords"] == []
    assert result["text_length"] == 0
    assert result["source"] == "web"


def test_scan_text_whitespace_only():
    result = scan_text("   \n\t  ", source="api")
    assert result["is_flagged"] is False
    assert result["confidence"] == 0.0
    assert result["matched_keywords"] == []
    assert result["text_length"] == 0
