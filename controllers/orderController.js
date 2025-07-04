import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Placing user order for Frontend

const placeOrder = async (req, res) => {

    const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";

    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
        });
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name
                },
                unit_amount: Math.round((item.price / 80) * 100), // convert INR to USD cents
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: "usd",
                product_data: {
                    name: "Delivery Charges",
                },
                unit_amount: Math.round((40 / 80) * 100), // convert INR ₹40 to USD cents
            },
            quantity: 1,
        })

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: "payment",
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        })
        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to place order" });
    }
}

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success == "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: "true" });
            // console.log("Order placed successfully");
            res.json({ success: true, message: "Order placed successfully" });
        }
        else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Order failed" });
        }
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to verify order" });
    }
}

// User Orders for Frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId }).sort({ _id: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to get user orders" });
    }
};

// Listing order for Admin
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ _id: -1 });
        res.json({ success: true, data: orders });
    }
    catch (error) {
        console.log(error);
        res.json9({ success: false, message: "Failed to get orders" });

    }
}

// API for updating order status

const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Order status updated" });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to update order status" });
    }
}

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
