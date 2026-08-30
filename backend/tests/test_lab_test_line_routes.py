"""CRUD smoke test for LabTestLine, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'lab_test_order_id': 1, 'cpt_code': 'Cpt Code 901', 'test_name': 'Fatima Khan', 'loinc_code': 'Loinc Code 901', 'test_category': 'Toxicology', 'result_value': 'Result Value 901', 'result_unit': 'Result Unit 901', 'reference_range': 'Reference Range 901', 'abnormal_flag': 'High', 'line_status': 'Resulted', 'result_date': '2026-03-30T23:24:18Z', 'created_at': '2026-04-29T09:24:18Z'}
UPDATE_PAYLOAD = {'lab_test_order_id': 1, 'cpt_code': 'Cpt Code 902', 'test_name': 'Noah Patel', 'loinc_code': 'Loinc Code 902', 'test_category': 'Chemistry', 'result_value': 'Result Value 902', 'result_unit': 'Result Unit 902', 'reference_range': 'Reference Range 902', 'abnormal_flag': 'Critical High', 'line_status': 'Pending', 'result_date': '2026-05-25T21:24:18Z', 'created_at': '2026-05-01T01:24:18Z'}


def test_labTestLine_crud_roundtrip(client):
    created = client.post("/api/labtestlines", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["lab_test_line_id"]

    listed = client.get("/api/labtestlines")
    assert listed.status_code == 200
    assert any(row["lab_test_line_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/labtestlines/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/labtestlines/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/labtestlines/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/labtestlines/{item_id}")
    assert missing.status_code == 404
