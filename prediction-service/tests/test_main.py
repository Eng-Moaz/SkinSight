import io
import os
import sys

import pytest

os.environ["USE_FAKE_MODEL"] = "true"  # tests must not need the .onnx file
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from PIL import Image

from app import main


@pytest.fixture()
def client():
    with TestClient(main.app) as c:  # runs the startup (model loading) code
        yield c


def image_bytes(fmt="JPEG"):
    buf = io.BytesIO()
    Image.new("RGB", (64, 64), (180, 120, 90)).save(buf, fmt)
    return buf.getvalue()


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_predict_ok(client):
    r = client.post("/predict", files={"file": ("a.jpg", image_bytes(), "image/jpeg")})
    assert r.status_code == 200
    body = r.json()
    assert {"top_type", "confidence", "risk", "all_types"} <= set(body)
    assert len(body["all_types"]) == 7
    assert abs(sum(body["all_types"].values()) - 1) < 0.01
    assert body["risk"] in {"high", "low"}
    assert body["top_type"] == max(body["all_types"], key=body["all_types"].get)


def test_png_ok(client):
    r = client.post("/predict", files={"file": ("a.png", image_bytes("PNG"), "image/png")})
    assert r.status_code == 200


@pytest.mark.parametrize(
    "name,content,ctype",
    [
        ("a.txt", b"hello", "text/plain"),
        ("a.jpg", b"not an image", "image/jpeg"),
        ("a.jpg", b"", "image/jpeg"),
        ("a.pdf", b"%PDF-1.4", "application/pdf"),
    ],
)
def test_not_an_image(client, name, content, ctype):
    r = client.post("/predict", files={"file": (name, content, ctype)})
    assert r.status_code == 400
    assert r.json()["detail"] == "The file is not a valid image."


def test_too_large(client):
    big = b"0" * (10 * 1024 * 1024 + 10)
    r = client.post("/predict", files={"file": ("a.jpg", big, "image/jpeg")})
    assert r.status_code == 413


def test_missing_file_field(client):
    assert client.post("/predict").status_code == 422


def test_real_mode_without_model_file_fails_clearly(monkeypatch):
    monkeypatch.setattr(main, "USE_FAKE_MODEL", False)
    monkeypatch.setattr(main, "MODEL_PATH", "does-not-exist.onnx")
    with pytest.raises(RuntimeError, match="Model file not found"):
        with TestClient(main.app):
            pass
