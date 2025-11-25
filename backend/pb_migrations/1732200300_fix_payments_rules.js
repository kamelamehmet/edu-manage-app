/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_631030571")

  unmarshal({
    "createRule": "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.id = student)",
    "listRule": "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.id = student)",
    "updateRule": "@request.auth.id != '' && (@request.auth.role = 'admin')",
    "viewRule": "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.id = student)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_631030571")

  unmarshal({
    "createRule": "@request.auth.id != '' && (@request.auth.record.role = 'admin' || @request.auth.id = student)",
    "listRule": "@request.auth.id != '' && (@request.auth.record.role = 'admin' || @request.auth.id = student)",
    "updateRule": "@request.auth.id != '' && (@request.auth.record.role = 'admin')",
    "viewRule": "@request.auth.id != '' && (@request.auth.record.role = 'admin' || @request.auth.id = student)"
  }, collection)

  return app.save(collection)
})
