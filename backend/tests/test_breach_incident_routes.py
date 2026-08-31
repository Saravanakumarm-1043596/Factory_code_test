"""CRUD smoke test for BreachIncident, generated from its field spec."""
from __future__ import annotations

CREATE_FORM = {'reported_by_user_id': '1', 'severity': 'Critical', 'breach_type': 'Hacking', 'status': 'Resolved', 'affected_patient_count': 344, 'description': 'Description 901', 'discovered_at': '2026-08-13T15:59:53Z', 'reported_at': '2026-08-28T09:59:53Z', 'hhs_notification_deadline': '2026-05-14', 'hhs_notified_at': '2026-03-28T19:59:53Z', 'patient_notification_sent_at': '2026-06-29T06:59:53Z', 'root_cause': 'Root Cause 901', 'remediation_plan': 'Remediation Plan 901', 'resolved_at': '2026-04-29T00:59:53Z', 'created_at': '2026-04-23T10:59:53Z', 'updated_at': '2026-07-12T09:59:53Z'}
UPDATE_FORM = {'reported_by_user_id': '1', 'severity': 'Medium', 'breach_type': 'Hacking', 'status': 'Under Investigation', 'affected_patient_count': 122, 'description': 'Description 902', 'discovered_at': '2026-03-19T15:59:53Z', 'reported_at': '2026-06-07T12:59:53Z', 'hhs_notification_deadline': '2026-07-20', 'hhs_notified_at': '2026-05-31T19:59:53Z', 'patient_notification_sent_at': '2026-07-01T14:59:53Z', 'root_cause': 'Root Cause 902', 'remediation_plan': 'Remediation Plan 902', 'resolved_at': '2026-06-20T19:59:53Z', 'created_at': '2026-04-09T19:59:53Z', 'updated_at': '2026-08-05T13:59:53Z'}
_TEST_FILE = ("test.pdf", b"%PDF-1.4 fake", "application/pdf")


def test_breachIncident_crud_roundtrip(client):
    created = client.post("/api/breachincidents", data=CREATE_FORM, files={"supporting_document": _TEST_FILE})
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["breach_incident_id"]

    listed = client.get("/api/breachincidents")
    assert listed.status_code == 200
    assert any(row["breach_incident_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/breachincidents/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/breachincidents/{item_id}", data=UPDATE_FORM)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/breachincidents/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/breachincidents/{item_id}")
    assert missing.status_code == 404
