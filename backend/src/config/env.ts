import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env and fill it in.`
    );
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  databaseUrl: required("DATABASE_URL"),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  jwtSecret: required("JWT_SECRET"),
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
};
