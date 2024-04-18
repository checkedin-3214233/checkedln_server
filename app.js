import express from "express";
import { connectDB, connectFirebase } from "./config/db.js";
import dotenv from 'dotenv';
import colors from 'colors'
import cors from "cors";
import { app, server } from "./socket/socket.js";
import authRoute from './route/authRoute.js'
import uploadRoute from './route/uploadRoute.js'
dotenv.config();
connectDB();
connectFirebase();
app.use(cors())

app.use(express.json());

app.get("/", async (req, res, next) => {
    res.send("Hello from Checkedln");
});
app.use("/api/v1/auth", authRoute);
app.use('/upload', uploadRoute);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT} IN ${process.env.DEV_MODE}`.bgCyan.white)
})