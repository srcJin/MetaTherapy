// require in express
const express = require('express');
const { createProductForm, bootstrapField } = require('../forms');
const router = express.Router();

const {Product, Category, Tag} = require('../models');

router.get('/', async function(req,res){
    // get all the products
    const products = await Product.collection().fetch({
        withRelated:['tags'] // m2m relationship:  for each product, load in each of the tags 
        // withRelated: bookshelf will join the pivot table
        // paul: use withRelated to load in associated relationship
    });

    console.log(products.toJSON())

    res.render('products/index', {
        'products': products.toJSON() // convert all the products to JSON
    })
})

router.get('/add', async function(req,res){

    const allCategories = await Category.fetchAll().map( (category)=>{
        return [category.get("id"), category.get('name')]
    })

    const form = createProductForm(allCategories);
    res.render('products/create', {
        'form': form.toHTML(bootstrapField)
    })
})

// add a new category
router.post('/add', async function(req,res){

    const allCategories = await Category.fetchAll().map( (category)=>{
        return [category.get("id"), category.get('name')]
    })

    // get all the tags  @todo make it an function
    const allTags = await Tag.fetchAll().map( tag => [tag.get('id'), tag.get('name')]);

    // create a product form and display all Tags
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
            await productObject.save();

            // process the tags
            if (form.data.tags) {
                // change it into an array
                const tagArray = form.data.tags.split(',');
                // add to a many to many relationship with .attach
                await productObject.tags().attach(tagArray)
            }

            res.redirect('/products');
        },
        'empty': async function(form) {
            // executed if the user just submit without any input
            res.render('products/create',{
                'form': form.toHTML(bootstrapField)
            })
        },
        'error': async function(form) {
            // executed if the form has any validation errors

            res.render('products/create',{
                'form': form.toHTML(bootstrapField)
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
        withRelated:["tags"] // use withRelated to load in associated relationship
    })
    // .where basically add in the "WHERE ...."
    // .fetch executes the query
    // the `require: true` means that if no results are retrieved, Bookshelf
    // will cause an exception

    // get all the categories
    const allCategories = await Category.fetchAll().map( (category)=>{
        return [category.get("id"), category.get('name')]
    })

    // get all the tags  @todo make it an function
    const allTags = await Tag.fetchAll().map( tag => [tag.get('id'), tag.get('name')]);

    // create the product form
    const productForm = createProductForm(allCategories,allTags);
    // product.get allows us to retrieve one column's value
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');
    productForm.fields.category_id.value = product.get('category_id')


    // 14th dec, to pre-select the tags in the update page
    // retrieve all the IDs of the related tags in an array
    // for example. if product with tag id 2,3,5, we need the array [2,3,5]
    let selectedTags = await product.related('tags').pluck('id')
    //`pluck` means to retrieve one key/value from  the object and put the value into a array

    // then set the existing tags for the edited product
    productForm.fields.tags.value = selectedTags;

    res.render('products/update',{
        'form': productForm.toHTML(bootstrapField)
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

            // first extract the data without tag
            const {tags, ...productData} = form.data;
            product.set(productData);
            product.save(); // make the change permanent

            // then deal with the tags
            // remove all existing tags
            let existingTagIDs = await product.related('tags').pluck('id');
            // remove all the existing tags
            await product.tags().detach(existingTagIDs);

            // add back all the tags selected in the form
            await product.tags().attach(tags.split('.'));

            res.redirect('/products');
        },
        'empty': async function(form) {
            // form has no data
            res.render('products/update',{
                'form': form
            })
        },
        'error': async function(form) {
            // one or more fields have validation errors
            res.render('products/update', {
                'form': form
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