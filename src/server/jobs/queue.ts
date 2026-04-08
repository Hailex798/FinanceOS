import { Queue, type JobsOptions, type QueueOptions } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

export const queueConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null
});

const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000
  },
  removeOnComplete: 500,
  removeOnFail: 1000
};

const queueOptions: QueueOptions = {
  connection: queueConnection,
  defaultJobOptions
};

export const analyticsQueue = new Queue("analytics", queueOptions);
export const insightQueue = new Queue("insights", queueOptions);
export const notificationQueue = new Queue("notifications", queueOptions);

