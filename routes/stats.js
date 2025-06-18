const express = require("express");
const Task = require("../models/Task");
const router = express.Router();

// Middleware placeholder (optional if protected)
const verifyToken = require("../middleware/verifyToken.js");

/**
 * GET /api/dashboard/summary
 * Returns total, completed, and pending task counts for the authenticated user
 */
router.get("/", verifyToken, async (req, res) => {
	try {
		const userId = req.userId;

		const [total, completed, pending] = await Promise.all([
			Task.countDocuments({ user: userId }),
			Task.countDocuments({ user: userId, completed: true }),
			Task.countDocuments({ user: userId, completed: false }),
		]);

		res.status(200).json({
			success: true,
			data: { total, completed, pending },
			message: "Dashboard summary fetched successfully",
		});
	} catch (err) {
		console.error("Dashboard summary error:", err.message);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
});

module.exports = router;
