const redis = require("redis");
require("dotenv").config();

const client = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

client.on("error", (err) => console.error("Redis Client Error:", err));
client.on("connect", () => console.log("Redis Client Connected Successfully"));

(async () => {
    try {
        await client.connect();
    } catch (err) {
        console.error("Could not connect to Redis:", err);
    }
})();

module.exports = client;
