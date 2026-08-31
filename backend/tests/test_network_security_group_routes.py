"""CRUD smoke test for NetworkSecurityGroup, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'name': 'Diego Khan', 'azure_resource_id': 'Azure Resource Id 901', 'subscription': 'Subscription 901', 'resource_group': 'Resource Group 901', 'region': 'Region 901', 'associated_subnet': 'Associated Subnet 901', 'associated_nic': 'Associated Nic 901', 'total_rule_count': 497, 'last_synced_at': '2026-07-25T15:45:50Z', 'notes': 'Notes 901'}
UPDATE_PAYLOAD = {'name': 'Zainab Carter', 'azure_resource_id': 'Azure Resource Id 902', 'subscription': 'Subscription 902', 'resource_group': 'Resource Group 902', 'region': 'Region 902', 'associated_subnet': 'Associated Subnet 902', 'associated_nic': 'Associated Nic 902', 'total_rule_count': 52, 'last_synced_at': '2026-06-20T04:45:50Z', 'notes': 'Notes 902'}


def test_networkSecurityGroup_crud_roundtrip(client):
    created = client.post("/api/networksecuritygroups", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["network_security_group_id"]

    listed = client.get("/api/networksecuritygroups")
    assert listed.status_code == 200
    assert any(row["network_security_group_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/networksecuritygroups/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/networksecuritygroups/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/networksecuritygroups/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/networksecuritygroups/{item_id}")
    assert missing.status_code == 404
