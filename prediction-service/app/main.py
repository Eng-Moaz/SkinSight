import io
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

from app.schemas import PredictionResponse

log = logging.getLogger("uvicorn.error")

MAX_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MODEL_PATH = os.getenv("MODEL_PATH", "model/skin_lesion_ensemble.onnx")
USE_FAKE_MODEL = os.getenv("USE_FAKE_MODEL", "false").lower() == "true"

state = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the model once when the server starts."""
    if USE_FAKE_MODEL:
        from app.fake import fake_predict

        log.warning("USE_FAKE_MODEL=true: returning FAKE results, not the real model")
        state["predict"] = fake_predict
    else:
        if not os.path.exists(MODEL_PATH):
            raise RuntimeError(
                f"Model file not found: {MODEL_PATH}. Download it from the repo's GitHub "
                "Releases into prediction-service/model/, or set USE_FAKE_MODEL=true for local dev."
            )
        from app.inference import load_ensemble, predict

        bundle = load_ensemble(MODEL_PATH)
        state["predict"] = lambda image: predict(image, bundle)
    yield
    state.clear()


app = FastAPI(
    title="SkinSight prediction service (student project, not a medical diagnosis)",
    lifespan=lifespan,
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResponse)
async def predict_endpoint(file: UploadFile = File(...)):
    not_image = HTTPException(400, "The file is not a valid image.")

    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Image is too large (max 10 MB).")

    if file.content_type not in ALLOWED_TYPES or not data:
        raise not_image

    try:
        image = Image.open(io.BytesIO(data))
        image.load()  # forces decoding, catches corrupt files
    except (UnidentifiedImageError, OSError):
        raise not_image

    return await run_in_threadpool(state["predict"], image)
