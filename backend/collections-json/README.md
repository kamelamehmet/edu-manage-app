PocketBase collections JSON and safe import script

Files in this folder are templates for PocketBase collection imports. They are
meant to be reviewed before importing. Do NOT import `users-extras.json` into
the system `users` collection automatically — follow the manual steps in this
repo's root `backend/collections/PLAN.md` or the instructions below.

Safe import procedure (recommended):

1. Backup your current PocketBase data:

   ```bash
   cd backend
   cp pb_data/data.db pb_data/data.db.bak
   cp -r pb_data pb_data.bak_$(date +%s)
   ```

2. Inspect the files in this folder and adjust collection/field names if needed.

3. Import non-system collections (courses, grades, payments, schedule) using the CLI:

   ```bash
   # from repo root
   cd backend
   ./pocketbase collections import collections-json/courses.json
   ./pocketbase collections import collections-json/grades.json
   ./pocketbase collections import collections-json/payments.json
   ./pocketbase collections import collections-json/schedule.json
   ```

4. For the `users` collection, open the PocketBase Admin UI and add the extra
   fields (`fullName`, `avatar`, `role`) manually (safer). See `../collections/PLAN.md`.

Alternatively you can run the helper script `import_collections.sh` which will
back up `pb_data` and import all non-user JSON files in this folder. Review it
before running.
