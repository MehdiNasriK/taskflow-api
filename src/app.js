import express from "express";
import globalErrorHandeller from "./shared/utils/globalErrorHandeller.js";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/authRoute.js";
import userRoutes from "./modules/users/userRoute.js";
import taskRoutes from "./modules/tasks/taskRoute.js";
import projectRoutes from "./modules/projects/projectsRoute.js";
import { redis } from "./shared/config/redis.js";
import { rateLimiter } from "./shared/utils/rateLimiting.js";

const app = express();

redis.connect();
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
app.use(rateLimiter(100, 60))

app.use("/", authRoutes);
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);
app.use("/projects", projectRoutes);

app.use(globalErrorHandeller);

export default app;
