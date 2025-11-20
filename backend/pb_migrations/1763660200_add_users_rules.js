/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // set rules: users can view/update their own record; admins can view/list/update all
  unmarshal({
    "listRule": "@request.auth.id != '' && @request.auth.record.role = 'admin'",
    // compare authenticated id to record id using the field name 'id'
    "viewRule": "@request.auth.id != '' && (@request.auth.id = id || @request.auth.record.role = 'admin')",
    "updateRule": "@request.auth.id != '' && (@request.auth.id = id || @request.auth.record.role = 'admin')"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // rollback: clear the rules (set to null)
  unmarshal({
    "listRule": null,
    "viewRule": null,
    "updateRule": null
  }, collection)

  return app.save(collection)
})
