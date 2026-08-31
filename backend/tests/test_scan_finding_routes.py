"""CRUD smoke test for ScanFinding, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'audit_scan_id': 1, 'rule_issue_id': 1, 'firewall_rule_id': 1, 'finding_type': 'Orphaned', 'severity': 'High', 'detail': 'Detail 901', 'auto_resolved': True, 'detected_at': '2026-04-05T07:45:50Z'}
UPDATE_PAYLOAD = {'audit_scan_id': 1, 'rule_issue_id': 1, 'firewall_rule_id': 1, 'finding_type': 'Expired', 'severity': 'Medium', 'detail': 'Detail 902', 'auto_resolved': True, 'detected_at': '2026-04-28T09:45:50Z'}


def test_scanFinding_crud_roundtrip(client):
    created = client.post("/api/scanfindings", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["scan_finding_id"]

    listed = client.get("/api/scanfindings")
    assert listed.status_code == 200
    assert any(row["scan_finding_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/scanfindings/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/scanfindings/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/scanfindings/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/scanfindings/{item_id}")
    assert missing.status_code == 404
