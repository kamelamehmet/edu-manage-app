/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_233839710")

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_955655590",
    "hidden": false,
    "id": "relation379482041",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "course",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number494360628",
    "max": null,
    "min": null,
    "name": "value",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3485334036",
    "max": 0,
    "min": 0,
    "name": "note",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_233839710")

  // remove field
  collection.fields.removeById("relation379482041")

  // remove field
  collection.fields.removeById("number494360628")

  // remove field
  collection.fields.removeById("text3485334036")

  return app.save(collection)
})
