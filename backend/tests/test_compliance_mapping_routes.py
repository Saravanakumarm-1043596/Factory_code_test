"""CRUD smoke test for ComplianceMapping, generated from its field spec."""
from __future__ import annotations

CREATE_FORM = {'framework': 'NIST 800-53', 'control_id': 'Control Id 901', 'control_name': 'Priya Silva', 'description': 'Description 901', 'protected_system_id': 1, 'firewall_rule_set_id': 1, 'compliance_status': 'Compliant', 'last_assessed_at': '2026-05-29T08:45:50Z', 'assessor': 'Assessor 901', 'notes': 'Notes 901'}
UPDATE_FORM = {'framework': 'HIPAA', 'control_id': 'Control Id 902', 'control_name': 'Noah Okafor', 'description': 'Description 902', 'protected_system_id': 1, 'firewall_rule_set_id': 1, 'compliance_status': 'Not Assessed', 'last_assessed_at': '2026-08-23T13:45:50Z', 'assessor': 'Assessor 902', 'notes': 'Notes 902'}
_TEST_FILE = ("test.pdf", b"%PDF-1.4 fake", "application/pdf")


def test_complianceMapping_crud_roundtrip(client):
    created = client.post("/api/compliancemappings", data=CREATE_FORM, files={"evidence_file": _TEST_FILE})
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["compliance_mapping_id"]

    listed = client.get("/api/compliancemappings")
    assert listed.status_code == 200
    assert any(row["compliance_mapping_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/compliancemappings/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/compliancemappings/{item_id}", data=UPDATE_FORM)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/compliancemappings/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/compliancemappings/{item_id}")
    assert missing.status_code == 404
