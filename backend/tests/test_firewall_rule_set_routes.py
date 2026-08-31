"""CRUD smoke test for FirewallRuleSet, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'name': 'Kenji Fernandez', 'description': 'Description 901', 'network_security_group_id': 1, 'appliance_id': 1, 'protected_system_id': 1, 'rule_count': 292, 'status': 'Under Review', 'last_reviewed_at': '2026-04-26T03:45:50Z', 'created_at': '2026-04-22T04:45:50Z', 'updated_at': '2026-07-29T22:45:50Z'}
UPDATE_PAYLOAD = {'name': 'Kenji Patel', 'description': 'Description 902', 'network_security_group_id': 1, 'appliance_id': 1, 'protected_system_id': 1, 'rule_count': 168, 'status': 'Under Review', 'last_reviewed_at': '2026-03-21T17:45:50Z', 'created_at': '2026-08-23T17:45:50Z', 'updated_at': '2026-08-10T02:45:50Z'}


def test_firewallRuleSet_crud_roundtrip(client):
    created = client.post("/api/firewallrulesets", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["firewall_rule_set_id"]

    listed = client.get("/api/firewallrulesets")
    assert listed.status_code == 200
    assert any(row["firewall_rule_set_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/firewallrulesets/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/firewallrulesets/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/firewallrulesets/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/firewallrulesets/{item_id}")
    assert missing.status_code == 404
