import { Queue, Worker } from "bullmq";
import Email from "./email.js";

export default new Queue("email", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

new Worker(
  "email",
  async (job) => {
    await new Email(job.data.url, job.data.user).sendEmail();
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  },
);
