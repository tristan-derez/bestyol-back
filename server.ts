import dotenv from "dotenv";
import * as http from "http";
import app from "./app";
import cron from "node-cron";
import { newActiveDaily } from "./utils/switchActiveStatus";

dotenv.config();

const port = process.env.PORT || 3000;

const server = http.createServer(app);

// call newActiveDaily everyday at 11:30pm
cron.schedule("05 22 * * *", () => {
    console.log(`creating daily tasks.........`);
    newActiveDaily(6);
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
