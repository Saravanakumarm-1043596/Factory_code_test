"""CRUD smoke test for ConsentRecord, generated from its field spec."""
from __future__ import annotations

CREATE_FORM = {'patient_id': '1', 'consent_type': 'Telehealth', 'status': 'Expired', 'granted_at': '2026-05-17T19:59:53Z', 'expires_at': '2027-01-09', 'revoked_at': '2026-05-20T13:59:53Z', 'collected_by_user_id': '1', 'notes': 'Notes 901', 'created_at': '2026-06-16T11:59:53Z', 'updated_at': '2026-08-02T02:59:53Z'}
UPDATE_FORM = {'patient_id': '1', 'consent_type': 'SMS Communication', 'status': 'Expired', 'granted_at': '2026-04-14T18:59:53Z', 'expires_at': '2027-08-14', 'revoked_at': '2026-08-14T15:59:53Z', 'collected_by_user_id': '1', 'notes': 'Notes 902', 'created_at': '2026-06-18T02:59:53Z', 'updated_at': '2026-08-03T22:59:53Z'}
_TEST_FILE = ("test.pdf", b"%PDF-1.4 fake", "application/pdf")


def test_consentRecord_crud_roundtrip(client):
    created = client.post("/api/consentrecords", data=CREATE_FORM, files={"consent_document": _TEST_FILE})
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["consent_record_id"]

    listed = client.get("/api/consentrecords")
    assert listed.status_code == 200
    assert any(row["consent_record_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/consentrecords/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/consentrecords/{item_id}", data=UPDATE_FORM)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/consentrecords/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/consentrecords/{item_id}")
    assert missing.status_code == 404
