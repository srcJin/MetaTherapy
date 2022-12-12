// require in express
const express = require('express');
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
    res.send("Add new product");
})

module.exports = router;