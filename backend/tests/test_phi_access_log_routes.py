"""CRUD smoke test for PhiAccessLog, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'user_id': 1, 'entity_type': 'Member', 'entity_record_id': 234, 'access_type': 'View', 'source_system': 'Epic', 'access_reason': 'Payment', 'ip_address': 'Ip Address 901', 'access_timestamp': '2026-06-20T12:24:18Z', 'phi_fields_accessed': 'Phi Fields Accessed 901', 'was_authorized': False, 'notes': 'Notes 901'}
UPDATE_PAYLOAD = {'user_id': 1, 'entity_type': 'Member', 'entity_record_id': 435, 'access_type': 'Export', 'source_system': 'Epic', 'access_reason': 'Treatment', 'ip_address': 'Ip Address 902', 'access_timestamp': '2026-07-19T18:24:18Z', 'phi_fields_accessed': 'Phi Fields Accessed 902', 'was_authorized': False, 'notes': 'Notes 902'}


def test_phiAccessLog_crud_roundtrip(client):
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
