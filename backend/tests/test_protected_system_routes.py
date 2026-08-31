"""CRUD smoke test for ProtectedSystem, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'name': 'Ava Okafor', 'system_type': 'Other', 'environment': 'DR', 'contains_phi': True, 'data_classification': 'Public', 'owner': 'Owner 901', 'ip_range': 'Ip Range 901', 'compliance_scope': 'Multiple', 'last_assessment_date': '2026-08-23', 'notes': 'Notes 901'}
UPDATE_PAYLOAD = {'name': 'Mia Dubois', 'system_type': 'Integration Engine', 'environment': 'Staging', 'contains_phi': True, 'data_classification': 'Public', 'owner': 'Owner 902', 'ip_range': 'Ip Range 902', 'compliance_scope': 'SOC2', 'last_assessment_date': '2026-08-16', 'notes': 'Notes 902'}


def test_protectedSystem_crud_roundtrip(client):
    created = client.post("/api/protectedsystems", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["protected_system_id"]

    listed = client.get("/api/protectedsystems")
    assert listed.status_code == 200
    assert any(row["protected_system_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/protectedsystems/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/protectedsystems/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/protectedsystems/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/protectedsystems/{item_id}")
    assert missing.status_code == 404
