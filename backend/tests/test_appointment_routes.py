"""CRUD smoke test for Appointment, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'patient_id': '1', 'clinician_id': '1', 'facility_id': '1', 'appointment_type': 'Home Visit', 'visit_reason': 'Referral', 'scheduled_datetime': '2026-07-12T12:59:53Z', 'duration_minutes': 158, 'status': 'No-Show', 'no_show_risk_score': 418, 'predicted_optimal_slot': '2026-07-09T15:59:53Z', 'ehr_source_system': 'Epic', 'ehr_encounter_id': 'Follow Up', 'cancellation_reason': 'Weather', 'notes': 'Notes 901', 'created_at': '2026-04-16T15:59:53Z', 'updated_at': '2026-08-29T19:59:53Z'}
UPDATE_PAYLOAD = {'patient_id': '1', 'clinician_id': '1', 'facility_id': '1', 'appointment_type': 'Home Visit', 'visit_reason': 'Procedure', 'scheduled_datetime': '2026-08-18T14:59:53Z', 'duration_minutes': 375, 'status': 'No-Show', 'no_show_risk_score': 179, 'predicted_optimal_slot': '2026-05-31T09:59:53Z', 'ehr_source_system': 'Cerner', 'ehr_encounter_id': 'Telehealth', 'cancellation_reason': 'Weather', 'notes': 'Notes 902', 'created_at': '2026-07-22T01:59:53Z', 'updated_at': '2026-07-30T20:59:53Z'}


def test_appointment_crud_roundtrip(client):
    created = client.post("/api/appointments", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["appointment_id"]

    listed = client.get("/api/appointments")
    assert listed.status_code == 200
    assert any(row["appointment_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/appointments/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/appointments/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/appointments/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/appointments/{item_id}")
    assert missing.status_code == 404
