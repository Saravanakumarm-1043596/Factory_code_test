"""CRUD smoke test for ComplianceFinding, generated from its field spec."""
from __future__ import annotations

CREATE_FORM = {'compliance_control_id': 1, 'finding_type': 'Violation', 'severity': 'Medium', 'description': 'Description 901', 'affected_system': 'Epic', 'affected_line_of_business_id': 1, 'status': 'Accepted Risk', 'assigned_to': 'Assigned To 901', 'remediation_plan': 'Medicaid Managed Care', 'due_date': '2026-07-19', 'found_date': '2026-06-29T06:24:18Z', 'resolved_date': '2026-04-06T17:24:18Z', 'created_at': '2026-04-22T12:24:18Z'}
UPDATE_FORM = {'compliance_control_id': 1, 'finding_type': 'Observation', 'severity': 'High', 'description': 'Description 902', 'affected_system': 'Facets', 'affected_line_of_business_id': 1, 'status': 'Closed', 'assigned_to': 'Assigned To 902', 'remediation_plan': 'Gold PPO', 'due_date': '2026-07-17', 'found_date': '2026-03-19T04:24:18Z', 'resolved_date': '2026-05-18T05:24:18Z', 'created_at': '2026-05-29T22:24:18Z'}
_TEST_FILE = ("test.pdf", b"%PDF-1.4 fake", "application/pdf")


def test_complianceFinding_crud_roundtrip(client):
    created = client.post("/api/compliancefindings", data=CREATE_FORM, files={"evidence_attachment": _TEST_FILE})
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["compliance_finding_id"]

    listed = client.get("/api/compliancefindings")
    assert listed.status_code == 200
    assert any(row["compliance_finding_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/compliancefindings/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/compliancefindings/{item_id}", data=UPDATE_FORM)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/compliancefindings/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/compliancefindings/{item_id}")
    assert missing.status_code == 404
