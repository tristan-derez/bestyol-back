// logger.ts
import pino from "pino";
const rfs = require("rotating-file-stream");
import path from "path";

// Define the directory and filename pattern for log rotation
const logDirectory = path.join(__dirname, "../logs");
const logFileName = "app.log";

// Create a rotating file stream for log rotation and cleanup
const logStream = rfs.createStream(logFileName, {
    interval: "1d", // Rotate logs daily
    path: logDirectory,
    maxFiles: 7, // Keep up to 7 days of logs (adjust as needed)
    compress: true,
});

// Create a Pino logger instance with the rotating file stream as the destination
const logger = pino({ level: "info" }, logStream);

// Export the logger for use in other modules if needed
export default logger;
