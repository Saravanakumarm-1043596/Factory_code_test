"""CRUD smoke test for Appliance, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'name': 'Amara Rossi', 'appliance_type': 'Palo Alto', 'ip_address': 'Ip Address 901', 'hostname': 'Hostname 901', 'environment': 'Staging', 'firmware_version': 'Firmware Version 901', 'total_rule_count': 431, 'last_synced_at': '2026-05-04T20:45:50Z', 'notes': 'Notes 901'}
UPDATE_PAYLOAD = {'name': 'Aditya Smith', 'appliance_type': 'Azure Firewall', 'ip_address': 'Ip Address 902', 'hostname': 'Hostname 902', 'environment': 'Production', 'firmware_version': 'Firmware Version 902', 'total_rule_count': 359, 'last_synced_at': '2026-03-23T03:45:50Z', 'notes': 'Notes 902'}


def test_appliance_crud_roundtrip(client):
    created = client.post("/api/appliances", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["appliance_id"]

    listed = client.get("/api/appliances")
    assert listed.status_code == 200
    assert any(row["appliance_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/appliances/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/appliances/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/appliances/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/appliances/{item_id}")
    assert missing.status_code == 404
