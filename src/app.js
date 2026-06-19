import express from "express";
import globalErrorHandeller from "./shared/utils/globalErrorHandeller.js";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/authRoute.js";
import userRoutes from "./modules/users/userRoute.js";
import taskRoutes from "./modules/tasks/taskRoute.js";
import projectRoutes from "./modules/projects/projectsRoute.js";

const app = express();

app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());

app.use("/", authRoutes);
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);
app.use("/projects", projectRoutes);
app.use('/moon', (req, res, next) => {
    console.log(req.query)

    res.json({
        data: req.query
    })
})

app.use(globalErrorHandeller);

export default app;
