import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default('Member'),
  avatar: text("avatar"),
  bio: text("bio"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Farm settings table
export const farmSettings = pgTable("farm_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().default('FarmArea'),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
});

// Areas table
export const areas = pgTable("areas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull().default(''),
  hectares: real("hectares").notNull().default(0),
  cropType: text("crop_type").notNull().default('Unassigned'),
  color: text("color").notNull().default('#3b82f6'),
  points: jsonb("points").notNull().$type<{ x: number; y: number }[]>(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  status: text("status").notNull().default('pending').$type<'pending' | 'in-progress' | 'completed'>(),
  assignee: text("assignee").notNull(),
  dueDate: text("due_date").notNull(),
  areaId: varchar("area_id").notNull().references(() => areas.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notes table
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  author: text("author").notNull(),
  date: text("date").notNull(),
  areaId: varchar("area_id").notNull().references(() => areas.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  areas: many(areas),
  farmSettings: one(farmSettings),
}));

export const areasRelations = relations(areas, ({ many, one }) => ({
  tasks: many(tasks),
  notes: many(notes),
  user: one(users, {
    fields: [areas.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  area: one(areas, {
    fields: [tasks.areaId],
    references: [areas.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  area: one(areas, {
    fields: [notes.areaId],
    references: [areas.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertFarmSettingsSchema = createInsertSchema(farmSettings).omit({
  id: true,
});

export const insertAreaSchema = createInsertSchema(areas).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type FarmSettings = typeof farmSettings.$inferSelect;
export type InsertFarmSettings = z.infer<typeof insertFarmSettingsSchema>;

export type Area = typeof areas.$inferSelect;
export type InsertArea = z.infer<typeof insertAreaSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
