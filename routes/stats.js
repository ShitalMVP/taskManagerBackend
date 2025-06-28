const express = require("express");
const Task = require("../models/Task");
const router = express.Router();

// Middleware placeholder (optional if protected)
const verifyToken = require("../middleware/verifyToken");

/**
 * GET /api/dashboard/summary
 * Returns total, completed, and pending task counts for the authenticated user
 */


