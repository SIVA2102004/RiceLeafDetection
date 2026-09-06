# RiceGuard AI Comprehensive Test Suite
import io
import json
import pytest
from fastapi.testclient import TestClient
from PIL import Image
from app.main import app
from app.ai.preprocessing import validate_image_quality
from app.core.security import verify_password, get_password_hash

client = TestClient(app)

def test_password_hashing():
    pwd = "FarmerSecurePassword123"
    hashed = get_password_hash(pwd)
    assert verify_password(pwd, hashed)
    assert not verify_password("WrongPassword", hashed)

def test_user_registration_and_login():
    unique_phone = "9998887771"
    reg_payload = {
        "name": "Suresh Kumar",
        "phone": unique_phone,
        "password": "Password@123",
        "email": "suresh@example.com",
        "language": "te",
        "village": "Bapatla",
        "district": "Guntur",
        "state": "Andhra Pradesh"
    }
    # Register
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code in [200, 400] # 400 if rerun

    # Login
    login_res = client.post("/api/auth/login", json={"identifier": unique_phone, "password": "Password@123"})
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    assert data["user"]["phone"] == unique_phone

def test_field_management_crud():
    field_payload = {
        "name": "East Delta Plot",
        "village": "Mandya",
        "area": 3.5,
        "area_unit": "acres",
        "variety": "Jaya",
        "notes": "Good canal access"
    }
    create_res = client.post("/api/fields", json=field_payload)
    assert create_res.status_code == 200
    field_id = create_res.json()["id"]

    # Read
    get_res = client.get(f"/api/fields/{field_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "East Delta Plot"

    # Delete
    del_res = client.delete(f"/api/fields/{field_id}")
    assert del_res.status_code == 200

def test_image_quality_validation_dark_and_bright():
    # Dark image
    dark_img = Image.new("RGB", (200, 200), color=(5, 5, 5))
    buf = io.BytesIO()
    dark_img.save(buf, format="JPEG")
    is_valid, is_rice, msg, b, s = validate_image_quality(buf.getvalue())
    assert not is_valid
    assert "dark" in msg.lower()

    # Bright / washed out image
    bright_img = Image.new("RGB", (200, 200), color=(250, 250, 250))
    buf2 = io.BytesIO()
    bright_img.save(buf2, format="JPEG")
    is_valid2, is_rice2, msg2, b2, s2 = validate_image_quality(buf2.getvalue())
    assert not is_valid2
    assert "bright" in msg2.lower()

def test_live_frame_screening_endpoint():
    # Simulate valid green leaf frame from live camera
    leaf_img = Image.new("RGB", (240, 240), color=(46, 125, 50))
    buf = io.BytesIO()
    leaf_img.save(buf, format="JPEG")
    
    res = client.post("/api/analysis/live", files={"file": ("frame.jpg", buf.getvalue(), "image/jpeg")})
    assert res.status_code == 200
    res_data = res.json()
    assert res_data["is_demo"] is True
    assert res_data["confidence"] > 0.0

def test_feedback_submission():
    fb_res = client.post("/api/feedback", json={"analysis_id": 1, "rating": 1, "comment": "Accurate advice"})
    assert fb_res.status_code == 200
    assert fb_res.json()["status"] == "success"

def test_admin_portal_telemetry():
    stats_res = client.get("/api/admin/dashboard")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "total_farmers" in stats
    assert "total_analyses" in stats
    assert "healthy_cases" in stats
