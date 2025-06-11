const express = require("express");
const Task = require("../models/Task");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

// All routes are protected with token middleware
//router.use(verifyToken);

// Get all tasks
router.get("/", async (req, res) => {
  const tasks = await Task.find({ });
  res.json(tasks);
});

// Create task
router.post("/", async (req, res) => {
  const { title, description } = req.body;
  const task = new Task({ title, description, user: req.userId });
  await task.save();
  res.status(201).json(task);
});

// Update task
router.put("/:id", async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    req.body,
    { new: true }
  );
  res.json(task);
});

// Delete task
router.delete("/:id", async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
  res.json({ message: "Deleted" });
});

module.exports = router;
