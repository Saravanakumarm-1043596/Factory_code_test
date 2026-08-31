import type { ScheduleSlot } from '../types/ScheduleSlot';

// Deterministic dummy data so every button/action in this app works
// end-to-end without a live backend. Regenerate by re-running the
// UISenz agent.
export const scheduleSlotMockData: ScheduleSlot[] = [
  {
    "schedule_slot_id": "f948ac36-f2b8-5c19-bf68-799db4ff959a",
    "clinician_id": "e23914c8-3367-9b34-5c4e-57700d86e436",
    "facility_id": "7f9895e3-bc0b-9bc1-288e-b164631ebcc6",
    "slot_start": "2026-04-08T07:57:12Z",
    "slot_end": "2026-05-17T14:57:12Z",
    "slot_type": "Walk-In",
    "status": "Booked",
    "appointment_id": "New Patient",
    "demand_score": 285,
    "created_at": "2026-05-10T14:57:12Z"
  },
  {
    "schedule_slot_id": "934b040e-5bb2-8f54-b720-3fd8c7a93f3b",
    "clinician_id": "ee407761-a123-129c-95a4-6afe8c8a44f1",
    "facility_id": "7f9895e3-bc0b-9bc1-288e-b164631ebcc6",
    "slot_start": "2026-04-28T16:57:12Z",
    "slot_end": "2026-03-31T01:57:12Z",
    "slot_type": "Blocked",
    "status": "Booked",
    "appointment_id": null,
    "demand_score": 73,
    "created_at": "2026-06-11T05:57:12Z"
  },
  {
    "schedule_slot_id": "22ee3fa9-eccc-edef-cd0e-c212f3f0761e",
    "clinician_id": "ee407761-a123-129c-95a4-6afe8c8a44f1",
    "facility_id": "51309caf-fdf0-360e-bbdb-8f53407e9099",
    "slot_start": "2026-08-29T15:57:12Z",
    "slot_end": "2026-05-25T12:57:12Z",
    "slot_type": "Blocked",
    "status": "Completed",
    "appointment_id": null,
    "demand_score": null,
    "created_at": "2026-07-07T16:57:12Z"
  },
  {
    "schedule_slot_id": "19e8f510-c72a-5186-f992-3b7c8f6e3039",
    "clinician_id": "70930bba-b792-7c5c-3adf-8ba426b5c77a",
    "facility_id": "4c103e94-3a52-a2e9-ff89-ed688ebdb018",
    "slot_start": "2026-06-15T23:57:12Z",
    "slot_end": "2026-05-16T04:57:12Z",
    "slot_type": "Standard",
    "status": "Booked",
    "appointment_id": "Consultation",
    "demand_score": 279,
    "created_at": "2026-08-15T15:57:12Z"
  },
  {
    "schedule_slot_id": "aec3595d-1af7-65de-0e51-0c1be3290af0",
    "clinician_id": "571a5d26-7d67-95d4-8282-0e4f9e66cf8b",
    "facility_id": "ddfd22bf-9363-f472-b571-ba461cacb1ed",
    "slot_start": "2026-08-26T21:57:12Z",
    "slot_end": "2026-04-06T01:57:12Z",
    "slot_type": "Blocked",
    "status": "Booked",
    "appointment_id": "New Patient",
    "demand_score": 129,
    "created_at": "2026-06-16T22:57:12Z"
  },
  {
    "schedule_slot_id": "07caf0f0-e3fc-fc04-b1e3-3464e7e7c85e",
    "clinician_id": "534910ae-3e85-5479-4364-a0401d36db14",
    "facility_id": "7f9895e3-bc0b-9bc1-288e-b164631ebcc6",
    "slot_start": "2026-07-11T12:57:12Z",
    "slot_end": "2026-05-24T20:57:12Z",
    "slot_type": "Blocked",
    "status": "Available",
    "appointment_id": "Consultation",
    "demand_score": 298,
    "created_at": "2026-07-26T18:57:12Z"
  },
  {
    "schedule_slot_id": "be307b3a-6024-aa4c-b213-0dde23c21fe3",
    "clinician_id": "ffcd3b93-6bfc-6c23-900c-23d29d50fb91",
    "facility_id": "0cfbdffa-2d8b-b02e-54c0-80b817e44afa",
    "slot_start": "2026-05-03T05:57:12Z",
    "slot_end": "2026-07-06T10:57:12Z",
    "slot_type": "Overbook",
    "status": "Completed",
    "appointment_id": "Consultation",
    "demand_score": 63,
    "created_at": "2026-08-04T00:57:12Z"
  },
  {
    "schedule_slot_id": "9f5518c3-8ca7-f5dc-eb6a-389b8558a215",
    "clinician_id": "ee407761-a123-129c-95a4-6afe8c8a44f1",
    "facility_id": "ddfd22bf-9363-f472-b571-ba461cacb1ed",
    "slot_start": "2026-06-01T05:57:12Z",
    "slot_end": "2026-07-11T22:57:12Z",
    "slot_type": "Overbook",
    "status": "Completed",
    "appointment_id": null,
    "demand_score": 64,
    "created_at": "2026-05-06T02:57:12Z"
  },
  {
    "schedule_slot_id": "50847f28-e3d5-76c7-df12-aceb6c5cb1b6",
    "clinician_id": "0298d2e2-2265-c75d-0317-c55fdadc4a33",
    "facility_id": "4c103e94-3a52-a2e9-ff89-ed688ebdb018",
    "slot_start": "2026-03-24T17:57:12Z",
    "slot_end": "2026-08-07T21:57:12Z",
    "slot_type": "Walk-In",
    "status": "Blocked",
    "appointment_id": "Annual Physical",
    "demand_score": 167,
    "created_at": "2026-04-22T05:57:12Z"
  },
  {
    "schedule_slot_id": "173d4fbf-6023-76f7-cee9-ade0ac42feb5",
    "clinician_id": "ffcd3b93-6bfc-6c23-900c-23d29d50fb91",
    "facility_id": "0cfbdffa-2d8b-b02e-54c0-80b817e44afa",
    "slot_start": "2026-07-24T21:57:12Z",
    "slot_end": "2026-06-30T17:57:12Z",
    "slot_type": "Overbook",
    "status": "Blocked",
    "appointment_id": "Annual Physical",
    "demand_score": 64,
    "created_at": "2026-06-17T10:57:12Z"
  },
  {
    "schedule_slot_id": "bd61b75b-6230-054a-b33d-694c7c092eb4",
    "clinician_id": "a76973f8-e40d-41e3-6d60-eae6eeadfe7b",
    "facility_id": "98cca115-282a-9baa-454b-af8e5a85d228",
    "slot_start": "2026-06-08T03:57:12Z",
    "slot_end": "2026-05-28T17:57:12Z",
    "slot_type": "Standard",
    "status": "Booked",
    "appointment_id": "Consultation",
    "demand_score": 461,
    "created_at": "2026-04-19T12:57:12Z"
  },
  {
    "schedule_slot_id": "b105a77f-b10a-9e6b-1ee2-936480c50e5f",
    "clinician_id": "534910ae-3e85-5479-4364-a0401d36db14",
    "facility_id": "b964403f-8f7c-92dc-a809-d40a303383a6",
    "slot_start": "2026-04-08T14:57:12Z",
    "slot_end": "2026-08-09T00:57:12Z",
    "slot_type": "Overbook",
    "status": "Completed",
    "appointment_id": "Consultation",
    "demand_score": 92,
    "created_at": "2026-08-01T15:57:12Z"
  }
];
