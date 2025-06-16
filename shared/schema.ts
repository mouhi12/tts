import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ttsRequests = pgTable("tts_requests", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  language: text("language").notNull(),
  voice: text("voice").notNull(),
  speed: text("speed").default("1.0"),
  pitch: text("pitch").default("0"),
  audioUrl: text("audio_url"),
  duration: integer("duration"),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTtsRequestSchema = createInsertSchema(ttsRequests).omit({
  id: true,
  createdAt: true,
  audioUrl: true,
  duration: true,
  fileSize: true,
}).extend({
  speed: z.string().default("1.0"),
  pitch: z.string().default("0"),
});

export const ttsRequestSchema = z.object({
  text: z.string().min(1, "Text is required").max(50000, "Text must be less than 50,000 characters"),
  language: z.string().min(1, "Language is required"),
  voice: z.string().min(1, "Voice is required"),
  speed: z.string().default("1.0"),
  pitch: z.string().default("0"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTtsRequest = z.infer<typeof insertTtsRequestSchema>;
export type TtsRequest = typeof ttsRequests.$inferSelect;
export type TtsRequestInput = z.infer<typeof ttsRequestSchema>;
