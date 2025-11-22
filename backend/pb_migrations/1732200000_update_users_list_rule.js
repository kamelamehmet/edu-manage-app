/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // fix the rule to use @request.auth.role instead of @request.auth.record.role
  // also allow teachers to list users for their courses
  unmarshal({
    "listRule": "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'teacher')",
    "viewRule": "@request.auth.id != '' && (@request.auth.id = id || @request.auth.role = 'admin' || @request.auth.role = 'teacher')",
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  unmarshal({
    "listRule": "@request.auth.id != '' && @request.auth.record.role = 'admin'",
    "viewRule": "@request.auth.id != '' && (@request.auth.id = id || @request.auth.record.role = 'admin')",
  }, collection)

  return app.save(collection)
})
