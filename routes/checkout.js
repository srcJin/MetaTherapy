const express = require('express');
const router = express.Router();

const cartServices = require('../services/cart_items');
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.get("/", async function(req,res){
    const cartItems = await cartServices.getUserCart(req.session.user.id);
    
    // create the line items for the checkout session (aka invoice)
    const lineItems = [];
    // create the meta data
    const meta = []; // we need it 

    // cartItems is still an array of Bookshelf model instances
    for (let i of cartItems) {
        const lineItem = {
            'quantity': i.get('quantity'),
            'price_data':{
                'currency':'SGD',
                'unit_amount': i.related('product').get('cost'),
                'product_data':{
                    'name': i.related('product').get('name'),
                    'description':i.related('product').get('description')
                }
            }
        }

        // check if the product has an image
        if (i.related('product').get('image_url')) {
            lineItem.price_data.product_data.images = [ i.related('product').get('image_url')]
        }

        lineItems.push(lineItem);

        // record how many quantity has been purchased for this product id
        meta.push({
            'product_id': i.get('product_id'),
            'quantity': i.get('quantity')
        })

    }

    // create the payment

    // change the meta array into a JSON string
    let metaData = JSON.stringify(meta);
    const payment = {
        payment_method_types:["card"],
        mode:'payment',
        line_items: lineItems,
        success_url: "http://www.google.com",
        cancel_url: "http://www.yahoo.com",
        metadata:{
            'orders': metaData
        }
    }

    // create the session
    const stripeSession = await Stripe.checkout.sessions.create(payment);
    res.render('checkouts/checkout', {
        'sessionId': stripeSession.id,
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })
})

module.exports = router;