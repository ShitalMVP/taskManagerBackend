const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// Middleware: Uncomment when you enable authentication
const verifyToken = require("../middleware/verifyToken");

/**
 * GET /api/tasks
 * Fetch all or filtered tasks for the authenticated user
 */
router.get("/", async (req, res) => {
	try {
		const { status, priority, search, dueDate } = req.query;

		const filter = { user: req.userId };

		// ✅ Filter by status (completed or pending)
		if (status === "completed") {
			filter.completed = true;
		} else if (status === "pending") {
			filter.completed = false;
		}

		// ✅ Filter by priority
		if (priority) {
			filter.priority = priority;
		}

		// ✅ Search by title (case-insensitive)
		if (search) {
			filter.title = { $regex: search, $options: "i" };
		}

		// ✅ Filter by dueDate
		if (dueDate) {
			filter.dueDate = new Date(dueDate);
		}

		const tasks = await Task.find(filter).sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			tasks,
			message: "Filtered tasks fetched successfully",
		});
	} catch (error) {
		console.error("Fetch tasks error:", error.message);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
});

/**
 * POST /api/tasks
 * Create a new task
 */
router.post("/", async (req, res) => {
	try {
		const { title, description, priority, dueDate } = req.body;
		if (!title) {
			return res
				.status(400)
				.json({ success: false, message: "Title is required" });
		}

		const newTask = new Task({
			title,
			description,
			priority,
			dueDate,
			user: req.userId,
		});
		const savedTask = await newTask.save();

		res.status(201).json({
			success: true,
			task: savedTask,
			message: "Task created successfully",
		});
	} catch (error) {
		console.error("Create task error:", error.message);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
});

/**
 * PUT /api/tasks/:id
 * Update an existing task
 */
router.put("/:id", async (req, res) => {
	try {
		const updatedTask = await Task.findOneAndUpdate(
			{ _id: req.params.id, user: req.userId },
			req.body,
			{ new: true }
		);

		if (!updatedTask) {
			return res
				.status(404)
				.json({ success: false, message: "Task not found" });
		}

		res.status(200).json({
			success: true,
			task: updatedTask,
			message: "Task updated successfully",
		});
	} catch (error) {
		console.error("Update task error:", error.message);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
});

/**
 * PATCH /api/tasks/:id/status
 * Toggle task completion
 */
router.patch("/:id/status", async (req, res) => {
	try {
		const { completed } = req.body;
		const updated = await Task.findOneAndUpdate(
			{ _id: req.params.id, user: req.userId },
			{ completed },
			{ new: true }
		);

		if (!updated) {
			return res
				.status(404)
				.json({ success: false, message: "Task not found" });
		}

		res.status(200).json({
			success: true,
			task: updated,
			message: "Task status updated",
		});
	} catch (error) {
		console.error("Toggle status error:", error.message);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete("/:id", async (req, res) => {
	try {
		const deleted = await Task.findOneAndDelete({
			_id: req.params.id,
			user: req.userId,
		});

		if (!deleted) {
			return res
				.status(404)
				.json({ success: false, message: "Task not found" });
		}

		res.status(200).json({
			success: true,
			message: "Task deleted successfully",
		});
	} catch (error) {
		console.error("Delete task error:", error.message);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
});

module.exports = router;
