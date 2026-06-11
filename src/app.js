import express from "express";
import globalErrorHandeller from "./shared/utils/globalErrorHandeller.js";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/authRoute.js";
import userRoutes from "./modules/users/userRoute.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/", authRoutes);
app.use("/users", userRoutes);

app.use(globalErrorHandeller);

export default app;
