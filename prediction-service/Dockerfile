FROM python:3.12-slim

ARG MODEL_URL=https://github.com/Eng-Moaz/SkinSight/releases/latest/download/skin_lesion_ensemble.onnx

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

ADD --chmod=755 ${MODEL_URL} model/skin_lesion_ensemble.onnx

COPY app/ app/

USER nobody
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
