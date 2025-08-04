import { Router } from "express";
import { model, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { cardSchema } from "../handlers/cardsJoi.js";

const JWT_SECRET = process.env.JWT_SECRET;

const router = Router();

const Image = new Schema({
    url: String,
    alt: String,
});

const Address = new Schema({
    state: String,
    country: String,
    city: String,
    street: String,
    houseNumber: String,
    zip: String,
});

const CardSchema = new Schema({
    title: String,
    subtitle: String,
    description: String,
    phone: String,
    email: { type: String, unique: true },
    web: String,
    image: Image,
    address: Address,
    likes: Array,
    user_id: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Card = model("cardsProject", CardSchema);

router.get("/", async (req, res) => {
    const data = await Card.find();
    res.send(data);
});

router.get("/my-cards", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            return res.status(401).send("Access denied. No token provided.");
        }
        const payload = jwt.verify(token, JWT_SECRET);
        const userCards = await Card.find({ user_id: payload.id });
        res.send(userCards);
    } catch (error) {
        res.status(400).send("Invalid token.");
    }
});

router.get("/:id", async (req, res) => {
    const card = await Card.findById(req.params.id);
    res.send(card);
});

router.post("/", async (req, res) => {
    const token = req.header("x-auth-token");

    if (!token) {
        return res.status(401).send("Access denied. No token provided.");
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);

        if (payload.isBusiness) {
            // שלב 1: ולידציה של פורמט הנתונים עם Joi
            const { error } = cardSchema.validate(req.body);
            if (error) {
                return res.status(400).send({ message: error.details[0].message });
            }

            // שלב 2: בדיקה אם האימייל כבר קיים במסד הנתונים
            const { email } = req.body;
            const cardFind = await Card.findOne({ email });
            if (cardFind) {
                return res.status(400).send({ message: "Email for this card already exists" });
            }

            // שלב 3: אם הכל תקין, ממשיכים ליצירת הכרטיס
            const item = req.body;
            const image = item.image || {};
            const address = item.address || {};

            const card = new Card({
                title: item.title,
                subtitle: item.subtitle,
                description: item.description,
                phone: item.phone,
                email: item.email,
                web: item.web,
                image: {
                    url: image.url,
                    alt: image.alt,
                },
                address: {
                    state: address.state,
                    country: address.country,
                    city: address.city,
                    street: address.street,
                    houseNumber: address.houseNumber,
                    zip: address.zip,
                },
                user_id: payload.userId,
            });

            const newCard = await card.save();
            res.status(201).send(newCard);
        } else {
            res.status(403).send("Forbidden. Only business users can create cards.");
        }
    } catch (error) {
        console.error("Error creating card:", error);
        res.status(400).send("Error creating card: " + error.message);
    }
});

router.put("/:id", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            return res.status(401).send("Access denied. No token provided.");
        }

        const payload = jwt.verify(token, JWT_SECRET);
        const card = await Card.findById(req.params.id);

        if (!card) {
            return res.status(404).send("Card not found.");
        }

        if (card.user_id !== payload.id) {
            return res.status(403).send("Forbidden. You can only edit your own cards.");
        }

        // ולידציה של הנתונים המעודכנים עם Joi
        const { error } = cardSchema.validate(req.body);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }

        // בדיקה נוספת לאימייל בעדכון
        const { email } = req.body;
        const cardFind = await Card.findOne({ email });
        if (cardFind && cardFind._id.toString() !== req.params.id) {
            return res.status(400).send({ message: "Email for this card already exists" });
        }

        const updatedCard = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(updatedCard);
    } catch (error) {
        console.error("Error updating card:", error);
        res.status(400).send("Invalid token or card data.");
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            return res.status(401).send("Access denied. No token provided.");
        }
        const payload = jwt.verify(token, JWT_SECRET);
        const card = await Card.findById(req.params.id);
        if (!card) {
            return res.status(404).send("Card not found.");
        }
        const userIndex = card.likes.indexOf(payload._id);
        if (userIndex === -1) {
            card.likes.push(payload._id);
        } else {
            card.likes.splice(userIndex, 1);
        }
        await card.save();
        res.send(card);
    } catch (error) {
        console.error("Error liking/unliking card:", error);
        res.status(400).send("Invalid token or card data.");
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            return res.status(401).send("Access denied. No token provided.");
        }
        const payload = jwt.verify(token, JWT_SECRET);
        const card = await Card.findById(req.params.id);
        if (!card) {
            return res.status(404).send("Card not found.");
        }
        if (card.user_id !== payload.id && !payload.isAdmin) {
            return res.status(403).send("Forbidden. You can only delete your own cards or you must be an admin.");
        }
        const deletedCard = await Card.findByIdAndDelete(req.params.id);
        res.send(deletedCard);
    } catch (error) {
        console.error("Error deleting card:", error);
        res.status(400).send("Invalid token or card data.");
    }
});

export default router;