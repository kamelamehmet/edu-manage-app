/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_955655590")

  // fix all rules to use @request.auth.role instead of @request.auth.record.role
  unmarshal({
    "createRule": "@request.auth.id != '' && (@request.auth.role = 'teacher' || @request.auth.role = 'admin')",
    "listRule": "@request.auth.id != '' && (students.id ?= @request.auth.id || teacher = @request.auth.id || @request.auth.role = 'admin')",
    "updateRule": "@request.auth.id != '' && (@request.auth.role = 'admin' || teacher = @request.auth.id)",
    "viewRule": "@request.auth.id != '' && (students.id ?= @request.auth.id || teacher = @request.auth.id || @request.auth.role = 'admin')"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_955655590")

  unmarshal({
    "createRule": "@request.auth.id != '' && (@request.auth.record.role = 'teacher' || @request.auth.record.role = 'admin')",
    "listRule": "@request.auth.id != '' && (students = @request.auth.id || teacher = @request.auth.id || @request.auth.record.role = 'admin')",
    "updateRule": "@request.auth.id != '' && (@request.auth.record.role = 'admin' || teacher = @request.auth.id)",
    "viewRule": "@request.auth.id != '' && (students = @request.auth.id || teacher = @request.auth.id || @request.auth.record.role = 'admin')"
  }, collection)

  return app.save(collection)
})
