const rateLimitMap = new Map();

export const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (rateLimitMap.has(key)) {
      const timestamps = rateLimitMap.get(key).filter((t) => t > windowStart);
      if (timestamps.length >= max) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later.',
        });
      }
      timestamps.push(now);
      rateLimitMap.set(key, timestamps);
    } else {
      rateLimitMap.set(key, [now]);
    }

    next();
  };
};

export const strictRateLimit = rateLimit(15 * 60 * 1000, 10);
