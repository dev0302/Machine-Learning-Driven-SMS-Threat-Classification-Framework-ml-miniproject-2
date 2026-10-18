"""Text preprocessing shared by notebook-trained ScamLens model and API."""

import os
import re

import nltk

NLTK_DATA_PATH = os.path.join(os.path.dirname(__file__), "nltk_data")
nltk.data.path.insert(0, NLTK_DATA_PATH)

from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer

# Keep these words because they can carry important spam/scam intent.
KEEP_WORDS = {"now", "free", "not", "no", "you", "your", "to", "call", "stop"}
URL_PATTERN = re.compile(r"(https?://\S+|www\.\S+)", flags=re.IGNORECASE)
MONEY_PATTERN = re.compile(r"[£$€₹]\s?\d+[\d,.]*")
PHONE_PATTERN = re.compile(r"\+?\d[\d\s\-]{8,}\d")
NUMBER_PATTERN = re.compile(r"\b\d+\b")

_STEMMER = PorterStemmer()


def _get_stop_words() -> set[str]:
    """Load the same English stop-word set used during notebook training."""
    try:
        words = set(stopwords.words("english"))
    except LookupError as exc:
        raise RuntimeError(
            "NLTK stopwords are missing. Run: "
            "python -m nltk.downloader stopwords punkt punkt_tab"
        ) from exc
    return words - KEEP_WORDS


def transform_text(text: str) -> str:
    """Apply the notebook's exact text-cleaning and stemming sequence."""
    text = str(text).lower()

    # Replace these patterns before tokenization, just as in the notebook.
    text = URL_PATTERN.sub(" urltoken ", text)
    text = MONEY_PATTERN.sub(" moneytoken ", text)
    text = PHONE_PATTERN.sub(" phonetoken ", text)
    text = NUMBER_PATTERN.sub(" numtoken ", text)

    try:
        words = nltk.word_tokenize(text)
    except LookupError as exc:
        raise RuntimeError(
            "NLTK tokenizer data is missing. Run: "
            "python -m nltk.downloader stopwords punkt punkt_tab"
        ) from exc

    words = [word for word in words if word.isalnum()]
    stop_words = _get_stop_words()
    words = [word for word in words if word not in stop_words]
    words = [_STEMMER.stem(word) for word in words]

    return " ".join(words)


def extract_features(text: str) -> dict:
    """Extract human-readable message indicators; not used by the current classifier."""
    text = str(text)
    words = text.split()

    return {
        "char_count": len(text),
        "word_count": len(words),
        "digit_count": sum(char.isdigit() for char in text),
        "uppercase_count": sum(char.isupper() for char in text),
        "special_char_count": sum(
            not char.isalnum() and not char.isspace() for char in text
        ),
        "exclamation_count": text.count("!"),
        "question_count": text.count("?"),
        "url_count": len(URL_PATTERN.findall(text)),
        "has_url": int(bool(URL_PATTERN.search(text))),
        "has_email": int(bool(re.search(r"[\w.-]+@[\w.-]+\.\w+", text))),
        "has_phone": int(bool(PHONE_PATTERN.search(text))),
        "has_money_symbol": int(any(symbol in text for symbol in ["₹", "$", "€", "£"])),
    }
