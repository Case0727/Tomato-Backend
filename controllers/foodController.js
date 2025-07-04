import foodModel from "../models/foodModel.js";
import fs from "fs";


// add food item
const addFood = async (req, res) => {
    // DEBUG: Log incoming request data
    console.log("==== Incoming Add Food Request ====");
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);


    if (!req.file) {
        return res.status(400).json({ success: false, message: "Image file is required" });
    }

    let image_filename = `${req.file.filename}`

    const food = new foodModel({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        category: req.body.category,
        image: image_filename,
    })

    try {
        await food.save();
        res.json({ success: true, message: "Food item added successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to add food item" });
    }
};

// get all food list

const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({ success: true, data: foods });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to get food list" });
    }
}


// Remove food item

const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.params.id);
        fs.unlink(`./uploads/${food.image}`, () => { })

        await foodModel.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Food item removed successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to remove food item" });
    }
}

export { addFood, listFood, removeFood }