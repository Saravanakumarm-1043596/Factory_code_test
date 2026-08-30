"""CRUD smoke test for ClaimError, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'claim_id': 1, 'claim_line_id': 1, 'error_category': 'Provider Credentialing', 'error_severity': 'High', 'error_description': 'Error Description 901', 'source_system_origin': 'Epic', 'resolution_status': 'Open', 'assigned_to': 'Assigned To 901', 'resolution_notes': 'Resolution Notes 901', 'detected_date': '2026-05-01T09:24:18Z', 'resolved_date': '2026-06-18T11:24:18Z', 'created_at': '2026-04-25T14:24:18Z'}
UPDATE_PAYLOAD = {'claim_id': 1, 'claim_line_id': 1, 'error_category': 'Timely Filing', 'error_severity': 'Medium', 'error_description': 'Error Description 902', 'source_system_origin': 'Cross-System', 'resolution_status': 'Waived', 'assigned_to': 'Assigned To 902', 'resolution_notes': 'Resolution Notes 902', 'detected_date': '2026-05-28T17:24:18Z', 'resolved_date': '2026-03-30T07:24:18Z', 'created_at': '2026-06-26T12:24:18Z'}


def test_claimError_crud_roundtrip(client):
    created = client.post("/api/claimerrors", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["claim_error_id"]

    listed = client.get("/api/claimerrors")
    assert listed.status_code == 200
    assert any(row["claim_error_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/claimerrors/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/claimerrors/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/claimerrors/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/claimerrors/{item_id}")
    assert missing.status_code == 404
