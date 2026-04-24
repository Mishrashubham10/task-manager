import express, { Application } from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser';

// ROUTES IMPORTS
import authRoutes from "./modules/auth/auth.route"

const app: Application = express()

/*
------------- GLOBAL MIDDLEWARES -----------------
*/
app.use(express.json({ limit: '16kb' }))
app.use(express.static("public"))
app.use(cors({
    origin: process.env.CLIENT_URI,
    credentials: true
}));
app.use(cookieParser());

console.log("CLIENT_URL:", process.env.CLIENT_URI);

/*
------------- ROUTES --------------
*/
app.use("/api/v1/auth", authRoutes);

export default app;