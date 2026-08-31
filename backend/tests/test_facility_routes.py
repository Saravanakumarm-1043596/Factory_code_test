"""CRUD smoke test for Facility, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'name': 'Zainab Khan', 'address': 'Address 901', 'city': 'London', 'state': 'State 901', 'zip_code': 'Zip Code 901', 'phone_number': '+1-506-791-6453', 'ehr_source_system': 'Cerner', 'facility_type': 'Hospital', 'status': 'Closed', 'created_at': '2026-08-08T17:59:53Z'}
UPDATE_PAYLOAD = {'name': 'Fatima Khan', 'address': 'Address 902', 'city': 'Toronto', 'state': 'State 902', 'zip_code': 'Zip Code 902', 'phone_number': '+1-456-346-9455', 'ehr_source_system': 'Both', 'facility_type': 'Specialty Center', 'status': 'Closed', 'created_at': '2026-05-23T08:59:53Z'}


def test_facility_crud_roundtrip(client):
    created = client.post("/api/facilities", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["facility_id"]

    listed = client.get("/api/facilities")
    assert listed.status_code == 200
    assert any(row["facility_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/facilities/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/facilities/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/facilities/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/facilities/{item_id}")
    assert missing.status_code == 404
