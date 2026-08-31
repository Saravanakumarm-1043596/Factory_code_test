"""CRUD smoke test for PatientEngagement, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'patient_id': '1', 'appointment_id': '1', 'channel': 'Email', 'engagement_type': 'Reminder', 'sent_at': '2026-08-29T04:59:53Z', 'delivered_at': '2026-04-30T00:59:53Z', 'patient_response': 'No Response', 'response_at': '2026-08-01T19:59:53Z', 'status': 'Sent', 'template_name': 'Diego Dubois', 'created_at': '2026-07-17T02:59:53Z'}
UPDATE_PAYLOAD = {'patient_id': '1', 'appointment_id': '1', 'channel': 'Push Notification', 'engagement_type': 'Survey', 'sent_at': '2026-03-21T12:59:53Z', 'delivered_at': '2026-08-02T07:59:53Z', 'patient_response': 'Confirmed', 'response_at': '2026-06-09T07:59:53Z', 'status': 'Delivered', 'template_name': 'Priya Khan', 'created_at': '2026-04-16T19:59:53Z'}


def test_patientEngagement_crud_roundtrip(client):
    created = client.post("/api/patientengagements", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["patient_engagement_id"]

    listed = client.get("/api/patientengagements")
    assert listed.status_code == 200
    assert any(row["patient_engagement_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/patientengagements/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/patientengagements/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/patientengagements/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/patientengagements/{item_id}")
    assert missing.status_code == 404
