"""CRUD smoke test for Patient, generated from its field spec."""
from __future__ import annotations

CREATE_FORM = {'first_name': 'Emma', 'last_name': 'Rossi', 'date_of_birth': '1966-03-20', 'gender': 'Other', 'email': 'noah.silva@example.com', 'phone_number': '+1-818-489-9134', 'preferred_contact_method': 'Phone', 'preferred_language': 'Spanish', 'membership_status': 'Terminated', 'ehr_source_system': 'Cerner', 'ehr_medical_record_number': 'Ehr Medical Record Number 901', 'no_show_risk_score': 139, 'risk_score_updated_at': '2026-08-14T15:59:53Z', 'enrollment_date': '2026-05-01', 'created_at': '2026-05-26T02:59:53Z', 'updated_at': '2026-08-05T07:59:53Z'}
UPDATE_FORM = {'first_name': 'Sophia', 'last_name': 'Okafor', 'date_of_birth': '1991-11-25', 'gender': 'Non-Binary', 'email': 'diego.khan@example.com', 'phone_number': '+1-858-884-8130', 'preferred_contact_method': 'Phone', 'preferred_language': 'Mandarin', 'membership_status': 'Inactive', 'ehr_source_system': 'Cerner', 'ehr_medical_record_number': 'Ehr Medical Record Number 902', 'no_show_risk_score': 459, 'risk_score_updated_at': '2026-08-04T03:59:53Z', 'enrollment_date': '2026-06-13', 'created_at': '2026-06-05T04:59:53Z', 'updated_at': '2026-07-17T20:59:53Z'}
_TEST_FILE = ("test.pdf", b"%PDF-1.4 fake", "application/pdf")


def test_patient_crud_roundtrip(client):
    created = client.post("/api/patients", data=CREATE_FORM, files={"consent_document": _TEST_FILE})
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["patient_id"]

    listed = client.get("/api/patients")
    assert listed.status_code == 200
    assert any(row["patient_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/patients/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/patients/{item_id}", data=UPDATE_FORM)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/patients/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/patients/{item_id}")
    assert missing.status_code == 404
