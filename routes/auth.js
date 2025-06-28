const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Task = require("../models/Task");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// ✅ GET Authenticated User Info (Profile Icon & Username)
router.get("/me", verifyToken, async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("username email"); // Only needed fields
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		res.status(200).json({
			success: true,
			user: {
				username: user.username,
				email: user.email,
				userId:user._id,
			},
		});
	} catch (err) {
		console.error("GET /me error:", err.message);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
});


// ✅ SIGNUP with email validation
router.post("/register", async (req, res) => {
	try {
		const { username, email, password } = req.body;

		// ✅ Only allow @gmail.com or @*.in emails
		const validEmail = /^[a-zA-Z0-9._%+-]+@(gmail\.com|[a-zA-Z0-9-]+\.(in))$/;
		if (!validEmail.test(email)) {
			return res.status(400).json({
				success: false,
				message: "Only @gmail.com or @.in email addresses are allowed",
			});
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already exists",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new User({ username, email, password: hashedPassword });
		await user.save();

		res.status(201).json({ success: true, message: "User registered" });
	} catch (err) {
		console.error("Register Error:", err.message);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
});

// ✅ LOGIN using either Email or Username
router.post("/login", async (req, res) => {
	try {
		const { identifier, password } = req.body;

		if (!identifier || !password) {
			return res.status(400).json({ error: "All fields are required" });
		}

		const isEmail = identifier.includes("@");
		const user = await User.findOne(
			isEmail ? { email: identifier } : { username: identifier }
		);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid password" });
		}

		// ✅ Check if the user has any tasks
		const existingTasks = await Task.find({ user: user._id });
		const isNewUser = existingTasks.length === 0;

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "7d",
		});

		res.cookie("token", token, {
			httpOnly: false,
			sameSite: "strict",
			secure: process.env.NODE_ENV === 'production',
		});

		res.status(200).json({
			success: true,
			message: "User logged in",
			data: token,
			isNewUser, 
			
			
			// ✅ Send this to frontend
		});
	} catch (error) {
		console.error("Login Error:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

// ✅ LOGOUT
router.post("/logout", (req, res) => {
	res.clearCookie("token");
	res.status(200).json({ success: true, message: "User logged out" });
});

// ✅ FILTER TASKS (this ideally belongs in task routes)
router.get("/tasks", async (req, res) => {
	try {
		const { status } = req.query;
		const filter = { user: req.userId };

		if (status === "completed") filter.completed = true;
		else if (status === "pending") filter.completed = false;

		const tasks = await Task.find(filter).sort({ createdAt: -1 });
		res.status(200).json({ success: true, tasks });
	} catch (err) {
		console.error("Fetch tasks error:", err.message);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
});

//fetch task summry
router.get("/count", verifyToken, async (req, res) => {
	try {
		const userId = req.userId;
			// Log this to debug
		console.log("Summary for user:", userId);

		
		res.status(200).json({
			success: true,
			data: "hello",
			message: "Dashboard summary fetched successfully",
		});
	} catch (err) {
		console.error("Dashboard summary error:", err.message);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
});

module.exports = router;
