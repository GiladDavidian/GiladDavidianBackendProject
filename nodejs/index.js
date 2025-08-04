import express from 'express';
import cors from 'cors';
import UsersRouter from './handlers/users.js';
import CardsRouter from './handlers/cards.js';
import mongoose from 'mongoose';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const localPort = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(__filename);

// טוען את משתני הסביבה מהקובץ .env.atlas
dotenv.config({ path: path.join(_dirname, '.env.atlas') });

// גישה ישירה למשתנה MONGO_URL
const mongoUrl = process.env.MONGO_URLPROD;

// מתחבר למסד הנתונים
await mongoose.connect(mongoUrl);
console.log('mongodb connection');

const app = express();

app.use(express.json());

app.use(cors({
    origin: true,
    credentials: true,
    methods: 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
}));

app.use(morgan('dev'));

app.listen(localPort, () => {
    console.log("listening on port 3000");
});

app.use('/users', UsersRouter);
app.use('/cards', CardsRouter);