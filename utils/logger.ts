// logger.ts
import pino from "pino";
const rfs = require("rotating-file-stream");
import path from "path";

// Define the directory and filename pattern for log rotation
const logDirectory = path.join(__dirname, "../logs");

const pad = (num: number): string => (num > 9 ? "" : "0") + num;

const generator = (time: Date | null, index: number): string => {
    if (!time) return "file.log";

    const month = `${time.getFullYear()}${pad(time.getMonth() + 1)}`;
    const day = pad(time.getDate());
    const hour = pad(time.getHours());
    const minute = pad(time.getMinutes());

    return `${month}/${month}${day}-${hour}${minute}-${index}-file.log`;
};

// Create a rotating file stream for log rotation and cleanup
const logStream = rfs.createStream(generator, {
    interval: "1d",
    size: "10M",
    path: logDirectory,
    maxFiles: 7,
    compress: true,
});

const logger = pino({ level: "info" }, logStream);

export default logger;
