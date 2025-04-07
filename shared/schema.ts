import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Repository model for tracking imports
export const repositories = pgTable("repositories", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  owner: text("owner").notNull(),
  name: text("name").notNull(),
  branch: text("branch").default("main"),
  license: text("license"),
  lastCommit: text("last_commit"),
  importPath: text("import_path"),
  importDate: timestamp("import_date").defaultNow(),
  status: text("status").default("pending"),
});

export const insertRepositorySchema = createInsertSchema(repositories).pick({
  url: true,
  owner: true,
  name: true,
  branch: true,
  license: true,
  lastCommit: true,
  importPath: true,
  status: true,
});

export type InsertRepository = z.infer<typeof insertRepositorySchema>;
export type Repository = typeof repositories.$inferSelect;

// Dependency model for tracking detected dependencies
export const dependencies = pgTable("dependencies", {
  id: serial("id").primaryKey(),
  repositoryId: integer("repository_id").notNull(),
  name: text("name").notNull(),
  version: text("version").notNull(),
  isDev: boolean("is_dev").default(false),
});

export const insertDependencySchema = createInsertSchema(dependencies).pick({
  repositoryId: true,
  name: true,
  version: true,
  isDev: true,
});

export type InsertDependency = z.infer<typeof insertDependencySchema>;
export type Dependency = typeof dependencies.$inferSelect;

// Import step model for tracking progress
export const importSteps = pgTable("import_steps", {
  id: serial("id").primaryKey(),
  repositoryId: integer("repository_id").notNull(),
  step: text("step").notNull(),
  status: text("status").default("pending"),
  output: text("output"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertImportStepSchema = createInsertSchema(importSteps).pick({
  repositoryId: true,
  step: true,
  status: true,
  output: true,
});

export type InsertImportStep = z.infer<typeof insertImportStepSchema>;
export type ImportStep = typeof importSteps.$inferSelect;
