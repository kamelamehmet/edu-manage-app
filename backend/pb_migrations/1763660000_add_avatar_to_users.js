/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // No-op: avatar field was likely added manually in the Admin UI.
  // Keep this migration file as a marker but do not attempt to add the field
  // to avoid duplicate-field errors when the field already exists.
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")
  return app.save(collection)
}, (app) => {
  // No-op down migration: do not remove the avatar field automatically.
  // If a rollback is required, handle manually to avoid accidental data loss.
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")
  return app.save(collection)
})
