"""CRUD smoke test for RuleIssue, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'firewall_rule_id': 1, 'related_rule_id': 1, 'issue_type': 'Overly Permissive', 'severity': 'High', 'status': 'In Remediation', 'description': 'Description 901', 'recommendation': 'Recommendation 901', 'phi_exposure_risk': False, 'detected_at': '2026-08-01T19:45:50Z', 'resolved_at': '2026-04-23T04:45:50Z', 'assigned_to': 'Assigned To 901', 'notes': 'Notes 901'}
UPDATE_PAYLOAD = {'firewall_rule_id': 1, 'related_rule_id': 1, 'issue_type': 'Shadowed', 'severity': 'Low', 'status': 'Accepted Risk', 'description': 'Description 902', 'recommendation': 'Recommendation 902', 'phi_exposure_risk': False, 'detected_at': '2026-03-18T20:45:50Z', 'resolved_at': '2026-04-10T03:45:50Z', 'assigned_to': 'Assigned To 902', 'notes': 'Notes 902'}


def test_ruleIssue_crud_roundtrip(client):
    created = client.post("/api/ruleissues", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["rule_issue_id"]

    listed = client.get("/api/ruleissues")
    assert listed.status_code == 200
    assert any(row["rule_issue_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/ruleissues/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/ruleissues/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/ruleissues/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/ruleissues/{item_id}")
    assert missing.status_code == 404
