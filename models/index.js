// if you require a folder, without stating the file name
// by default, require will look for the index.js
const bookshelf = require('../bookshelf');

// Create a model
// A model is like a class -- it represents one TABLE in your DATABASE
// The name of the model must be the name of the corresponding table
// but singular and the first alphabet of each word must be upper case
// the table name must be plural, all undercase and using _ instead of spacees
const Product = bookshelf.model('Product',{
    tableName:'products',
    // the name of the function is the name of the category
    // it should be the singular form of the MODEL's name in lowercase
    category() {
        // the first parameter is the NAME of the MODEL that the Product model
        // has relationship with
        return this.belongsTo('Category');
    }

})

// one model for one table
// the name of the model should be the 
// - singular form
// - the alphabet of each word in upper case
// - basically, Pascal Case (eg. She Sells Seashells At The Seashore)
// "customer_orders" => "CustomerOrder"
const Category = bookshelf.model('Category',{
    tableName:"categories",
    // because one category has many products, so we use the plural form of the
    // model name (in lowercase)
    products() {
        // the first parameter is the name of the Model that it has relationship with
        return this.hasMany('Product')
    }
})

module.exports = {
   Product, Category
}