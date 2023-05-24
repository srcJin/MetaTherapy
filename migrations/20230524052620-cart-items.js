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
  return db.createTable('cart_items', {
    'id': {
      'type':'int',
      'unsigned': true,
      'primaryKey': true,
      'autoIncrement': true
    },
    'user_id': {
      'type': 'int',
      'unsigned': true,
      'notNull': true,
      'foreignKey': {
        'name': 'cart_items_users_fk',
        'table': 'users',
        'mapping':'id',
        'rules':{
          'onDelete':'CASCADE',
          'onUpdate':'RESTRICT'
        }
      },

    },
    'product_id':{
      'type':'int',
      'unsigned': true,
      'notNull': true,
      'foreignKey':{
        'name':'cart_items_products_fk',
        'table':'products',
        'mapping':'id',
        'rules':{
          'onDelete':'CASCADE',
          'onUpdate':'RESTRICT'
        }
      }
    },
    'quantity':{
      'type':'int',
      'unsigned': true,
      'defaultValue': 0,
      'notNull': true
    }
  })
};

exports.down = function(db) {
  db.dropTable('cart_items')
};

exports._meta = {
  "version": 1
};