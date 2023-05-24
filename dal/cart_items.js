const { CartItem } = require("../models");

async function getCart(userId) {
    return await CartItem.collection().where({
        'user_id': userId
    }).fetch({
        require: false,
        withRelated:['product','product.category', 'product.tags']
    })
}

// add a new product to a shopping cart
// should not be connected to express

async function createCartItem(userId, productId, quantity) {
    // one instance of a model => one row inside the table
    const cartItem = new CartItem({
        'user_id': userId,
        'product_id': productId,
        'quantity': quantity
    })

    await cartItem.save()
    return cartItem;
}


// given a userId and productId, get the
// cart item
async function getByProductAndUser(userId, productId) {
    return await CartItem.where({ //when userId and productId matches current, fetch
        'user_id': userId,
        'product_id': productId
    }).fetch({
        require: false
    })

}


async function updateQuantity(userId, productId, newQuantity) {
    const cartItem = await getByProductAndUser(userId, productId);
    if (cartItem) {
        // console.log("newQuantity =", newQuantity);
        cartItem.set('quantity', newQuantity);
        await cartItem.save();
        return cartItem;
    } else {
        return false;
    }
}

module.exports = { createCartItem, getByProductAndUser, updateQuantity, getCart }


// async function removeFromCart(userId, productId) {
//     const cartItem = await getByProductAndUser(userId, productId);
//     if (cartItem) {
//         await cartItem.destroy();
//         return true;
//     }
//     return false;
// }


// module.exports = { createCartItem, 
//     getByProductAndUser, 
//     updateQuantity, 
//     getCart,
//     removeFromCart
// };