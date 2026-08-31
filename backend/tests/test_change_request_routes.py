"""CRUD smoke test for ChangeRequest, generated from its field spec."""
from __future__ import annotations

CREATE_FORM = {'title': 'Title 901', 'description': 'Description 901', 'firewall_rule_set_id': 1, 'change_type': 'Consolidate Rules', 'status': 'Rolled Back', 'priority': 'Medium', 'requestor': 'Requestor 901', 'approver': 'Approver 901', 'justification': 'Justification 901', 'risk_assessment': 'Risk Assessment 901', 'rule_issue_id': 1, 'implementation_notes': 'Implementation Notes 901', 'submitted_at': '2026-05-12T11:45:50Z', 'approved_at': '2026-06-17T05:45:50Z', 'implemented_at': '2026-04-25T07:45:50Z', 'created_at': '2026-08-14T15:45:50Z'}
UPDATE_FORM = {'title': 'Title 902', 'description': 'Description 902', 'firewall_rule_set_id': 1, 'change_type': 'Emergency Change', 'status': 'Submitted', 'priority': 'High', 'requestor': 'Requestor 902', 'approver': 'Approver 902', 'justification': 'Justification 902', 'risk_assessment': 'Risk Assessment 902', 'rule_issue_id': 1, 'implementation_notes': 'Implementation Notes 902', 'submitted_at': '2026-03-24T20:45:50Z', 'approved_at': '2026-05-21T10:45:50Z', 'implemented_at': '2026-08-02T22:45:50Z', 'created_at': '2026-04-11T11:45:50Z'}
_TEST_FILE = ("test.pdf", b"%PDF-1.4 fake", "application/pdf")


def test_changeRequest_crud_roundtrip(client):
    created = client.post("/api/changerequests", data=CREATE_FORM, files={"attachment": _TEST_FILE})
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["change_request_id"]

    listed = client.get("/api/changerequests")
    assert listed.status_code == 200
    assert any(row["change_request_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/changerequests/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/changerequests/{item_id}", data=UPDATE_FORM)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/changerequests/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/changerequests/{item_id}")
    assert missing.status_code == 404
