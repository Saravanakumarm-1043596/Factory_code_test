"""CRUD smoke test for ScheduleSlot, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'clinician_id': '1', 'facility_id': '1', 'slot_start': '2026-04-29T22:59:53Z', 'slot_end': '2026-07-14T12:59:53Z', 'slot_type': 'Overbook', 'status': 'Blocked', 'appointment_id': '1', 'demand_score': 158, 'created_at': '2026-06-17T10:59:53Z'}
UPDATE_PAYLOAD = {'clinician_id': '1', 'facility_id': '1', 'slot_start': '2026-08-30T10:59:53Z', 'slot_end': '2026-04-01T11:59:53Z', 'slot_type': 'Overbook', 'status': 'Booked', 'appointment_id': '1', 'demand_score': 212, 'created_at': '2026-07-22T04:59:53Z'}


def test_scheduleSlot_crud_roundtrip(client):
    created = client.post("/api/scheduleslots", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["schedule_slot_id"]

    listed = client.get("/api/scheduleslots")
    assert listed.status_code == 200
    assert any(row["schedule_slot_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/scheduleslots/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/scheduleslots/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/scheduleslots/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/scheduleslots/{item_id}")
    assert missing.status_code == 404
