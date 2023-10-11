import dotenv from "dotenv";
import * as http from "http";
import app from "./app";
dotenv.config();

const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
