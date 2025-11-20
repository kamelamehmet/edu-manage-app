/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_955655590")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != '' && (@request.auth.record.role = 'teacher' || @request.auth.record.role = 'admin')",
    "listRule": "@request.auth.id != '' && (students = @request.auth.id || teacher = @request.auth.id || @request.auth.record.role = 'admin')",
    "updateRule": "@request.auth.id != '' && (@request.auth.record.role = 'admin' || teacher = @request.auth.id)",
    "viewRule": "@request.auth.id != '' && (students = @request.auth.id || teacher = @request.auth.id || @request.auth.record.role = 'admin')"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_955655590")

  // update collection data
  unmarshal({
    "createRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
