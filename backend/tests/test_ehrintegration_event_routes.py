"""CRUD smoke test for EhrintegrationEvent, generated from its field spec."""
from __future__ import annotations

CREATE_FORM = {'source_system': 'Cerner', 'direction': 'Inbound', 'event_type': 'SIU (Schedule)', 'message_id': 'Message Id 901', 'patient_id': '1', 'appointment_id': '1', 'status': 'Failed', 'error_message': 'Error Message 901', 'retry_count': 229, 'occurred_at': '2026-07-04T07:59:53Z', 'processed_at': '2026-06-20T01:59:53Z', 'created_at': '2026-04-23T00:59:53Z'}
UPDATE_FORM = {'source_system': 'Epic', 'direction': 'Outbound', 'event_type': 'MDM (Document)', 'message_id': 'Message Id 902', 'patient_id': '1', 'appointment_id': '1', 'status': 'Retrying', 'error_message': 'Error Message 902', 'retry_count': 257, 'occurred_at': '2026-07-13T13:59:53Z', 'processed_at': '2026-04-09T03:59:53Z', 'created_at': '2026-07-02T12:59:53Z'}
_TEST_FILE = ("test.pdf", b"%PDF-1.4 fake", "application/pdf")


def test_ehrintegrationEvent_crud_roundtrip(client):
    created = client.post("/api/ehrintegrationevents", data=CREATE_FORM, files={"payload_file": _TEST_FILE})
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["ehr_integration_event_id"]

    listed = client.get("/api/ehrintegrationevents")
    assert listed.status_code == 200
    assert any(row["ehr_integration_event_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/ehrintegrationevents/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/ehrintegrationevents/{item_id}", data=UPDATE_FORM)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/ehrintegrationevents/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/ehrintegrationevents/{item_id}")
    assert missing.status_code == 404
