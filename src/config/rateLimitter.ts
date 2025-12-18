import { rateLimit } from 'express-rate-limit'

export const limitter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers,
    handler: (req, res) => {
        res.status(429).json({
            status: 429,
            message: `Too many requests from this IP: ${req.ip}, please try again later.`,
            error: 'RateLimitExceeded',
        })
    },
})
