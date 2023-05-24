const express = require('express');
const { checkIfAuthenticated } = require('../middlewares');
const { addToCart, getUserCart, updateCartItemQuantity, removeCartItem } = require('../services/cart_items');
const { getByProductAndUser } = require('../dal/cart_items');
const router = express.Router();

router.get('/', checkIfAuthenticated, async function(req,res){
    // get all the items in the user's shopping cart
    // must from service layer, not dal layer
    const cart = await getUserCart(req.session.user.id);
    return res.render('cart/index', {
        'cart': cart.toJSON()
    })
})

router.get('/add/:product_id', checkIfAuthenticated,  async function(req,res){
    const userId = req.session.user.id;
    const productId = req.params.product_id;


    await addToCart(userId, productId, 1);
    // res.send("Product has been added to cart")
    req.flash("success_messages", "The item has been added");
    res.redirect('/cart/')
})

// update cart item
router.post('/update/:product_id', checkIfAuthenticated, async function(req,res){
    const newQuantity = req.body.newQty;
    const productId = req.params.product_id;
    await updateCartItemQuantity(req.session.user.id, productId, newQuantity);
    req.flash('success_messages', "The quantity has been updated");
    res.redirect('/cart');
})

// delete cart item
router.get('/remove/:product_id', checkIfAuthenticated, async function(req, res){
    await removeCartItem(req.session.user.id, req.params.product_id);
    req.flash('success_messages', 'The product has been removed from your cart');
    res.redirect('/cart');
})

module.exports = router;