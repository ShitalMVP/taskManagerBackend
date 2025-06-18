// index.js

const express = require("express");
const app = express();
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authrouter = require("./routes/auth");
const taskrouter = require("./routes/task");
const statrouter = require("./routes/stats");
dotenv.config();
connectDB();

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const allowedOrigins = [
	"http://localhost:5173",

	// "*",
];

app.use(
	cors({
		origin: allowedOrigins,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		credentials: true,
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);

app.use("/api/auth", authrouter);
app.use("/api/tasks", taskrouter);
app.use("/api/stats", statrouter);
// Basic route
app.get("/", (req, res) => {
	res.send("Hello, World!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
