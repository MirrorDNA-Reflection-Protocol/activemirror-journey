FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY *.py .

# Copy transparency docs (bundled for Docker — no vault dependency)
COPY transparency/ ./transparency/

# No ML model in Docker — cross-encoder fallback to keywords
ENV HF_HUB_OFFLINE=1
ENV TRANSFORMERS_OFFLINE=1

# Railway sets PORT automatically
ENV PORT=8082
ENV VAULT_PATH=/app/transparency

EXPOSE ${PORT}

CMD ["python", "safety_proxy.py"]
