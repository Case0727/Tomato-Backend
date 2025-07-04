import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://root:root@cluster2.zfu5qsb.mongodb.net/food-del').then(() => console.log("Database Connected"));
}