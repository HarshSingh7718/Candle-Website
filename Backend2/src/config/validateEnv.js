import 'dotenv/config';

const validateEnv = () => {
    const requiredVars = [
        "PORT",
        "NODE_ENV",
        "MONGO_URI",
        "SECRET_KEY",
        "FRONTEND_URL_PROD",
        "FRONTEND_URL_DEV",
        "ADMIN_URL_PROD",
        "ADMIN_URL_DEV"
    ];

    const missingVars = requiredVars.filter((key) => !process.env[key]);

    if (missingVars.length > 0) {
        console.error(`❌ CRITICAL ERROR: Missing required environment variables: ${missingVars.join(", ")}`);
        process.exit(1);
    }

    if (process.env.MONGO_URI && process.env.MONGO_URI.includes("USER:PASSWORD")) {
        console.error("❌ CRITICAL ERROR: MONGO_URI contains default placeholder credentials (USER:PASSWORD).");
        process.exit(1);
    }

    // Optional but highly recommended vars check (warning only)
    const warningVars = [
        "SMTP_HOST",
        "RAZORPAY_KEY_ID",
        "MSG91_AUTH_KEY",
        "SHIPROCKET_EMAIL",
        "SENTRY_DSN",
        "SLACK_WEBHOOK_URL"
    ];
    
    const missingWarnings = warningVars.filter((key) => !process.env[key]);
    if (missingWarnings.length > 0) {
        console.warn(`⚠️ WARNING: The following variables are missing. Related features will fail: ${missingWarnings.join(", ")}`);
    }
};

validateEnv();
