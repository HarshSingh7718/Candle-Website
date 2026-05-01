import 'dotenv/config'
export const config = {
    port: process.env.PORT,

    db: {
        uri: process.env.MONGO_URI
    },

    jwt: {
        secret: process.env.SECRET_KEY
    },

    twilio: {
        sid: process.env.TWILIO_SID,
        secret: process.env.TWILIO_AUTH_TOKEN,
        ssid: process.env.SERVICE_SID,
        phone: process.env.TWILIO_PHONE
    },

    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
    },
    cloud: {
        cloud_n: process.env.CLOUD_NAME,
        cloud_key: process.env.CLOUD_API_KEY,
        cloud_secret: process.env.CLOUD_API_SECRET
    },
    razor: {
        k_id: process.env.RAZORPAY_KEY_ID,
        k_secret: process.env.RAZORPAY_KEY_SECRET
    },
    shiprocket: {
        user_email: process.env.SHIPROCKET_EMAIL,
        user_password: process.env.SHIPROCKET_PASSWORD
    }
};