'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  // first parameter: the table to add the new column to
  // second parameter: the name of the new column 
  // for bookshelf, the foreign key name MUST BE the table name, in singluar form, with '_id' at the back
  // third parameter: the object that holds the definition
  return db.addColumn("products", "category_id",{
      'type': 'int',
      'unsigned': true,
      'notNull': true
  });
};

exports.down = function(db) {
  return db.removeColumn('products', 'category_id');
};

exports._meta = {
  "version": 1
};
