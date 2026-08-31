"""CRUD smoke test for PhiaccessLog, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'user_id': '1', 'patient_id': '1', 'resource_type': 'Appointment', 'resource_id': '32e83028-674e-07c3-d1a9-089b5b859cb1', 'action': 'Export', 'access_reason': 'Operations', 'ip_address': 'Ip Address 901', 'user_agent': 'User Agent 901', 'ehr_source_system': 'Epic', 'access_granted': True, 'denial_reason': 'Break-the-Glass Required', 'accessed_at': '2026-06-14T02:59:53Z'}
UPDATE_PAYLOAD = {'user_id': '1', 'patient_id': '1', 'resource_type': 'Consent Document', 'resource_id': '719d6480-6341-b503-823a-fe4131aa4777', 'action': 'Create', 'access_reason': 'Payment', 'ip_address': 'Ip Address 902', 'user_agent': 'User Agent 902', 'ehr_source_system': 'Epic', 'access_granted': True, 'denial_reason': 'Break-the-Glass Required', 'accessed_at': '2026-05-04T14:59:53Z'}


def test_phiaccessLog_crud_roundtrip(client):
    created = client.post("/api/phiaccesslogs", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["phi_access_log_id"]

    listed = client.get("/api/phiaccesslogs")
    assert listed.status_code == 200
    assert any(row["phi_access_log_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/phiaccesslogs/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/phiaccesslogs/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/phiaccesslogs/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/phiaccesslogs/{item_id}")
    assert missing.status_code == 404
