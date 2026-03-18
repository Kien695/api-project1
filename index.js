const express = require("express");
const http = require("http");
const { initSocket } = require("./socket.js");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const JsonWebToken = require("jsonwebtoken");
const morgan = require("morgan");
const multer = require("multer");
const database = require("./config/database.js");

database.connect();
const port = process.env.PORT;
const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5175"],
    credentials: true,
  }),
);
const server = http.createServer(app);
initSocket(server);
app.use(express.json());
app.use(cookieParser());
app.use(morgan());

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  }),
);
const routerClient = require("./routers/index.router.js");
routerClient(app);
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
