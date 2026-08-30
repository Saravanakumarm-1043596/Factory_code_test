"""CRUD smoke test for Claim, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'claim_number': 'Claim Number 901', 'lab_test_order_id': 1, 'member_id': 1, 'rendering_provider_id': 1, 'line_of_business_id': 1, 'source_system': 'Facets', 'claim_type': 'Institutional', 'claim_status': 'Pending Review', 'total_billed_amount': 3160.27, 'total_allowed_amount': 5853.44, 'total_paid_amount': 2306.47, 'member_responsibility': 122.14, 'service_date': '2026-08-15', 'submitted_date': '2026-07-20T08:24:18Z', 'adjudicated_date': '2026-03-28T22:24:18Z', 'has_error': False, 'denial_reason_code': 'Out of Network', 'notes': 'Notes 901', 'created_at': '2026-08-16T06:24:18Z', 'updated_at': '2026-08-20T04:24:18Z'}
UPDATE_PAYLOAD = {'claim_number': 'Claim Number 902', 'lab_test_order_id': 1, 'member_id': 1, 'rendering_provider_id': 1, 'line_of_business_id': 1, 'source_system': 'Manual', 'claim_type': 'Institutional', 'claim_status': 'Submitted', 'total_billed_amount': 5244.28, 'total_allowed_amount': 6730.75, 'total_paid_amount': 9653.17, 'member_responsibility': 514.36, 'service_date': '2026-05-27', 'submitted_date': '2026-08-26T11:24:18Z', 'adjudicated_date': '2026-04-13T21:24:18Z', 'has_error': False, 'denial_reason_code': 'Not Covered', 'notes': 'Notes 902', 'created_at': '2026-08-11T21:24:18Z', 'updated_at': '2026-07-20T07:24:18Z'}


def test_claim_crud_roundtrip(client):
    created = client.post("/api/claims", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["claim_id"]

    listed = client.get("/api/claims")
    assert listed.status_code == 200
    assert any(row["claim_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/claims/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/claims/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/claims/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/claims/{item_id}")
    assert missing.status_code == 404
