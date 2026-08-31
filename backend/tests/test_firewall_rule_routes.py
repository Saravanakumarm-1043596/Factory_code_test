"""CRUD smoke test for FirewallRule, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'firewall_rule_set_id': 1, 'rule_name': 'Emma Fernandez', 'priority': 428, 'direction': 'Outbound', 'action': 'Deny', 'protocol': 'TCP', 'source_address': 'Source Address 901', 'source_port_range': 'Source Port Range 901', 'destination_address': 'Destination Address 901', 'destination_port_range': 'Destination Port Range 901', 'is_enabled': True, 'description': 'Description 901', 'last_hit_at': '2026-04-06T11:45:50Z', 'hit_count': 387, 'created_at': '2026-08-03T11:45:50Z'}
UPDATE_PAYLOAD = {'firewall_rule_set_id': 1, 'rule_name': 'Emma Silva', 'priority': 7, 'direction': 'Inbound', 'action': 'Allow', 'protocol': 'Any', 'source_address': 'Source Address 902', 'source_port_range': 'Source Port Range 902', 'destination_address': 'Destination Address 902', 'destination_port_range': 'Destination Port Range 902', 'is_enabled': False, 'description': 'Description 902', 'last_hit_at': '2026-04-13T07:45:50Z', 'hit_count': 440, 'created_at': '2026-07-25T00:45:50Z'}


def test_firewallRule_crud_roundtrip(client):
    created = client.post("/api/firewallrules", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["firewall_rule_id"]

    listed = client.get("/api/firewallrules")
    assert listed.status_code == 200
    assert any(row["firewall_rule_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/firewallrules/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/firewallrules/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/firewallrules/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/firewallrules/{item_id}")
    assert missing.status_code == 404
