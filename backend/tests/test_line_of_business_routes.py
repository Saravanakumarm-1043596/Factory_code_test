"""CRUD smoke test for LineOfBusiness, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'name': 'Commercial', 'description': 'Description 901', 'regulatory_framework': 'CMS Federal', 'is_active': False, 'created_at': '2026-08-07T04:24:18Z'}
UPDATE_PAYLOAD = {'name': 'Commercial', 'description': 'Description 902', 'regulatory_framework': 'State DOI', 'is_active': False, 'created_at': '2026-07-12T16:24:18Z'}


def test_lineOfBusiness_crud_roundtrip(client):
    created = client.post("/api/lineofbusinesses", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["line_of_business_id"]

    listed = client.get("/api/lineofbusinesses")
    assert listed.status_code == 200
    assert any(row["line_of_business_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/lineofbusinesses/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/lineofbusinesses/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/lineofbusinesses/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/lineofbusinesses/{item_id}")
    assert missing.status_code == 404
