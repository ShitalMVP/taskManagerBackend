const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

const {
  getFilteredTasks,
  createTask,
} = require("../controllers/taskController");

const verifyToken = require("../middleware/verifyToken");

// ✅ GET filtered tasks by userId
router.get("/getTasks/:id", getFilteredTasks);

// ✅ Create a new task (protected)
router.post("/", verifyToken, createTask);

// ✅ GET a single task by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    res.status(200).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ✅ Update a task
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!task)
      return res.status(404).json({ success: false, message: "Task not found" });

    res.json({ success: true, task });
  } catch (err) {
    console.error("Update task error:", err.message);
    res.status(500).json({ success: false, message: "Error updating task" });
  }
});

// ✅ Toggle task completion
router.patch("/:id/status", verifyToken, async (req, res) => {
  try {
    const { completed } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { completed },
      { new: true }
    );
    if (!task)
      return res.status(404).json({ success: false, message: "Task not found" });

    res.json({ success: true, task, message: "Status updated" });
  } catch (err) {
    console.error("Toggle status error:", err.message);
    res.status(500).json({ success: false, message: "Error updating status" });
  }
});

// ✅ Delete a task
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!task)
      return res.status(404).json({ success: false, message: "Task not found" });

    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    console.error("Delete task error:", err.message);
    res.status(500).json({ success: false, message: "Error deleting task" });
  }
});

module.exports = router;
