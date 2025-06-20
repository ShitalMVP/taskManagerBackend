const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router(); // ✅ Only declare once

// Signup
router.post("/register", async (req, res) => {
	try {
		const { username, email, password } = req.body;
		const existingUser = await User.findOne({ email });
		if (existingUser)
			return res
				.status(400)
				.json({ message: "User already exists", success: false });
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new User({ username, email, password: hashedPassword });
		await user.save();
		res.status(201).json({ message: "User registered", success: true });
	} catch (err) {
		res.status(500).json({ error: "Internal server error" });
	}
});

// Login
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid password" });
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "7d",
		});

		res.cookie("token", token, {
			httpOnly: false, // ⚠️ should be true in production
			sameSite: "strict",
			secure: process.env.NODE_ENV === 'production',
		});

		res.status(200).json({
			success: true,
			message: "User logged in",
			data: token,
		});
	} catch (error) {
		console.error("Login Error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// ✅ Logout
router.post('/logout', (req, res) => {
	res.clearCookie('token', {
		httpOnly: true,
		sameSite: 'strict',
		secure: process.env.NODE_ENV === 'production',
	});
	res.status(200).json({ success: true, message: "Logged out successfully" });
});

//filter task
router.get("/", async (req, res) => {
	try {
		const { status } = req.query;
		const filter = { user: req.userId }; // or req.user._id if using auth middleware

		if (status === "completed") {
			filter.completed = true;
		} else if (status === "pending") {
			filter.completed = false;
		}

		const tasks = await Task.find(filter).sort({ createdAt: -1 });
		res.status(200).json({ success: true, tasks });
	} catch (err) {
		console.error("Fetch tasks error:", err.message);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
});


module.exports = router;
