from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path
from typing import Any

import kagglehub

BACKEND_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BACKEND_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
OUTPUT_PATH = DATA_DIR / "tarot_deck.json"

DATASET_ID = "lsind18/tarot-json"
DECK_VERSION = "1.0.0"
EXPECTED_CARD_COUNT = 78
MAJOR_COUNT = 22
MINOR_COUNT = 56
SUIT_NAMES = ("wands", "cups", "swords", "pentacles")
CARDS_PER_SUIT = 14
COURT_RANKS = {"page": 11, "knight": 12, "queen": 13, "king": 14}


class ImportValidationError(ValueError):
    pass


def fetch_raw() -> Path:
    downloaded = Path(kagglehub.dataset_download(DATASET_ID))
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    copied: list[Path] = []
    for source in sorted(downloaded.rglob("*.json")):
        if source.is_file():
            target = RAW_DIR / source.name
            shutil.copy2(source, target)
            copied.append(target)
    if not copied:
        raise ImportValidationError(f"no files found in kagglehub download: {downloaded}")
    return downloaded


def find_deck_file(raw_dir: Path = RAW_DIR) -> Path:
    for candidate in sorted(raw_dir.glob("*.json")):
        payload = json.loads(candidate.read_text(encoding="utf-8"))
        entries = payload.get("cards") if isinstance(payload, dict) else payload
        has_meanings = isinstance(entries, list) and entries and "meanings" in entries[0]
        if isinstance(entries, list) and has_meanings:
            return candidate
    raise ImportValidationError(f"no deck json with card 'meanings' found in {raw_dir}")


def report_license(downloaded: Path, deck_file: Path) -> None:
    print(f"[license] kagglehub cache dir: {downloaded}")
    for file in sorted(downloaded.rglob("*")):
        if file.is_file():
            print(f"[license] dataset file: {file.name}")
        if file.is_file() and file.stem.lower().startswith("licen"):
            print(f"[license] LICENSE FILE FOUND: {file}")
            print(file.read_text(encoding="utf-8", errors="replace")[:2000])
    payload = json.loads(deck_file.read_text(encoding="utf-8"))
    if isinstance(payload, dict):
        for key, value in payload.items():
            if "license" in key.lower() or "credit" in key.lower() or "source" in key.lower():
                print(f"[license] embedded metadata {key}: {str(value)[:500]}")
    else:
        print("[license] deck file is a bare array; no embedded metadata")


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def normalize_arcana(raw_arcana: str) -> str:
    normalized = raw_arcana.strip().lower()
    if normalized.startswith("major"):
        return "major"
    if normalized.startswith("minor"):
        return "minor"
    raise ImportValidationError(f"unknown arcana value: {raw_arcana!r}")


def normalize_suit(raw_suit: str | None, arcana: str) -> str | None:
    if arcana == "major":
        return None
    normalized = (raw_suit or "").strip().lower()
    if normalized in SUIT_NAMES:
        return normalized
    raise ImportValidationError(f"unknown suit value: {raw_suit!r}")


def normalize_rank(name: str, raw_number: str, arcana: str, suit: str | None) -> int:
    text = (raw_number or "").strip()
    if text.isdigit():
        value = int(text)
    else:
        first_word = name.split(maxsplit=1)[0].lower()
        if first_word not in COURT_RANKS:
            raise ImportValidationError(
                f"cannot derive rank for card {name!r} (number={raw_number!r})"
            )
        value = COURT_RANKS[first_word]
    if arcana == "major":
        if not 0 <= value <= 21:
            raise ImportValidationError(f"major arcana rank out of range: {name!r}={value}")
        return value
    if suit is None or not 1 <= value <= CARDS_PER_SUIT:
        raise ImportValidationError(f"minor arcana rank invalid: {name!r}={value}")
    return value


def _clean_strings(values: Any) -> list[str]:
    if not isinstance(values, list):
        return []
    return [stripped for item in values if isinstance(item, str) and (stripped := item.strip())]


def _clean_text(value: Any) -> str | None:
    if isinstance(value, str):
        stripped = value.strip()
        return stripped or None
    return None


def transform_card(raw: dict[str, Any]) -> dict[str, Any]:
    name = _clean_text(raw.get("name"))
    if name is None:
        raise ImportValidationError(f"card missing name: {raw!r}")
    arcana = normalize_arcana(str(raw.get("arcana", "")))
    suit = normalize_suit(raw.get("suit"), arcana)
    rank = normalize_rank(name, str(raw.get("number", "")), arcana, suit)
    meanings = raw.get("meanings")
    if not isinstance(meanings, dict):
        raise ImportValidationError(f"{name!r}: missing meanings object")
    upright = _clean_strings(meanings.get("light"))
    reversed_meanings = _clean_strings(meanings.get("shadow"))
    keywords = _clean_strings(raw.get("keywords"))
    if not keywords:
        raise ImportValidationError(f"{name!r}: no keywords")
    if not upright:
        raise ImportValidationError(f"{name!r}: no upright (light) meanings")
    if not reversed_meanings:
        raise ImportValidationError(f"{name!r}: no reversed (shadow) meanings")
    return {
        "id": slugify(name),
        "name": name,
        "arcana": arcana,
        "suit": suit,
        "rank": rank,
        "keywords": keywords,
        "upright": {"meanings": upright},
        "reversed": {"meanings": reversed_meanings},
        "fortune_telling": _clean_strings(raw.get("fortune_telling")),
        "archetype": _clean_text(raw.get("Archetype")),
        "elemental": _clean_text(raw.get("Elemental")),
        "questions_to_ask": _clean_strings(raw.get("Questions to Ask")),
    }


def validate_deck(cards: list[dict[str, Any]]) -> None:
    if len(cards) != EXPECTED_CARD_COUNT:
        raise ImportValidationError(f"expected {EXPECTED_CARD_COUNT} cards, got {len(cards)}")
    ids = [card["id"] for card in cards]
    names = [card["name"] for card in cards]
    if len(set(ids)) != len(ids):
        raise ImportValidationError("duplicate card ids")
    if len(set(names)) != len(names):
        raise ImportValidationError("duplicate card names")
    majors = [card for card in cards if card["arcana"] == "major"]
    minors = [card for card in cards if card["arcana"] == "minor"]
    if len(majors) != MAJOR_COUNT:
        raise ImportValidationError(f"expected {MAJOR_COUNT} major arcana, got {len(majors)}")
    if len(minors) != MINOR_COUNT:
        raise ImportValidationError(f"expected {MINOR_COUNT} minor arcana, got {len(minors)}")
    major_ranks = sorted(card["rank"] for card in majors)
    if major_ranks != list(range(MAJOR_COUNT)):
        raise ImportValidationError(f"major ranks not 0..21: {major_ranks}")
    for suit in SUIT_NAMES:
        suited = [card for card in minors if card["suit"] == suit]
        if len(suited) != CARDS_PER_SUIT:
            raise ImportValidationError(
                f"suit {suit}: expected {CARDS_PER_SUIT} cards, got {len(suited)}"
            )
        ranks = sorted(card["rank"] for card in suited)
        if ranks != list(range(1, CARDS_PER_SUIT + 1)):
            raise ImportValidationError(f"suit {suit} ranks not 1..14: {ranks}")


def main() -> int:
    downloaded = fetch_raw()
    deck_file = find_deck_file()
    print(f"[import] source file: {deck_file}")
    report_license(downloaded, deck_file)
    payload = json.loads(deck_file.read_text(encoding="utf-8"))
    entries = payload.get("cards") if isinstance(payload, dict) else payload
    cards = [transform_card(entry) for entry in entries]
    validate_deck(cards)
    canonical = {
        "version": DECK_VERSION,
        "source": {"dataset": DATASET_ID, "format": "tarot-json"},
        "cards": cards,
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    serialized = json.dumps(canonical, indent=2, ensure_ascii=False) + "\n"
    OUTPUT_PATH.write_text(serialized, encoding="utf-8")
    print(f"[import] wrote {len(cards)} cards -> {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
