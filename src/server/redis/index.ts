import IORedis from "ioredis";

export const connection = new IORedis({
  maxRetriesPerRequest: null, // Ensure maxRetriesPerRequest is null
  host: "127.0.0.1", // Change to your Redis host
  port: 6379, // Change to your Redis port
});
