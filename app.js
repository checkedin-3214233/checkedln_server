import express from "express";
import { connectDB, connectFirebase } from "./config/db.js";
import dotenv from 'dotenv';
import colors from 'colors'
import cors from "cors";
import { app, server } from "./socket/socket.js";
import authRoute from './route/authRoute.js'
import uploadRoute from './route/uploadRoute.js'
import userRoute from './route/userRoute.js'
import postRoute from './route/postRoute.js'
import messageRoute from './route/messageRoute.js'
import eventRoute from './route/eventRoute.js';
import notificationRoute from './route/notificationRoute.js';
import { verifyAccessToken } from "./services/jwt_helper.js";
// Make sure to import the 'path' module
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'; dotenv.config();
connectDB();
connectFirebase();
app.use(cors())

app.use(express.json());

app.get("/", async (req, res, next) => {
    res.send("Hello from Checkedln");
});

// Optional: a route to serve the JSON file directly if you prefer
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the services directory
app.use('/.well-known', express.static(join(__dirname, 'services')));

app.get('/.well-known/assetlinks.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'services', 'assetlinks.json'));
});
app.use("/api/v1/auth", authRoute);
app.use('/upload', uploadRoute);
app.use("/api/v1/notification", verifyAccessToken, notificationRoute)
app.use("/api/v1/user", verifyAccessToken, userRoute)
app.use("/api/v1/messages", verifyAccessToken, messageRoute);
app.use("/api/v1/event", verifyAccessToken, eventRoute);
app.use("/api/v1/post", verifyAccessToken, postRoute);
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