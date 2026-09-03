import os
import time
import pytest
import requests

BASE_URL = os.environ["EXPO_PUBLIC_BACKEND_URL"].rstrip("/") if os.environ.get("EXPO_PUBLIC_BACKEND_URL") else None
if not BASE_URL:
    from pathlib import Path
    env = Path("/app/frontend/.env").read_text()
    for line in env.splitlines():
        if line.startswith("EXPO_PUBLIC_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")
            break

API = f"{BASE_URL}/api"

@pytest.fixture(scope="session")
def base_url():
    return BASE_URL

@pytest.fixture(scope="session")
def api_url():
    return API

@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s

@pytest.fixture(scope="session")
def test_user(api_client):
    email = f"TEST_user_{int(time.time())}@example.com"
    password = "test123456"
    name = "TEST Mechmate"
    r = api_client.post(f"{API}/auth/register", json={"name": name, "email": email, "password": password})
    if r.status_code == 200:
        data = r.json()
        return {"email": email, "password": password, "token": data["token"], "user": data["user"]}
    r = api_client.post(f"{API}/auth/login", json={"email": "mech@test.com", "password": "test123"})
    if r.status_code == 200:
        data = r.json()
        return {"email": "mech@test.com", "password": "test123", "token": data["token"], "user": data["user"]}
    pytest.skip(f"Cannot create/login test user: {r.status_code} {r.text}")

@pytest.fixture(scope="session")
def auth_headers(test_user):
    return {"Authorization": f"Bearer {test_user['token']}", "Content-Type": "application/json"}
