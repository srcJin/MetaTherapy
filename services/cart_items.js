const productDataLayer  = require("../dal/cart_items");

async function getUserCart(userId) {
    return await productDataLayer.getCart(userId);
}

async function addToCart(userId, productId, quantity) {

    // check if the productId has already been added to the user's cart
    const existingItem = await productDataLayer.getByProductAndUser(userId, productId );

    if (!existingItem) {
        const cartItem= await productDataLayer.createCartItem(userId, productId, quantity);
        return cartItem;
    } else {
        return await productDataLayer.updateQuantity(userId, productId, existingItem.get('quantity') + 1 );
    }
}

async function updateQuantity(userId, productId, newQuantity) {
    // todo: validiton regarding stock or whether the quantity be changed
    // according to the business rules
    return await productDataLayer.updateQuantity(userId, productId, newQuantity);
}

async function removeFromCart(userId, productId) {
    await productDataLayer.removeFromCart(userId, productId)
}

module.exports = { addToCart, getUserCart, updateQuantity, removeFromCart }