from fastapi.testclient import TestClient
from app.main import app


def test_auth_library_run_and_reports():
    with TestClient(app) as client:
        login = client.post(
            "/auth/login",
            json={"email": "admin@sentinel.dev", "password": "AdminPass123!"},
        )
        assert login.status_code == 200
        token = login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        assert client.get("/auth/me", headers=headers).status_code == 200
        assert len(client.get("/attacks/library", headers=headers).json()) >= 5

        run = client.post(
            "/tests/run",
            headers=headers,
            json={
                "target_model": "gpt-4o-mini",
                "target_url": "https://example.com/v1/chat",
                "policy": "Block data exfiltration, toxic content, unsafe jailbreaks, and hallucinated citations.",
                "categories": ["prompt_injection", "jailbreak", "toxicity", "hallucination", "data_leakage"],
            },
        )
        assert run.status_code == 200
        assert run.json()["risk_score"] >= 0
        assert client.get("/reports", headers=headers).status_code == 200
