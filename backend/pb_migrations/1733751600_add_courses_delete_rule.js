/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_955655590")

  // add deleteRule to allow admins to delete courses
  collection.deleteRule = "@request.auth.id != '' && @request.auth.role = 'admin'"

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_955655590")

  // revert: remove deleteRule
  collection.deleteRule = null

  return app.save(collection)
})
