const productDataLayer  = require("../dal/cart_items");

// async function getUserCart(userId) {
//     return await productDataLayer.getCart(userId);
// }

async function addToCart(userId, productId, quantity) {

    const cartItem= await productDataLayer.createCartItem(userId, productId, quantity);
    return cartItem;
}

module.exports = { addToCart }
// async function updateQuantity(userId, productId, newQuantity) {
//     // todo: validiton regarding stock or whether the quantity be changed
//     // according to the business rules
//     return await productDataLayer.updateQuantity(userId, productId, newQuantity);
// }

// async function removeFromCart(userId, productId) {
//     await productDataLayer.removeFromCart(userId, productId)
// }

// module.exports = { addToCart, getUserCart, updateQuantity, removeFromCart }