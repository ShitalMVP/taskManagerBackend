// middleware to verify token
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
	try {
		const token = req.cookies.token;
		if (!token) {
			return res.status(401).json({ error: "Unauthorized" });
		}
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = decoded.id;
		next();
	} catch (err) {
		return res.status(401).json({ error: "Unauthorized" });
	}
};

module.exports = verifyToken;
