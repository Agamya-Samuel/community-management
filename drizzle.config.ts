import { config } from 'dotenv';
import { defineConfig } from "drizzle-kit";

// Load .env file
config({ path: '.env' });

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

