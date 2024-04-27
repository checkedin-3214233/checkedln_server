import express from "express";
import { connectDB, connectFirebase } from "./config/db.js";
import dotenv from 'dotenv';
import colors from 'colors'
import cors from "cors";
import { app, server } from "./socket/socket.js";
import authRoute from './route/authRoute.js'
import uploadRoute from './route/uploadRoute.js'
import userRoute from './route/userRoute.js'
import messageRoute from './route/messageRoute.js'
import eventRoute from './route/eventRoute.js';
import { verifyAccessToken } from "./services/jwt_helper.js";
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
app.use("/api/v1/user", verifyAccessToken, userRoute)
app.use("/api/v1/messages", verifyAccessToken, messageRoute);
app.use("/api/v1/event", verifyAccessToken, eventRoute);
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message,
        },
    });
});
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT} IN ${process.env.DEV_MODE}`.bgCyan.white)
})