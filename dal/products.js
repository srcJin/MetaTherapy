const {Product, Category, Tag} = require('../models');

async function getAllCategories(){
    const allCategories = await Category.fetchAll().map( (category)=>{
        return [category.get("id"), category.get('name')]
    })

    return allCategories;
}

async function getAllTags() {
    const allTags = await Tag.fetchAll().map( tag => {
        return [tag.get("id"), tag.get("name")];
    })
    return allTags
}

async function getAllProducts() {
    const products = await q.fetch({
        withRelated:['tags', 'category'] // for each product, load in each of the tag
    });
    return products;
}

async function addProduct(productDetails) {
    const productObject = new Product();
    productObject.set('name', productDetails.name);
    productObject.set('cost', productDetails.cost);
    productObject.set('description',productDetails.description);
    productObject.set('category_id', productDetails.category_id);
    productObject.set('image_url', productDetails.image_url);
    await productObject.save();

    // process the tags
    // IMPORTANT: We must have saved the new product first or attach won't work
    if (productDetails.tags) {
        // change it into an array
        const tagArray = productDetails.tags.split(',');
        // we add to a many to many relationship with .attach
        await productObject.tags().attach(tagArray);
    }
    return productObject;
}

module.exports = { getAllCategories, getAllTags, getAllProducts, addProduct}