const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    completed: { type: Boolean, default: false },
    dueDate: { type: Date, required: true }, // ✅ Add dueDate
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // ✅ Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Task", TaskSchema);
