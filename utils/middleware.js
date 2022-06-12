import rateLimit from "express-rate-limit";
import corsConfig from 'cors';

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 requests per windowMs
    // message: "Too many requests from this IP, please try again in a minute",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, options) => {
        res.status(429).json({
            message: "Too many requests from this IP, please try again in a minute"
        })
    },
    keyGenerator: (req) => {
        const forwarded = req.headers["x-forwarded-for"];
        const ip = forwarded ? forwarded.split(/, /)[0] : req.socket.remoteAddress;
        return ip;
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
        limiter(req, res, (result) => {
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

export { runLimiter, runCors }