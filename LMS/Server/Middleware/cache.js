const redisClient = require("../Config/redis");

exports.cacheMiddleware = (keyPrefix, expiration = 3600) => {
    return async (req, res, next) => {
        if (!redisClient.isOpen) {
            return next();
        }

        const reqIdentifier = JSON.stringify(req.body || {}) + JSON.stringify(req.query || {});
        const cacheKey = `cache:${keyPrefix}:${req.originalUrl || req.url}:${reqIdentifier}`;

        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log(`[Cache Hit] Key: ${cacheKey}`);
                return res.status(200).json(JSON.parse(cachedData));
            }

            console.log(`[Cache Miss] Key: ${cacheKey}`);
            
            const originalJson = res.json;
            res.json = function (data) {
                if (res.statusCode === 200 && data && data.success) {
                    redisClient.setEx(cacheKey, expiration, JSON.stringify(data))
                        .catch(err => console.error("Error setting cache:", err));
                }
                return originalJson.call(this, data);
            };

            next();
        } catch (error) {
            console.error("Cache middleware error:", error);
            next();
        }
    };
};

exports.clearCache = async (keyPrefix) => {
    if (!redisClient.isOpen) return;
    try {
        const keys = await redisClient.keys(`cache:${keyPrefix}:*`);
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`[Cache Clear] Flushed ${keys.length} keys for prefix: ${keyPrefix}`);
        }
    } catch (error) {
        console.error(`Error clearing cache for prefix ${keyPrefix}:`, error);
    }
};
