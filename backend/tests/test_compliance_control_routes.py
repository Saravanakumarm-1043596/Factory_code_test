"""CRUD smoke test for ComplianceControl, generated from its field spec."""
from __future__ import annotations

CREATE_FORM = {'control_framework': 'Internal Policy', 'control_identifier': 'Control Identifier 901', 'control_name': 'Sophia Garcia', 'description': 'Description 901', 'control_category': 'Encryption', 'status': 'Non-Compliant', 'risk_level': 'Medium', 'last_assessment_date': '2026-03-20', 'next_assessment_date': '2026-05-28', 'responsible_party': 'Responsible Party 901', 'remediation_notes': 'Remediation Notes 901', 'created_at': '2026-03-21T11:24:18Z', 'updated_at': '2026-08-18T16:24:18Z'}
UPDATE_FORM = {'control_framework': 'HIPAA §164.312', 'control_identifier': 'Control Identifier 902', 'control_name': 'Lucas Carter', 'description': 'Description 902', 'control_category': 'Authentication', 'status': 'Compliant', 'risk_level': 'Critical', 'last_assessment_date': '2026-08-12', 'next_assessment_date': '2026-08-14', 'responsible_party': 'Responsible Party 902', 'remediation_notes': 'Remediation Notes 902', 'created_at': '2026-04-10T13:24:18Z', 'updated_at': '2026-08-13T04:24:18Z'}
_TEST_FILE = ("test.pdf", b"%PDF-1.4 fake", "application/pdf")


def test_complianceControl_crud_roundtrip(client):
    created = client.post("/api/compliancecontrols", data=CREATE_FORM, files={"evidence_document": _TEST_FILE})
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["compliance_control_id"]

    listed = client.get("/api/compliancecontrols")
    assert listed.status_code == 200
    assert any(row["compliance_control_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/compliancecontrols/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/compliancecontrols/{item_id}", data=UPDATE_FORM)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/compliancecontrols/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/compliancecontrols/{item_id}")
    assert missing.status_code == 404
