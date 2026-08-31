import type { ScanFinding } from '../types/ScanFinding';

// Deterministic dummy data so every button/action in this app works
// end-to-end without a live backend. Regenerate by re-running the
// UISenz agent.
export const scanFindingMockData: ScanFinding[] = [
  {
    "scan_finding_id": 251,
    "audit_scan_id": 73,
    "rule_issue_id": 93,
    "firewall_rule_id": 105,
    "finding_type": "Orphaned",
    "severity": "Medium",
    "detail": "Detail 1",
    "auto_resolved": false,
    "detected_at": "2026-04-22T19:44:26Z"
  },
  {
    "scan_finding_id": 422,
    "audit_scan_id": 305,
    "rule_issue_id": 104,
    "firewall_rule_id": 267,
    "finding_type": "Orphaned",
    "severity": "Medium",
    "detail": "Detail 2",
    "auto_resolved": false,
    "detected_at": "2026-06-17T06:44:26Z"
  },
  {
    "scan_finding_id": 140,
    "audit_scan_id": 341,
    "rule_issue_id": 127,
    "firewall_rule_id": 262,
    "finding_type": "Expired",
    "severity": "Critical",
    "detail": "Detail 3",
    "auto_resolved": true,
    "detected_at": "2026-03-21T07:44:26Z"
  },
  {
    "scan_finding_id": 354,
    "audit_scan_id": 260,
    "rule_issue_id": 248,
    "firewall_rule_id": 396,
    "finding_type": "Shadowed",
    "severity": "Informational",
    "detail": "Detail 4",
    "auto_resolved": true,
    "detected_at": "2026-05-12T21:44:26Z"
  },
  {
    "scan_finding_id": 480,
    "audit_scan_id": 153,
    "rule_issue_id": 104,
    "firewall_rule_id": 69,
    "finding_type": "Conflicting",
    "severity": "Informational",
    "detail": "Detail 5",
    "auto_resolved": false,
    "detected_at": "2026-06-21T04:44:26Z"
  },
  {
    "scan_finding_id": 402,
    "audit_scan_id": 341,
    "rule_issue_id": 191,
    "firewall_rule_id": 262,
    "finding_type": "Shadowed",
    "severity": "Critical",
    "detail": "Detail 6",
    "auto_resolved": true,
    "detected_at": "2026-07-20T22:44:26Z"
  },
  {
    "scan_finding_id": 499,
    "audit_scan_id": 339,
    "rule_issue_id": 259,
    "firewall_rule_id": 415,
    "finding_type": "Expired",
    "severity": "Informational",
    "detail": "Detail 7",
    "auto_resolved": false,
    "detected_at": "2026-07-04T09:44:26Z"
  },
  {
    "scan_finding_id": 398,
    "audit_scan_id": 305,
    "rule_issue_id": 383,
    "firewall_rule_id": 81,
    "finding_type": "Orphaned",
    "severity": "Critical",
    "detail": "Detail 8",
    "auto_resolved": false,
    "detected_at": "2026-07-01T09:44:26Z"
  },
  {
    "scan_finding_id": 215,
    "audit_scan_id": 341,
    "rule_issue_id": 191,
    "firewall_rule_id": 320,
    "finding_type": "Orphaned",
    "severity": "Low",
    "detail": "Detail 9",
    "auto_resolved": false,
    "detected_at": "2026-05-11T00:44:26Z"
  },
  {
    "scan_finding_id": 288,
    "audit_scan_id": 10,
    "rule_issue_id": null,
    "firewall_rule_id": 396,
    "finding_type": "Orphaned",
    "severity": "High",
    "detail": "Detail 10",
    "auto_resolved": false,
    "detected_at": "2026-07-14T07:44:26Z"
  },
  {
    "scan_finding_id": 342,
    "audit_scan_id": 260,
    "rule_issue_id": 93,
    "firewall_rule_id": 415,
    "finding_type": "Conflicting",
    "severity": "Informational",
    "detail": "Detail 11",
    "auto_resolved": true,
    "detected_at": "2026-06-28T13:44:26Z"
  },
  {
    "scan_finding_id": 240,
    "audit_scan_id": 10,
    "rule_issue_id": null,
    "firewall_rule_id": 267,
    "finding_type": "Redundant",
    "severity": "Low",
    "detail": "Detail 12",
    "auto_resolved": false,
    "detected_at": "2026-04-14T16:44:26Z"
  }
];
