"""CRUD smoke test for AppUser, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'email': 'mason.smith@example.com', 'first_name': 'Liam', 'last_name': 'Okafor', 'role': 'Read-Only Auditor', 'clinician_id': '1', 'facility_id': '1', 'status': 'Locked', 'mfa_enabled': True, 'last_login_at': '2026-08-22T23:59:53Z', 'password_changed_at': '2026-05-13T23:59:53Z', 'created_at': '2026-05-21T18:59:53Z', 'updated_at': '2026-07-12T14:59:53Z'}
UPDATE_PAYLOAD = {'email': 'ava.smith@example.com', 'first_name': 'Ava', 'last_name': 'Khan', 'role': 'System Admin', 'clinician_id': '1', 'facility_id': '1', 'status': 'Deactivated', 'mfa_enabled': True, 'last_login_at': '2026-08-10T18:59:53Z', 'password_changed_at': '2026-04-24T00:59:53Z', 'created_at': '2026-07-28T03:59:53Z', 'updated_at': '2026-07-14T16:59:53Z'}


def test_appUser_crud_roundtrip(client):
    created = client.post("/api/appusers", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["app_user_id"]

    listed = client.get("/api/appusers")
    assert listed.status_code == 200
    assert any(row["app_user_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/appusers/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/appusers/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/appusers/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/appusers/{item_id}")
    assert missing.status_code == 404
