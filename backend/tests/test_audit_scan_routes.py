"""CRUD smoke test for AuditScan, generated from its field spec."""
from __future__ import annotations

CREATE_FORM = {'scan_name': 'Sophia Okafor', 'scan_type': 'Compliance', 'status': 'Failed', 'scope_description': 'Scope Description 901', 'total_rules_analyzed': 434, 'issues_found': 355, 'critical_issues_found': 360, 'initiated_by': 'Initiated By 901', 'started_at': '2026-04-29T20:45:50Z', 'completed_at': '2026-08-11T00:45:50Z'}
UPDATE_FORM = {'scan_name': 'Zainab Müller', 'scan_type': 'Compliance', 'status': 'Scheduled', 'scope_description': 'Scope Description 902', 'total_rules_analyzed': 380, 'issues_found': 157, 'critical_issues_found': 367, 'initiated_by': 'Initiated By 902', 'started_at': '2026-07-13T03:45:50Z', 'completed_at': '2026-04-21T12:45:50Z'}
_TEST_FILE = ("test.pdf", b"%PDF-1.4 fake", "application/pdf")


def test_auditScan_crud_roundtrip(client):
    created = client.post("/api/auditscans", data=CREATE_FORM, files={"report_file": _TEST_FILE})
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["audit_scan_id"]

    listed = client.get("/api/auditscans")
    assert listed.status_code == 200
    assert any(row["audit_scan_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/auditscans/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/auditscans/{item_id}", data=UPDATE_FORM)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/auditscans/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/auditscans/{item_id}")
    assert missing.status_code == 404
