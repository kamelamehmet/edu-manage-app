# PocketBase Collections Plan — EduManage (Phase 2)

This file describes the PocketBase collections and field schema for Phase 2 (data modelling).
It includes recommended field definitions and PocketBase rule expressions. Import these via the PocketBase Admin UI
(`Collections -> Import`) or create them manually.

Notes about rules:
- PocketBase collection rules use the built-in expression language. I provided recommended expressions below, but
  depending on how your collections/fields are named you might need to tweak them in the PB Admin UI.
- For strict guarantees (for example: only a course's teacher may create grades) prefer server-side hooks (`pb_hooks`) to
  validate relationships because collection rules have limited querying ability.

---

## Users (system `users` collection)

We will extend the built-in `users` auth collection with additional fields.

Fields to add:
- `fullName` — type: `text`, required: true
- `avatar` — type: `file`, required: false
- `role` — type: `select`, required: true, options: `['student','teacher','admin']`

Recommended validations:
- `fullName` required and min length (use collection field validation)
- `role` is required and must be one of the select values

Example rule snippets (evaluate/tweak in PB UI):
- No special list/view rules for admin-users; rely on the default auth behaviour and collection-level rules for sensitive access.

---

## Courses collection (`courses`)

Create a new collection named `courses`.

Fields:
- `title` — `text`, required
- `description` — `editor` or `text`, optional
- `teacher` — `relation` to `users` (single select), required
- `students` — `relation` to `users` (multiple select), optional, minSelect:0, maxSelect:0 (0 means unlimited)

Suggested rules:
- `createRule`: "@request.auth.id != '' && (@request.auth.record.role = 'teacher' || @request.auth.record.role = 'admin')"
- `updateRule`: same as createRule (or only admins and the assigned teacher):
  "@request.auth.id != '' && (@request.auth.record.role = 'admin' || teacher = @request.auth.id)"
- `viewRule` / `listRule`: allow students to view courses they are enrolled in, teachers to view their courses, admins everything:
  "@request.auth.id != '' && (students = @request.auth.id || teacher = @request.auth.id || @request.auth.record.role = 'admin')"

Notes: for relation checks the expression `teacher = @request.auth.id` should work if `teacher` stores the user id.

---

## Grades collection (`grades`)

Create `grades` collection.

Fields:
- `student` — `relation` to `users` (single), required
- `course` — `relation` to `courses` (single), required
- `value` — `number` (or `text` if you prefer letter grades), required
- `note` — `text`, optional

Suggested rules:
- `createRule` / `updateRule`: ideally only the teacher assigned to the referenced `course` or admin can create/update.
  PocketBase expression language can't easily dereference related records in rules; recommended approaches:
  1) Use a server-side hook (pb_hooks) to validate that `@request.auth.id` equals the `teacher` field of the referenced `course`.
  2) Temporary rule: allow only authenticated teachers/admins to create/update, then validate ownership on hooks.

Example (less strict) create/update rule:
  "@request.auth.id != '' && (@request.auth.record.role = 'teacher' || @request.auth.record.role = 'admin')"

---

## Payments collection (`payments`)

Create `payments` collection.

Fields:
- `student` — `relation` to `users` (single), required
- `course` — `relation` to `courses` (single), required
- `amount` — `number`, required
- `status` — `select` (values: `pending`, `paid`, `failed`, `refunded`), required
- `date` — `date`, required (or default to now)

Suggested rules:
- `viewRule`: allow admin or the student referenced in the record to view:
  "@request.auth.id != '' && (@request.auth.record.role = 'admin' || @request.auth.id = student)"
- `createRule`: allow admin and (optionally) student or backend service to create payment records.

---

## Schedule collection (`sessions` or `schedule`)

Create `schedule` (or `sessions`).

Fields:
- `course` — `relation` to `courses` (single), required
- `startTime` — `date`, required (use datetime)
- `endTime` — `date`, required
- `location` — `text` or `select`, optional

Suggested rules:
- `createRule` / `updateRule`: "@request.auth.id != '' && (@request.auth.record.role = 'admin' || @request.auth.record.role = 'teacher')"
- Optionally restrict to the course teacher only (use hooks to validate `course.teacher == @request.auth.id`).

---

## Students / Teachers

- Students and teachers are not separate collections; they are `users` with `role` set to `student` or `teacher`.
- `student` access rule (for their user record):
  - `viewRule`: "@request.auth.id != '' && @request.auth.id = id" (student can view their own record)
  - `updateRule`: perhaps allow updates to some fields only (profile fields), or use `@request.auth.id = id`.
- `teacher` access rule: teachers can view their own user record and should be able to view courses where they are assigned (course rules above).

---

## Implementation recommendations

1. Start the PocketBase server locally: `cd backend && ./pocketbase serve`.
2. Open the admin UI: `http://127.0.0.1:8090/_/` and go to Collections.
3. For `users`: open the `users` system collection, add the fields (`fullName`, `avatar`, `role`) using the UI.
4. Create `courses`, `grades`, `payments`, and `schedule` collections using the UI and add the fields as specified above.
5. Set the collection rules in the UI. If you need strict cross-collection checks (e.g., grade creation only by the course teacher), implement a PB hook in `backend/pb_hooks` to validate on create/update.


