"""CRUD smoke test for Clinician, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'first_name': 'Mason', 'last_name': 'Müller', 'email': 'mason.müller@example.com', 'npi_number': 'Npi Number 901', 'specialty': 'Cardiology', 'ehr_source_system': 'Epic', 'facility_id': '1', 'status': 'On Leave', 'max_daily_appointments': 318, 'created_at': '2026-06-27T07:59:53Z', 'updated_at': '2026-07-03T16:59:53Z'}
UPDATE_PAYLOAD = {'first_name': 'Fatima', 'last_name': 'Okafor', 'email': 'amara.carter@example.com', 'npi_number': 'Npi Number 902', 'specialty': 'Other', 'ehr_source_system': 'Cerner', 'facility_id': '1', 'status': 'Active', 'max_daily_appointments': 48, 'created_at': '2026-03-20T00:59:53Z', 'updated_at': '2026-08-21T14:59:53Z'}


def test_clinician_crud_roundtrip(client):
    created = client.post("/api/clinicians", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["clinician_id"]

    listed = client.get("/api/clinicians")
    assert listed.status_code == 200
    assert any(row["clinician_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/clinicians/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/clinicians/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/clinicians/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/clinicians/{item_id}")
    assert missing.status_code == 404
