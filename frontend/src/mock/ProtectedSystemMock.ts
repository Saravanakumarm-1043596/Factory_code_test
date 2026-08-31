import type { ProtectedSystem } from '../types/ProtectedSystem';

// Deterministic dummy data so every button/action in this app works
// end-to-end without a live backend. Regenerate by re-running the
// UISenz agent.
export const protectedSystemMockData: ProtectedSystem[] = [
  {
    "protected_system_id": 493,
    "name": "Isabella Yamamoto",
    "system_type": "Facets",
    "environment": "Production",
    "contains_phi": true,
    "data_classification": "Confidential",
    "owner": "Owner 1",
    "ip_range": null,
    "compliance_scope": "Multiple",
    "last_assessment_date": "2026-04-01",
    "notes": "Notes 1"
  },
  {
    "protected_system_id": 376,
    "name": "Mason Johansson",
    "system_type": "Portal",
    "environment": "Production",
    "contains_phi": true,
    "data_classification": "Internal",
    "owner": "Owner 2",
    "ip_range": "Ip Range 2",
    "compliance_scope": "Multiple",
    "last_assessment_date": "2026-06-17",
    "notes": "Notes 2"
  },
  {
    "protected_system_id": 425,
    "name": "Liam Dubois",
    "system_type": "Facets",
    "environment": "Development",
    "contains_phi": true,
    "data_classification": "Public",
    "owner": "Owner 3",
    "ip_range": "Ip Range 3",
    "compliance_scope": "Multiple",
    "last_assessment_date": "2026-08-26",
    "notes": "Notes 3"
  },
  {
    "protected_system_id": 329,
    "name": "Aditya Garcia",
    "system_type": "Epic",
    "environment": "Staging",
    "contains_phi": true,
    "data_classification": "Public",
    "owner": "Owner 4",
    "ip_range": "Ip Range 4",
    "compliance_scope": "Multiple",
    "last_assessment_date": "2026-05-12",
    "notes": "Notes 4"
  },
  {
    "protected_system_id": 106,
    "name": "Diego Patel",
    "system_type": "Data Warehouse",
    "environment": "Production",
    "contains_phi": false,
    "data_classification": "Public",
    "owner": "Owner 5",
    "ip_range": "Ip Range 5",
    "compliance_scope": "Multiple",
    "last_assessment_date": "2026-04-28",
    "notes": "Notes 5"
  },
  {
    "protected_system_id": 215,
    "name": "Wei Smith",
    "system_type": "Facets",
    "environment": "Staging",
    "contains_phi": true,
    "data_classification": "Restricted",
    "owner": "Owner 6",
    "ip_range": null,
    "compliance_scope": "HITRUST",
    "last_assessment_date": "2026-05-04",
    "notes": "Notes 6"
  },
  {
    "protected_system_id": 260,
    "name": "Isabella Patel",
    "system_type": "Data Warehouse",
    "environment": "Staging",
    "contains_phi": true,
    "data_classification": "Restricted",
    "owner": "Owner 7",
    "ip_range": "Ip Range 7",
    "compliance_scope": "HITRUST",
    "last_assessment_date": "2026-06-19",
    "notes": "Notes 7"
  },
  {
    "protected_system_id": 494,
    "name": "Ava Rossi",
    "system_type": "Portal",
    "environment": "Production",
    "contains_phi": false,
    "data_classification": "Public",
    "owner": "Owner 8",
    "ip_range": "Ip Range 8",
    "compliance_scope": "SOC2",
    "last_assessment_date": "2026-04-22",
    "notes": "Notes 8"
  },
  {
    "protected_system_id": 380,
    "name": "Zainab Rossi",
    "system_type": "Integration Engine",
    "environment": "Staging",
    "contains_phi": false,
    "data_classification": "Confidential",
    "owner": "Owner 9",
    "ip_range": "Ip Range 9",
    "compliance_scope": "HIPAA",
    "last_assessment_date": "2026-04-30",
    "notes": "Notes 9"
  },
  {
    "protected_system_id": 238,
    "name": "Liam Yamamoto",
    "system_type": "Portal",
    "environment": "Staging",
    "contains_phi": true,
    "data_classification": "Internal",
    "owner": "Owner 10",
    "ip_range": "Ip Range 10",
    "compliance_scope": "Multiple",
    "last_assessment_date": "2026-07-30",
    "notes": "Notes 10"
  },
  {
    "protected_system_id": 216,
    "name": "Kenji Andersson",
    "system_type": "Integration Engine",
    "environment": "Production",
    "contains_phi": false,
    "data_classification": "Restricted",
    "owner": "Owner 11",
    "ip_range": "Ip Range 11",
    "compliance_scope": "HIPAA",
    "last_assessment_date": null,
    "notes": "Notes 11"
  },
  {
    "protected_system_id": 486,
    "name": "Aditya Silva",
    "system_type": "Facets",
    "environment": "Staging",
    "contains_phi": false,
    "data_classification": "Public",
    "owner": "Owner 12",
    "ip_range": "Ip Range 12",
    "compliance_scope": "Multiple",
    "last_assessment_date": "2026-06-27",
    "notes": "Notes 12"
  }
];
