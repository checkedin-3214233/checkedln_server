import mongoose from 'mongoose'
import admin from 'firebase-admin'

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URL);
        console.log(`Connected to database ${mongoose.connection.host}`.bgYellow.white);

    } catch (error) {
        console.log(error);
    }
}
export const connectFirebase = async () => {
    try {


        var connect = admin.initializeApp({
            credential: admin.credential.cert({
                "type": "service_account",
                "project_id": "checkedln",
                "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
                "private_key": process.env.FIREBASE_PRIVATE_KEY,
                "client_email": process.env.FIREBASE_CLIENT_EMAIL,
                "client_id": process.env.FIREBASE_CLIENT_ID,
                "auth_uri": process.env.FIREBASE_AUTH_URI,
                "token_uri": process.env.FIREBASE_TOKEN_URI,
                "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
                "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL,
                "universe_domain": process.env.FIREBASE_UNIVERSE_DOMAIN
            })
        })
        console.log(`Connected to firebase ${connect.name}`.bgYellow.white);
    } catch (error) {
        console.log(error);
    }
}
