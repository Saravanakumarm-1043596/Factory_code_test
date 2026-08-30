"""CRUD smoke test for ClaimLine, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'claim_id': 1, 'line_number': 131, 'cpt_code': 'Cpt Code 901', 'modifier': 'Modifier 901', 'icd10_pointer': 'Icd10 Pointer 901', 'units': 339, 'billed_amount': 4751.34, 'allowed_amount': 6040.82, 'paid_amount': 851.69, 'line_status': 'Pended', 'denial_reason_code': 'Not Covered', 'lab_test_line_id': 1, 'created_at': '2026-04-09T12:24:18Z'}
UPDATE_PAYLOAD = {'claim_id': 1, 'line_number': 192, 'cpt_code': 'Cpt Code 902', 'modifier': 'Modifier 902', 'icd10_pointer': 'Icd10 Pointer 902', 'units': 254, 'billed_amount': 2115.47, 'allowed_amount': 1879.14, 'paid_amount': 427.12, 'line_status': 'Pended', 'denial_reason_code': 'Missing Information', 'lab_test_line_id': 1, 'created_at': '2026-08-09T15:24:18Z'}


def test_claimLine_crud_roundtrip(client):
    created = client.post("/api/claimlines", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["claim_line_id"]

    listed = client.get("/api/claimlines")
    assert listed.status_code == 200
    assert any(row["claim_line_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/claimlines/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/claimlines/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/claimlines/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/claimlines/{item_id}")
    assert missing.status_code == 404
