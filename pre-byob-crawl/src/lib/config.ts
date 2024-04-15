import dotenv from "dotenv";

dotenv.config();

export default {
  DB_REFRESH: process.env.DB_REFRESH === "true" || false,
};
