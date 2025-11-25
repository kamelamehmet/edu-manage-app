/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_443959778")

  unmarshal({
    "createRule": "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'teacher')",
    "updateRule": "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'teacher')"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_443959778")

  unmarshal({
    "createRule": "@request.auth.id != '' && (@request.auth.record.role = 'admin' || @request.auth.record.role = 'teacher')",
    "updateRule": "@request.auth.id != '' && (@request.auth.record.role = 'admin' || @request.auth.record.role = 'teacher')"
  }, collection)

  return app.save(collection)
})
