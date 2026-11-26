# Prediction service

FastAPI backend for SkinSight. It receives a photo, checks it, runs the ONNX model and returns the predicted skin lesion type, a percentage for each of the 7 types and a risk label.

**Student project, not a medical diagnosis.**

## Run it locally

From the `prediction-service/` folder (Windows PowerShell):

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000
```

On Mac/Linux, activate with `source .venv/bin/activate`.

Then open http://localhost:8000/docs to try `/predict` in the browser.

## The model file

The model (`skin_lesion_ensemble.onnx`) is **not stored in Git**. Download it from the repo's GitHub **Releases** page and save it here:

```
prediction-service/model/skin_lesion_ensemble.onnx
```

If the file is missing, the server stops at startup with a message saying so.

To run without the model (fake results, for development only):

```powershell
$env:USE_FAKE_MODEL="true"
uvicorn app.main:app --reload --port 8000
```

## Endpoints

| Method | Path | What it does |
|---|---|---|
| GET | `/health` | Returns `{"status": "ok"}` |
| POST | `/predict` | Takes a photo (form-data field named `file`) and returns the result |

Example response:

```json
{
  "top_type": "Melanocytic nevus",
  "confidence": 0.9525,
  "risk": "low",
  "uncertain": false,
  "all_types": {
    "Melanocytic nevus": 0.9525,
    "Melanoma": 0.0356
  }
}
```

(`all_types` lists all 7 types in the real response.) `risk` is `high` for melanoma, basal cell carcinoma and actinic keratosis, and `low` for the other four. `uncertain` is `true` when the top score is below 0.5.

## Errors

| Status | When |
|---|---|
| 400 | The file is not a valid image (wrong type, empty or corrupt) |
| 413 | The image is larger than 10 MB |
| 422 | No field named `file` was sent |

Allowed formats: JPEG, PNG, WebP.

## Tests

```powershell
pytest
```

The tests use the fake model, so they do not need the `.onnx` file.

## Settings (environment variables)

| Name | Default | Meaning |
|---|---|---|
| `USE_FAKE_MODEL` | `false` | `true` returns fake results |
| `MODEL_PATH` | `model/skin_lesion_ensemble.onnx` | Where the model file is |
| `CORS_ORIGINS` | `http://localhost:5173` | Websites allowed to call the service (comma separated) |

## Files

- `app/main.py` - the endpoints and the image checks
- `app/inference.py` - loads the ONNX model and makes the prediction
- `app/schemas.py` - the response format
- `app/fake.py` - fake results for development
- `tests/test_main.py` - automated tests

## Docker

Start command for the container:

```
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The container needs `skin_lesion_ensemble.onnx` in `model/`.
