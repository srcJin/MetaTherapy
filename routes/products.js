// require in express
const express = require('express');
const { createProductForm, bootstrapField } = require('../forms');
const router = express.Router();

const {Product} = require('../models');

router.get('/', async function(req,res){
    // get all the products
    const products = await Product.collection().fetch();
    res.render('products/index', {
        'products': products.toJSON() // convert all the products to JSON
    })
})

router.get('/add', function(req,res){
    const form = createProductForm();
    res.render('products/create', {
        'form': form.toHTML(bootstrapField)
    })
})

// process the form
router.post('/add', function(req,res){
    const productForm = createProductForm();
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
            await productObject.save();
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

module.exports = router;