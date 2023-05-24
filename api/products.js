const express = require('express')
const router = express.Router();

const productDataLayer = require('../dal/products')

router.get('/', async(req,res)=>{
    // res.send(await productDataLayer.getAllProducts())
    const products = await productDataLayer.getAllProducts();
    res.json({'products': products.toJSON()})
})

router.post('/', async function(req,res){
    const productForm = createProductForm();
    productForm.handle(req,{
        'success': async function(form) {
            const product = await addProduct(form.data)
            res.json(product.toJSON());
        },
        'error': async function(form) {
            // create an error object to store all error messages
            let errors = {};
            // go through each field and extract out the errors
            for (let key in form.fields) {
                // check if the field associated with the current key
                if (form.fields[key].error) {
                    errors[key] = forms.fields[key].error;
                }
            }
            res.status(400);
            res.json(errors);
        },
        'empty': async function(form){
            res.status(400);
            res.json({
                'error':'No data recieved'
            })
        }
    })
})

module.exports = router;
