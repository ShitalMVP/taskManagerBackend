// controllers/taskController.js

const Task = require("../models/Task");



const getFilteredTasks = async (req, res) => {
	try {
		const { status, priority, search, dueDate } = req.query;
		const userId = req.params.id;

		console.log("User ID from frontend:", userId);

		const filter = { user: userId };
		

		if (status === "completed") {
			filter.completed = true;
		} else if (status === "pending") {
			filter.completed = false;
		}

		if (priority) {
			filter.priority = priority;
		}

		if (search) {
			filter.title = { $regex: search, $options: "i" };
		}

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
};

module.exports = { getFilteredTasks };
// ✅ POST new task
const createTask = async (req, res) => {
	try {
		const { title, description, dueDate  } = req.body;

		const task = new Task({
			title,
			description,
			dueDate,
			user: req.userId, // ✅ attach user ID from token
		});

		await task.save();

		res.status(201).json({ success: true, task });
	} catch (err) {
		console.error("Error creating task:", err.message);
		res.status(500).json({ success: false, message: "Failed to create task" });
	}
};

// ✅ Export both functions
module.exports = {
	getFilteredTasks,
	createTask,
};
