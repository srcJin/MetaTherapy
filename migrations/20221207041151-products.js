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
  // CREATE TABLE products (
  //   id integer unsigned primary key auto_increment,
  //   name varchar(255) not null
  //   cost integer not null
  //   description text
  // ) engine = innodb;
  // first argument to db.createTable is the name of the table
  // second argument is an object
  // each KEY will be one column
  // each VALUE will describe the properties of the column
  return db.createTable('products', {
    'id': {
      type:'int',
      primaryKey:true,
      autoIncrement: true,
      unsigned: true
    },
    'name':{
      type:"string",
      length: 255,
      notNull:true
    },
    'cost':{
      type:'int',
      unsigned: true,
      notNull:true
    },
    'description':'text'
  })
};

exports.down = function(db) {
  return db.dropTable('products');
};

exports._meta = {
  "version": 1
};
