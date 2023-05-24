const {createCartItem, updateQuantity, getByProductAndUser} = require('../dal/cart_items')

const productDataLayer  = require("../dal/cart_items");
const { CartItem } = require('../models');

async function getUserCart(userId) {
    return await productDataLayer.getCart(userId);
}



async function addToCart(userId, productId, quantity) {

    // check if the productId has already been added to the user's cart
    const existingItem = await getByProductAndUser(userId, productId)
    if (!existingItem) {
        const cartItem = await createCartItem(userId, productId, quantity);
        return cartItem
    } else {
        await updateQuantity(userId, productId, existingItem.get('quantity') + 1 );
    }

    const cartItem= await createCartItem(userId, productId, quantity);
    return cartItem;
}

module.exports = { addToCart,getUserCart }
// async function updateQuantity(userId, productId, newQuantity) {
//     // todo: validiton regarding stock or whether the quantity be changed
//     // according to the business rules
//     return await productDataLayer.updateQuantity(userId, productId, newQuantity);
// }

// async function removeFromCart(userId, productId) {
//     await productDataLayer.removeFromCart(userId, productId)
// }

// module.exports = { addToCart, getUserCart, updateQuantity, removeFromCart }