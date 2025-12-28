import { mysqlTable, varchar, timestamp, text } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    fsp: 3,
  }),
  image: varchar("image", { length: 255 }),
  username: varchar("username", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }), // Hashed password for credentials provider
  createdAt: timestamp("created_at", {
    mode: "date",
    fsp: 3,
  }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    fsp: 3,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .$onUpdate(() => new Date()),
});

