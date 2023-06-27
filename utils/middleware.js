import rateLimit from "express-rate-limit";
import corsConfig from "cors";
import axios from "axios";

const runIPLimiter = async (req, res) => {
	const config = rateLimit({
		windowMs: 1 * 60 * 1000, // 1 minute
		max: 10, // limit each IP to 10 requests per windowMs
		standardHeaders: true,
		legacyHeaders: false,
		handler: (req, res, options) => {
			res.status(429).json({
				message: "Too many requests from this IP, please try again after some time",
			});
		},
		keyGenerator: (req) => req.socket.remoteAddress,
	});
	return config(req, res, () => {});
};

const runUserLimiter = async (req, res) => {
	const config = rateLimit({
		windowMs: 1 * 60 * 1000, // 1 minute
		max: 10, // limit each IP to 10 requests per windowMs
		standardHeaders: true,
		legacyHeaders: false,
		handler: (req, res, options) => {
			res.status(429).json({
				message: "Too many requests from this IP, please try again after some time",
			});
		},
		keyGenerator: (req) => req.socket.remoteAddress,
	});
	return config(req, res, () => {});
};

const runCors = async (req, res, methods) => {
	const config = corsConfig({
		origin: "https://pesu-discord.vercel.app",
		methods: methods,
		optionsSuccessStatus: 200,
	});
	return config(req, res, () => {
		if (!methods.includes(req.method)) {
			return res.status(405).json({
				message: "Method not allowed",
			});
		}
	});
};

const auth = async (req, res) => {
	if (!req.headers.authorization) {
		return res.status(401).json({ message: "Unauthorised" });
	}
	const token = req.headers.authorization.split(" ")[1];
	const url = "https://discord.com/api/users/@me";
	const headers = {
		Authorization: `Bearer ${token}`,
	};

	try {
		const response = await axios.get(url, { headers });
		return response.data;
	} catch (err) {
		console.log(err);
		return res.status(401).json({ message: "Invalid token" });
	}
};

export { runIPLimiter as rateLimiter, runUserLimiter as userLimiter, runCors as cors, auth };
