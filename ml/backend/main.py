"""Minimal FastAPI inference server for the ScamLens ML model."""

from contextlib import asynccontextmanager
from pathlib import Path
import pickle

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from features import extract_features, transform_text

# models/ is a sibling of backend/, both inside the ml/ directory.
ML_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = ML_DIR / "models" / "scamlens_model.pkl"

# LabelEncoder in the notebook encodes classes alphabetically:
# 0 = ham, 1 = smishing, 2 = spam.
LABELS = {0: "ham", 1: "smishing", 2: "spam"}
_model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the trained model once when the API starts."""
    global _model

    if not MODEL_PATH.exists():
        raise RuntimeError(
            f"Trained model not found at {MODEL_PATH}. "
            "Run the notebook's final model-saving cell first."
        )

    # Only load trusted pickle files created by your own notebook.
    with MODEL_PATH.open("rb") as model_file:
        _model = pickle.load(model_file)

    yield

    _model = None


app = FastAPI(
    title="ScamLens ML API",
    description="Classifies SMS messages using the trained ScamLens model.",
    version="1.0.0",
    lifespan=lifespan,
)

# Local development origins for the Next.js frontend.
# Add your deployed frontend URL here when you deploy.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    """Request body expected from the frontend."""

    text: str = Field(..., min_length=1, max_length=10_000)


class PredictionResponse(BaseModel):
    """Stable response format for the frontend."""

    label: str
    class_id: int
    confidence: float | None
    probabilities: dict[str, float] | None
    features: dict


@app.get("/health")
def health_check():
    """Simple endpoint for checking whether the API is running."""
    return {"status": "ok", "model_loaded": _model is not None}


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    """Preprocess one message and return the model's prediction."""
    if _model is None:
        raise HTTPException(status_code=503, detail="The ML model is not loaded.")

    original_text = request.text.strip()
    if not original_text:
        raise HTTPException(status_code=422, detail="Message text cannot be blank.")

    # The model was trained on transformed_text, so inference must use the same
    # preprocessing before passing the message into the saved TF-IDF pipeline.
    cleaned_text = transform_text(original_text)

    try:
        prediction = int(_model.predict([cleaned_text])[0])
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail="The model could not process this message."
        ) from exc

    if prediction not in LABELS:
        raise HTTPException(status_code=500, detail="The model returned an unknown class.")

    probabilities = None
    confidence = None

    # Logistic Regression supports predict_proba; keep this defensive in case
    # the selected model changes later.
    if hasattr(_model, "predict_proba"):
        raw_probabilities = _model.predict_proba([cleaned_text])[0]
        probabilities = {
            LABELS[int(class_id)]: round(float(probability), 4)
            for class_id, probability in zip(_model.classes_, raw_probabilities)
            if int(class_id) in LABELS
        }
        confidence = round(float(max(raw_probabilities)), 4)

    return PredictionResponse(
        label=LABELS[prediction],
        class_id=prediction,
        confidence=confidence,
        probabilities=probabilities,
        features=extract_features(original_text),
    )
