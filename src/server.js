import app from "./app.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

export const server = app.listen(3000, () =>
  console.log("hey im listening to you"),
);
