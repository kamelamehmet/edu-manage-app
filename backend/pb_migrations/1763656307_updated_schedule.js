/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_443959778")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != '' && (@request.auth.record.role = 'admin' || @request.auth.record.role = 'teacher')",
    "listRule": "",
    "updateRule": "@request.auth.id != '' && (@request.auth.record.role = 'admin' || @request.auth.record.role = 'teacher')",
    "viewRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_443959778")

  // update collection data
  unmarshal({
    "createRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
