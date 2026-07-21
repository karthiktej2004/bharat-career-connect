# Job Fair End-to-End Workflow

Rebuild `/employer/events` and add supporting pages so a job fair is a gated, multi-step experience instead of a static card list.

## 1. Employer — Job Fair listing (`/employer/events`)

Each event card shows one of four states, driven by mock store:

- **Not Applied** → `Apply for Stall` button. Opens dialog (company details, expected footfall, roles to hire, preferred stall zone). On submit → status `Pending Approval`, toast "Application sent to admin".
- **Pending Approval** → amber badge "Awaiting admin approval". Card body shows only event date/venue. No stall info yet.
- **Approved** → green badge "Approved". Reveal stall block: stall number, hall/zone, `View Map` (Google-Maps-style dialog with pin + directions link), gate entry instructions. Big primary CTA: `Mark Attendance` (opens QR scanner). Event workspace is **locked** until attendance is marked.
- **Attendance Marked** → green ✓ "Attendance marked · Stall A-12". CTA becomes `Open Event Workspace` → routes to `/employer/events/$id`.

## 2. Attendance scanner (dialog inside employer events page)

- Camera-style QR scan UI (mock: input box + "Simulate scan" button using the admin-issued event scanner code).
- Manual fallback: enter 6-digit event code from admin.
- After success: mark attendance in store, toast, unlock workspace.

## 3. Admin — Job Fair applications (`/admin/jobfair` — reuse existing route)

- New tab "Stall Applications": list of employer applications with Approve / Reject buttons + stall assignment (stall no, hall).
- Admin also generates the event's attendance code (shown on event detail).

## 4. Admin — one universal scanner (`/admin/qr` — existing)

Extend so scanning a person's QR asks: **Candidate or Employer?**
Under it: small link "New here? Quick register" → mini form (name, phone, role) that auto-creates a platform ID (`BCC-C-xxxxx` / `BCC-E-xxxxx`) and marks them attended.

## 5. Employer — Event Workspace (`/employer/events/$id`)

Guarded route: if attendance not marked → redirect back with toast.
Layout: sub-tabs
- **Job Postings** — post/edit jobs *scoped to this event + this day only*. Reuses job form; auto-tags `eventId` + today's date; not shown on the global `/employer/jobs` list.
- **Applications** — candidates who applied to these event jobs. Plus a **Candidate ID Lookup** search bar: type `BCC-C-xxxxx` → fetches full candidate profile (skills, resume link, experience) even if they didn't apply. Actions: `Shortlist`, `Interview`, `Hire`, `Reject`.
- **Interviews** — schedule/track interviews for candidates from this event.

## 6. Mock store additions (`src/lib/mockStore.ts`)

```
StallApplication { id, eventId, employerId, status: 'pending'|'approved'|'rejected',
                   stallNo?, hall?, mapLat?, mapLng?, attended: boolean, attendedAt? }
Job.eventId?: string   // event-scoped postings
Candidate.publicId: string  // BCC-C-xxxxx lookup key
```

Helpers: `applyForStall`, `approveStall`, `markStallAttendance`, `listEventJobs`, `findCandidateByPublicId`, `getStallApplication(eventId, employerId)`.

## 7. Files

**New**
- `src/routes/employer.events.$id.tsx` — gated workspace with 3 sub-tabs
- `src/components/StallApplyDialog.tsx`
- `src/components/AttendanceScanDialog.tsx`
- `src/components/StallMapDialog.tsx`
- `src/components/CandidateIdLookup.tsx`

**Edit**
- `src/routes/employer.events.tsx` — 4-state card, hide details until approved, lock workspace until attended
- `src/routes/admin.jobfair.tsx` — Stall Applications tab + assign/approve
- `src/routes/admin.qr.tsx` — role prompt + quick-register mini form
- `src/lib/mockStore.ts` — types + helpers listed above

## 8. Out of scope

Real Google Maps integration (mock static map image + coords), real camera QR decoding (simulate), payment for stall.

Confirm and I'll build it.
