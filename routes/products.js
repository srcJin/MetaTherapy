// require in express
const express = require('express');
const { createProductForm, createSearchForm, bootstrapField } = require('../forms');
const router = express.Router();

const {Product, Category, Tag} = require('../models');

router.get('/', async function(req,res){

    // get all the categories from the table
    // and return them as an array of arrays
    // each array represents one category: [<id>, <name of category>]
    const allCategories = await Category.fetchAll().map( (category)=>{
        return [category.get("id"), category.get('name')]
    })

    allCategories.unshift(["", 'Any category']);

    const allTags = await Tag.fetchAll().map( tag => {
        return [tag.get("id"), tag.get("name")];
    })

    const searchForm = createSearchForm(allCategories, allTags);

    // always true query
    // a query is not executeed at the database until you call it with fetch()
    const q = Product.collection();  // same as "SELECT * FROM products WHERE 1"

    searchForm.handle(req, {
        'success': async function(form) {

            if (form.data.name) {
                q.where('name', 'like', '%' + form.data.name + "%");
            }

            if (form.data.min_cost) {
                q.where('cost', '>=', form.data.min_cost);
            }

            if (form.data.max_cost) {
                q.where('cost', '<=', form.data.max_cost);
            }

            if (form.data.category_id) {
                q.where('category_id', '=', form.data.category_id);
            }

            if (form.data.tags) {
                // ...JOIN products_tags ON products.id = products_tags.product_id
                q.query('join', 'products_tags', 'products.id', 'product_id')
                  .where('tag_id', 'in', form.data.tags.split(','))
            }

            const products = await q.fetch({
                withRelated:['tags', 'category'] // for each product, load in each of the tag
            });
            res.render('products/index', {
                'products': products.toJSON(), // convert all the products to JSON
                'searchForm': form.toHTML(bootstrapField)
            })

        },
        'empty': async function(form ) {
             // if the search form is empty (i.e, not filled in at all),
             // just get all the products
            const products = await q.fetch({
                withRelated:['tags'] // for each product, load in each of the tag
            });
            res.render('products/index', {
                'products': products.toJSON(), // convert all the products to JSON
                'searchForm': form.toHTML(bootstrapField)
            })
        },
        'error': function() {

        }
    })


    // res.send("search somehow has error")
})

router.get('/add', async function(req,res){

    const allCategories = await Category.fetchAll().map( (category)=>{
        return [category.get("id"), category.get('name')]
    })
    allCategories.unshift([0, "Select one category"]);

    const allTags = await Tag.fetchAll().map( tag => {
        return [tag.get("id"), tag.get("name")];
    })

    const form = createProductForm(allCategories, allTags);
    res.render('products/create', {
        'form': form.toHTML(bootstrapField),
        "cloudinaryName": process.env.CLOUDINARY_NAME,
        "cloudinaryApiKey": process.env.CLOUDINARY_API_KEY,
        "cloudinaryPreset": process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

// process the form for adding a new product
router.post('/add', async function(req,res){

    const allCategories = await Category.fetchAll().map( (category)=>{
        return [category.get("id"), category.get('name')]
    })

    const allTags = await Tag.fetchAll().map( tag => {
        return [tag.get("id"), tag.get("name")];
    })

    const productForm = createProductForm(allCategories, allTags);
    productForm.handle(req, {
        'success': async function(form) {
            // executed when all the form fields passed
            // validation
            // the first argument will be whatever the user type into the form
        
            // an instance (or an object) created from a model represents one row in the table
            const productObject = new Product();
            productObject.set('name', form.data.name);
            productObject.set('cost', form.data.cost);
            productObject.set('description', form.data.description);
            productObject.set('category_id', form.data.category_id);
            productObject.set('image_url', form.data.image_url);
            await productObject.save();

            // process the tags
            // IMPORTANT: We must have saved the new product first or attach won't work
            if (form.data.tags) {
                // change it into an array
                const tagArray = form.data.tags.split(',');
                // we add to a many to many relationship with .attach
                await productObject.tags().attach(tagArray);
            }

            // you can only use a flash message after a redirect
            req.flash('success_messages', `The new product ${productObject.get('name')} has been created`);
            res.redirect('/products');
        },
        'empty': async function(form) {
            // executed if the user just submit without any input
            res.render('products/create',{
                'form': form.toHTML(bootstrapField),
                "cloudinaryName": process.env.CLOUDINARY_NAME,
                "cloudinaryApiKey": process.env.CLOUDINARY_API_KEY,
                "cloudinaryPreset": process.env.CLOUDINARY_UPLOAD_PRESET
            })
        },
        'error': async function(form) {
            // executed if the form has any validation errors

            res.render('products/create',{
                'form': form.toHTML(bootstrapField),
                "cloudinaryName": process.env.CLOUDINARY_NAME,
                "cloudinaryApiKey": process.env.CLOUDINARY_API_KEY,
                "cloudinaryPreset": process.env.CLOUDINARY_UPLOAD_PRESET
            })
        }
    })
})

// route to display the update product form
router.get("/update/:product_id", async function(req,res){
    // extract product id of the product that we want to updage
    const productId = req.params.product_id;

    // get the product that we are updating
    // SELECT * FROM products WHERE id = '${productId}'
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true,
        withRelated:["tags"]  // use withRelated to load in associated relationship
    })



    // .where basically add in the "WHERE ...."
    // .fetch executes the query
    // the `require: true` means that if no results are retrieved, Bookshelf
    // will cause an exception

    // get all the categories
    const allCategories = await Category.fetchAll().map( (category)=>{
        return [category.get("id"), category.get('name')]
    })

    // get all the tags
    const allTags = await Tag.fetchAll().map( tag => {
        return [tag.get("id"), tag.get("name")];
    })

    // create the product form
    const productForm = createProductForm(allCategories, allTags);

    // product.get allows us to retrieve one column's value
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');
    productForm.fields.category_id.value = product.get('category_id');

    // retrieve all the IDs of the related tags in an array
    // for example, if the product is related with tag id 2, 3 and 5, then
    // we need to have an array that looks like this: [2,3,5]
    let selectedTags = await product.related('tags').pluck('id')
    // `pluck` means to retrieve one key/value from the object and put the value into the array

    // set the existing tags for the edited product
    productForm.fields.tags.value = selectedTags;

    res.render('products/update',{
        'form': productForm.toHTML(bootstrapField),
        "cloudinaryName": process.env.CLOUDINARY_NAME,
        "cloudinaryApiKey": process.env.CLOUDINARY_API_KEY,
        "cloudinaryPreset": process.env.CLOUDINARY_UPLOAD_PRESET,
        'product': product.toJSON()
    });
})

router.post('/update/:product_id', async function(req,res){
    const productId = req.params.product_id;
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true,
        withRelated:['tags']
    })

    const productForm = createProductForm();
    // pass the request as the first parameter
    // second parameter: object that has three handlers
    productForm.handle(req, {
        'success': async function(form) {
            // form has no validation error
            // then we proceed to update the product
            // Instead of:
            // product.set('name', form.data.name);
            // product.set('cost', form.data.cost);
            // product.set('description', form.data.description);
            // if the parameter to product.set is an object
            // Bookshelf ORM will try to assign each key as a column

            // extract out the tags, but all the other keys in form.data
            // will go into productData
            const {tags, ...productData} = form.data;
            product.set(productData);
            product.save(); // make the change permanent

            // deal with the tags
            // get the id of all the tags associated with the product
            let existingTagIDs = await product.related('tags').pluck('id');
            // remove all the existing tags
            await product.tags().detach(existingTagIDs);

            // add back all the tags selected in the form
            await product.tags().attach(tags.split(','));

            // req.flash will add a message to the provided category
            // if req.flash is called with two parameters
            // parameter 1 is the category of the flash message
            // parameter 2 is the message itself
            // so the flash message is save in the session
            req.flash('success_messages', "Product has been updated");
            res.redirect('/products');
          
        },
        'empty': async function(form) {
            // form has no data
            res.render('products/update',{
                'form': form,
                "cloudinaryName": process.env.CLOUDINARY_NAME,
                "cloudinaryApiKey": process.env.CLOUDINARY_API_KEY,
                "cloudinaryPreset": process.env.CLOUDINARY_UPLOAD_PRESET
            })
        },
        'error': async function(form) {
            // one or more fields have validation errors
            res.render('products/update', {
                'form': form,
                "cloudinaryName": process.env.CLOUDINARY_NAME,
                "cloudinaryApiKey": process.env.CLOUDINARY_API_KEY,
                "cloudinaryPreset": process.env.CLOUDINARY_UPLOAD_PRESET
            })
        }
    })

})

router.get('/delete/:product_id', async function(req,res){
    // get the product that we want to delete
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true // means if there is no results, Bookshelf will cause an exception (i.e an error)
    });

    res.render('products/delete',{
        'product': product.toJSON()
    })
})

router.post('/delete/:product_id', async function(req,res){
    // retrieving the object that represents the row
    // which we want to delete
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true // means if there is no results, Bookshelf will cause an exception (i.e an error)
    });

    // execute the delete
    await product.destroy();

    res.redirect('/products')

})

module.exports = router;