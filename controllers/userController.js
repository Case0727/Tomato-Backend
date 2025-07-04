import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";

// Login user

const loginUser = async (req, res) => {

    const { email, password } = req.body;
    try {

        const user = await userModel.findOne({ email });


        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }
        const token = createToken(user._id);
        res.json({ success: true, token, name: user.name });

    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to login user" });
    }

}

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}
// Register User

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Checking user already exists
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" });
        }
        // Validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Invalid email format" });
        }

        // Validating password length
        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters long" });
        }

        // Encrypting password

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword
        });

        const user = await newUser.save();
        const token = createToken(user._id);
        res.json({ success: true, token });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to register user" });

    }
}

export { loginUser, registerUser }