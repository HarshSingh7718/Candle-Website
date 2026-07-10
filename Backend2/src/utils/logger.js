import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import fetch from "node-fetch";

// Configure Winston Logger
const { combine, timestamp, printf, colorize } = winston.format;

// Custom log format for the file
const fileFormat = combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    printf(({ level, message, timestamp, stack }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message} ${stack ? `\n${stack}` : ""}`;
    })
);

// Custom log format for the console (with colors)
const consoleFormat = combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    printf(({ level, message, timestamp }) => {
        return `[${timestamp}] ${level}: ${message}`;
    })
);

// Create the logger instance
export const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: fileFormat,
    transports: [
        // Daily rotating file for errors
        new DailyRotateFile({
            filename: "logs/error-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "error",
            maxFiles: "14d", // Keep logs for 14 days
        }),
        // Daily rotating file for all logs
        new DailyRotateFile({
            filename: "logs/combined-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            maxFiles: "14d",
        }),
    ],
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: consoleFormat,
        })
    );
}

// Function to send Slack notification for critical errors
export const sendSlackAlert = async (errorId, statusCode, message, stack) => {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return; // Silent skip if not configured

    const payload = {
        text: `🚨 *FATAL ERROR* [${statusCode}] - Environment: ${process.env.NODE_ENV}`,
        attachments: [
            {
                color: "#ff0000",
                fields: [
                    {
                        title: "Error ID",
                        value: errorId,
                        short: true
                    },
                    {
                        title: "Message",
                        value: message,
                        short: false
                    },
                    {
                        title: "Stack Trace Snippet",
                        value: `\`\`\`${stack ? stack.substring(0, 500) : "No stack trace"}...\`\`\``,
                        short: false
                    }
                ]
            }
        ]
    };

    try {
        await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        logger.error("Failed to send Slack alert", err);
    }
};
