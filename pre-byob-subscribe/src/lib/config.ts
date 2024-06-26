import dotenv from "dotenv";

dotenv.config();

export default {
  BASE_URL: process.env.BASE_URL ?? "http://localhost:3001",
  DB_REFRESH: process.env.DB_REFRESH === "true" || false,
};
