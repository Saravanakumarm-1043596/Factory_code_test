"""CRUD smoke test for LabTestOrder, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'order_number': 'Order Number 901', 'member_id': 1, 'ordering_provider_id': 1, 'performing_lab_id': 1, 'line_of_business_id': 1, 'source_system': 'Manual Entry', 'order_status': 'Resulted', 'priority': 'Routine', 'clinical_indication': 'Clinical Indication 901', 'icd10_codes': 'Icd10 Codes 901', 'order_date': '2026-03-20T13:24:18Z', 'specimen_collection_date': '2026-06-15T20:24:18Z', 'result_date': '2026-03-18T11:24:18Z', 'prior_auth_required': True, 'prior_auth_number': 'Partially Approved', 'notes': 'Notes 901', 'created_at': '2026-06-04T18:24:18Z', 'updated_at': '2026-07-23T01:24:18Z'}
UPDATE_PAYLOAD = {'order_number': 'Order Number 902', 'member_id': 1, 'ordering_provider_id': 1, 'performing_lab_id': 1, 'line_of_business_id': 1, 'source_system': 'Manual Entry', 'order_status': 'In Progress', 'priority': 'Routine', 'clinical_indication': 'Clinical Indication 902', 'icd10_codes': 'Icd10 Codes 902', 'order_date': '2026-03-26T01:24:18Z', 'specimen_collection_date': '2026-04-10T18:24:18Z', 'result_date': '2026-03-21T14:24:18Z', 'prior_auth_required': True, 'prior_auth_number': 'Approved', 'notes': 'Notes 902', 'created_at': '2026-05-14T23:24:18Z', 'updated_at': '2026-08-30T04:24:18Z'}


def test_labTestOrder_crud_roundtrip(client):
    created = client.post("/api/labtestorders", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["lab_test_order_id"]

    listed = client.get("/api/labtestorders")
    assert listed.status_code == 200
    assert any(row["lab_test_order_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/labtestorders/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/labtestorders/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/labtestorders/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/labtestorders/{item_id}")
    assert missing.status_code == 404
