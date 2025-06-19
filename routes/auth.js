const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { token } = require("morgan");
const router = express.Router();

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
			expiresIn: "7d", // optional: add expiration
		});

		// Set cookie with token
		res.cookie("token", token, {
			httpOnly: false,
			sameSite: "strict",
			secure:true, // Use secure cookies in production
		});

		// Respond with token and user info (optional)
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

module.exports = router;
