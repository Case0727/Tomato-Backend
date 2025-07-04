import userModel from "../models/userModel.js";

// Add to Cart User Cart
const addToCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = userData.cartData || {};
        if (!cartData[req.body.itemId]) {
            cartData[req.body.itemId] = 1;
        }
        else {
            cartData[req.body.itemId] += 1;
        }
        await userModel.findByIdAndUpdate(req.body.userId, { cartData });
        res.json({ success: true, message: "Item added to cart" });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to add item to cart" });
    }
}

// Remove from Cart User Cart
const removeFromCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = userData.cartData || {};
        if (cartData[req.body.itemId] && cartData[req.body.itemId] > 0) {
            cartData[req.body.itemId] -= 1;
            if (cartData[req.body.itemId] === 0) {
                delete cartData[req.body.itemId];
            }
        }
        await userModel.findByIdAndUpdate(req.body.userId, { cartData });
        res.json({ success: true, message: "Item removed from cart" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to remove item from cart" });
    }
}

// Fetch User Cart Dataz
const getCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = userData.cartData || {};
        res.json({ success: true, data: cartData });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to get cart data" });
    }
}

export { addToCart, removeFromCart, getCart }
