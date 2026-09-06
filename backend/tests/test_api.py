import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "RiceGuard AI" in data["app"]
    assert data["demo_mode"] is True

def test_disease_knowledge_base():
    response = client.get("/api/diseases")
    assert response.status_code == 200
    diseases = response.json()
    assert len(diseases) >= 9
    names = [d["name"] for d in diseases]
    assert "Rice Blast" in names
    assert "Bacterial Leaf Blight" in names
    assert "Healthy" in names

def test_chatbot_contextual_query():
    # Test irrigation query
    res = client.post("/api/chat/message", json={"message": "How should I manage water for my rice field?"})
    assert res.status_code == 200
    assert "Tillering Stage" in res.json()["message"]

    # Test safety guardrail against prescribing arbitrary chemical dosages
    res_chem = client.post("/api/chat/message", json={"message": "Which chemical pesticide spray should I use?"})
    assert res_chem.status_code == 200
    assert "does not prescribe chemical trade brands" in res_chem.json()["message"]

def test_image_analysis_pipeline():
    # Create synthetic leaf image (green rectangle)
    img = Image.new("RGB", (300, 300), color=(34, 139, 34))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_bytes = img_byte_arr.getvalue()

    response = client.post(
        "/api/analysis/image",
        files={"file": ("test_leaf.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "condition" in data
    assert "confidence" in data
    assert data["is_demo"] is True
    assert data["is_rice_plant"] is True
