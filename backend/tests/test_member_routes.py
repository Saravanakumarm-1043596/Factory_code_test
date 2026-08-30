"""CRUD smoke test for Member, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'facets_member_id': 'Facets Member Id 901', 'epic_mrn': 'Epic Mrn 901', 'first_name': 'Kenji', 'last_name': 'Rossi', 'date_of_birth': '1989-04-17', 'gender': 'Male', 'email': 'wei.smith@example.com', 'phone': '+1-254-927-5262', 'line_of_business_id': 1, 'plan_type': 'PPO', 'coverage_start_date': 'Not Covered', 'coverage_end_date': 'Not Covered', 'member_status': 'Termed', 'created_at': '2026-06-22T12:24:18Z'}
UPDATE_PAYLOAD = {'facets_member_id': 'Facets Member Id 902', 'epic_mrn': 'Epic Mrn 902', 'first_name': 'Olivia', 'last_name': 'Dubois', 'date_of_birth': '1996-12-23', 'gender': 'Unknown', 'email': 'amara.garcia@example.com', 'phone': '+1-624-895-5139', 'line_of_business_id': 1, 'plan_type': 'HMO', 'coverage_start_date': 'In Network', 'coverage_end_date': 'Not Covered', 'member_status': 'Inactive', 'created_at': '2026-04-08T12:24:18Z'}


def test_member_crud_roundtrip(client):
    created = client.post("/api/members", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["member_id"]

    listed = client.get("/api/members")
    assert listed.status_code == 200
    assert any(row["member_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/members/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/members/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/members/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/members/{item_id}")
    assert missing.status_code == 404
