import { Queue, Worker } from "bullmq";
import Email from "./email.js";

export default new Queue("email", {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

new Worker(
  "email",
  async (job) => {
    await new Email(job.data.url, job.data.user).sendEmail();
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  },
);
