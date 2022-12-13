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
  // first parameter: the table to add the foreign key
  // second parameter: the table on the other end of the foregin key
  // third parameter: the name of the foreign key
  return db.addForeignKey('products', 'categories', 'products_categories_fk', {
    'category_id':'id'
  },{
    onDelete:"CASCADE",  // if a category is deleted, then all the products associated with that category will be deleted as well
    onUpdate:"RESTRICT"
  })
};

exports.down = function(db) {
  return db.removeForeignKey('products', 'products_categories_fk');
};

exports._meta = {
  "version": 1
};
