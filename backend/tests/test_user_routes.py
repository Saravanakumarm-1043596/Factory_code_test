"""CRUD smoke test for User, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'username': 'Username 901', 'email': 'emma.kim@example.com', 'first_name': 'Olivia', 'last_name': 'Andersson', 'role': 'Supervisor', 'department': 'Claims', 'is_active': True, 'last_login': '2026-04-14T03:24:18Z', 'created_at': '2026-05-22T22:24:18Z'}
UPDATE_PAYLOAD = {'username': 'Username 902', 'email': 'liam.müller@example.com', 'first_name': 'Isabella', 'last_name': 'Silva', 'role': 'Claims Analyst', 'department': 'Medical Management', 'is_active': True, 'last_login': '2026-05-17T06:24:18Z', 'created_at': '2026-05-23T23:24:18Z'}


def test_user_crud_roundtrip(client):
    created = client.post("/api/users", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["user_id"]

    listed = client.get("/api/users")
    assert listed.status_code == 200
    assert any(row["user_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/users/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/users/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/users/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/users/{item_id}")
    assert missing.status_code == 404
