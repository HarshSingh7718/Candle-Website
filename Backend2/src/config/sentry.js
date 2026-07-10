import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Initialize Sentry early
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations: [
            nodeProfilingIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, // Capture 100% of the transactions (reduce in prod)
        // Set sampling rate for profiling
        profilesSampleRate: 1.0,
    });
    console.log("✅ Sentry initialized");
} else {
    console.warn("⚠️ SENTRY_DSN not found. Sentry error tracking is disabled.");
}
