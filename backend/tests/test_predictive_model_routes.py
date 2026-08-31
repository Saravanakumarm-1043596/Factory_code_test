"""CRUD smoke test for PredictiveModel, generated from its field spec."""
from __future__ import annotations

CREATE_FORM = {'model_name': 'Liam Yamamoto', 'model_version': 'Model Version 901', 'model_type': 'No-Show Prediction', 'status': 'Validating', 'accuracy_score': 418, 'auc_roc_score': 126, 'training_record_count': 443, 'trained_at': '2026-06-25T04:59:53Z', 'deployed_at': '2026-06-01T03:59:53Z', 'created_at': '2026-06-18T08:59:53Z', 'updated_at': '2026-07-26T10:59:53Z'}
UPDATE_FORM = {'model_name': 'Kenji Andersson', 'model_version': 'Model Version 902', 'model_type': 'Demand Forecasting', 'status': 'Retired', 'accuracy_score': 316, 'auc_roc_score': 404, 'training_record_count': 456, 'trained_at': '2026-06-13T03:59:53Z', 'deployed_at': '2026-05-30T06:59:53Z', 'created_at': '2026-05-21T11:59:53Z', 'updated_at': '2026-07-11T18:59:53Z'}
_TEST_FILE = ("test.pdf", b"%PDF-1.4 fake", "application/pdf")


def test_predictiveModel_crud_roundtrip(client):
    created = client.post("/api/predictivemodels", data=CREATE_FORM, files={"model_artifact": _TEST_FILE})
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["predictive_model_id"]

    listed = client.get("/api/predictivemodels")
    assert listed.status_code == 200
    assert any(row["predictive_model_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/predictivemodels/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/predictivemodels/{item_id}", data=UPDATE_FORM)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/predictivemodels/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/predictivemodels/{item_id}")
    assert missing.status_code == 404
