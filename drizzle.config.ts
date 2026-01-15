import { config } from 'dotenv';
import { defineConfig } from "drizzle-kit";

// Load Environment Variables
config({ path: '.env.local' });

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

