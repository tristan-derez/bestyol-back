import dotenv from "dotenv";
import * as http from "http";
import app from "./app";
dotenv.config();

const port = process.env.PORT || 3000;

// create server with app as an argument
const server = http.createServer(app);

server.on("listening", () => {
    const address = server.address();
    const bind: string = typeof address === "string" ? "pipe " + address : "port " + port;
    console.log(`Listening on ${bind} \n ➜ Local: http://localhost:${port} 🚀`);
});

server.listen(port);
