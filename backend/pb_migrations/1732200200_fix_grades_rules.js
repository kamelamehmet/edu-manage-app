/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_233839710")

  unmarshal({
    "createRule": "@request.auth.id != '' && (@request.auth.role = 'teacher' || @request.auth.role = 'admin')",
    "listRule": "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'teacher' || @request.auth.role = 'student')",
    "updateRule": "@request.auth.id != '' && (@request.auth.role = 'teacher' || @request.auth.role = 'admin')",
    "viewRule": "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.id = student || @request.auth.role = 'teacher')"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_233839710")

  unmarshal({
    "createRule": "@request.auth.id != '' && (@request.auth.record.role = 'teacher' || @request.auth.record.role = 'admin')",
    "listRule": "@request.auth.id != '' && (@request.auth.record.role = 'admin' || @request.auth.record.role = 'teacher' || @request.auth.record.role = 'student')",
    "updateRule": "@request.auth.id != '' && (@request.auth.record.role = 'teacher' || @request.auth.record.role = 'admin')",
    "viewRule": "@request.auth.id != '' && (@request.auth.record.role = 'admin' || @request.auth.id = student || @request.auth.record.role = 'teacher')"
  }, collection)

  return app.save(collection)
})
