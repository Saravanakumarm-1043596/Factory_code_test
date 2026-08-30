"""CRUD smoke test for Provider, generated from its field spec."""
from __future__ import annotations

CREATE_PAYLOAD = {'npi': 'Npi 901', 'provider_name': 'Priya Johansson', 'provider_type': 'Laboratory', 'tax_id': 'Tax Id 901', 'clia_number': 'Clia Number 901', 'network_status': 'Out-of-Network', 'address': 'Address 901', 'phone': '+1-686-653-8840', 'email': 'hannah.fernandez@example.com', 'is_active': True, 'created_at': '2026-08-20T16:24:18Z'}
UPDATE_PAYLOAD = {'npi': 'Npi 902', 'provider_name': 'Fatima Rossi', 'provider_type': 'Hospital Lab', 'tax_id': 'Tax Id 902', 'clia_number': 'Clia Number 902', 'network_status': 'Out-of-Network', 'address': 'Address 902', 'phone': '+1-875-505-6942', 'email': 'mia.okafor@example.com', 'is_active': False, 'created_at': '2026-04-29T08:24:18Z'}


def test_provider_crud_roundtrip(client):
    created = client.post("/api/providers", json=CREATE_PAYLOAD)
    assert created.status_code == 201, created.text
    item = created.json()
    item_id = item["provider_id"]

    listed = client.get("/api/providers")
    assert listed.status_code == 200
    assert any(row["provider_id"] == item_id for row in listed.json())

    fetched = client.get(f"/api/providers/{item_id}")
    assert fetched.status_code == 200

    updated = client.put(f"/api/providers/{item_id}", json=UPDATE_PAYLOAD)
    assert updated.status_code == 200

    deleted = client.delete(f"/api/providers/{item_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/providers/{item_id}")
    assert missing.status_code == 404
