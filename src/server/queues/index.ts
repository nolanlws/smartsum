import { Queue } from "bullmq";
import { connection } from "../redis";

export const summaryQueue = new Queue("summaryQueue", {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});
