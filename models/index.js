// if you require a folder, without stating the file name
// by default, require will look for the index.js
const bookshelf = require('../bookshelf');

// Create a model
// A model is like a class -- it represents one TABLE in your DATABASE
// The name of the model must be the name of the corresponding table
// but singular and the first alphabet of each word must be upper case
// the table name must be plural, all undercase and using _ instead of spacees
const Product = bookshelf.model('Product',{
    tableName:'products'
})

module.exports = {
   Product
}