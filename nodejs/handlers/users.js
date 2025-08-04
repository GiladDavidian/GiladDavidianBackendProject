import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { model, Schema } from "mongoose";
import "dotenv/config";
import { registerSchema, loginSchema } from "../handlers/usersJoi.js";

const JWT_SECRET = process.env.JWT_SECRET;

const router = Router();

const Name = new Schema({
    first: String,
    middle: String,
    last: String,
});

const Address = new Schema({
    state: String,
    country: String,
    city: String,
    street: String,
    houseNumber: String,
});

const Image = new Schema({
    url: String,
    alt: String,
});

const UserSchema = new Schema({
    name: Name,
    isBusiness: Boolean,
    phone: String,
    email: { type: String, unique: true },
    password: String,
    address: Address,
    image: Image,
    isAdmin: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const User = model("usersProject", UserSchema);

router.post("/", async (req, res) => {
    const item = req.body;

    const { error } = registerSchema.validate(item);
    if (error) {
        return res.status(400).send({ message: error.details[0].message });
    }

    try {
        // שלב 2: בדיקה אם האימייל כבר קיים במסד הנתונים
        const userFind = await User.findOne({ email: item.email });
        if (userFind) {
            return res.status(400).send({ message: "Email already registered" });
        }

        // שלב 3: אם האימייל ייחודי, ממשיכים בתהליך יצירת המשתמש
        const hashedPassword = await bcrypt.hash(item.password, 10);
        const user = new User({
            name: {
                first: item.name.first,
                middle: item.name.middle,
                last: item.name.last,
            },
            isBusiness: item.isBusiness,
            phone: item.phone,
            email: item.email,
            password: hashedPassword,
            address: {
                state: item.address?.state,
                country: item.address.country,
                city: item.address.city,
                street: item.address.street,
                houseNumber: item.address.houseNumber,
            },
            image: {
                url: item.image?.url,
                alt: item.image?.alt,
            },
        });

        const newUser = await user.save();
        res.status(201).send(newUser);
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).send({ message: "Error creating user" });
    }
});

// ... שאר הראוטרים נשארים ללא שינוי ...
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).send({ message: error.details[0].message });
    }
    try {
        const userFind = await User.findOne({ email });
        if (!userFind) {
            return res.status(403).send({ message: "Invalid email or password." });
        }
        const passwordMatch = await bcrypt.compare(password, userFind.password);
        if (!passwordMatch) {
            return res.status(403).send({ message: "Invalid email or password." });
        }
        const obj = {
            userId: userFind._id,
            isBusiness: userFind.isBusiness,
            isAdmin: userFind.isAdmin,
        };
        const token = jwt.sign(obj, JWT_SECRET, { expiresIn: "15m" });
        res.status(200).send({ token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send({ message: "Login failed due to server error." });
    }
});
router.get("/", async (req, res) => {
    const token = req.header("x-auth-token");
    if (!token) {
        return;
    }
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.isAdmin) {
        const data = await User.find();
        res.send(data);
    } else {
        res.status(400).send({ message: "User does not have permissions!" });
    }
});
router.get("/:id", async (req, res) => {
    const token = req.header("x-auth-token");
    if (!token) {
        return;
    }
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload.isBusiness) {
        const user = await User.findById(req.params.id);
        res.send(user);
    } else {
        res.status(400).send({ message: "User does not have permissions!" });
    }
});
router.put("/:id", async (req, res) => {
    const token = req.header("x-auth-token");
    if (!token) {
        return;
    }
    const { name, phone, email, password, address, image } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(403).send({ message: "user not found" });
    }
    user.name.first = name.first;
    user.name.middle = name.middle;
    user.name.last = name.last;
    user.phone = phone;
    user.email = email;
    user.password = password;
    user.address.state = address.state;
    user.address.country = address.country;
    user.address.city = address.city;
    user.address.street = address.street;
    user.address.houseNumber = address.houseNumber;
    user.image.url = image.url;
    user.image.alt = image.alt;
    await user.save();
    res.end();
    res.send(user);
});
router.patch("/:id", async (req, res) => {
    const token = req.header("x-auth-token");
    if (!token) {
        return;
    }
    const { isBusiness } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(403).send({ message: "user not found" });
    }
    user.isBusiness = isBusiness;
    await user.save();
    res.end();
    res.send(user);
});
router.delete("/:id", async (req, res) => {
    const token = req.header("x-auth-token");
    if (!token) {
        return;
    }
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload.isBusiness) {
        try {
            const result = await User.findByIdAndDelete(req.params.id);
            if (!result) {
                return res.status(404).send({ message: "User not found." });
            }
            res.status(200).send({ message: "User deleted successfully." });
        } catch (error) {
            console.error("Error deleting user:", error);
            if (error.name === "CastError") {
                return res.status(400).send({ message: "Invalid user ID format." });
            }
            res.status(500).send({ message: "Failed to delete user." });
        }
    } else {
        res.status(400).send({ message: "User does not have permissions!" });
    }
});
export default router;