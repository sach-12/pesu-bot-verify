import rateLimit from "express-rate-limit";
import corsConfig from 'cors';

const ipLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, options) => {
        res.status(429).json({
            message: "Too many requests from this IP, please try again after some time"
        })
    },
    keyGenerator: (req) => {
        const forwarded = req.headers["x-forwarded-for"];
        const ip = forwarded ? forwarded.split(/, /)[0] : req.headers["x-real-ip"];
        return ip;
    }
})

const userIdLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, options) => {
        res.status(429).json({
            message: "Too many requests from this user ID, please try again after some time"
        })
    },
    keyGenerator: (req) => {
        return req.body.userToken;
    }
})

const cors = (method) => {
    return(
        corsConfig({
            origin: 'https://pesu-bot-verify.vercel.app',
            methods: [method],
            optionsSuccessStatus: 200,
        })
    )
}

const runLimiter = (req, res) => {
    return new Promise((resolve, reject) => {
        ipLimiter(req, res, (result) => {
            if (result instanceof Error) {
            return reject(result)
            }
    
            return resolve(result)
        })
    })
}

const runUserIdLimiter = (req, res) => {
    return new Promise((resolve, reject) => {
        userIdLimiter(req, res, (result) => {
            if (result instanceof Error) {
            return reject(result)
            }
    
            return resolve(result)
        })
    })
}

const runCors = (req, res, method) => {
    return new Promise((resolve, reject) => {
        cors(method)(req, res, (result) => {
            if (result instanceof Error) {
            return reject(result)
            }
    
            return resolve(result)
        })
    })
}

export { runLimiter, runCors , runUserIdLimiter };