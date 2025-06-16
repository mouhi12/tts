import { users, ttsRequests, type User, type InsertUser, type TtsRequest, type InsertTtsRequest } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createTtsRequest(request: InsertTtsRequest): Promise<TtsRequest>;
  getTtsRequest(id: number): Promise<TtsRequest | undefined>;
  updateTtsRequest(id: number, updates: Partial<TtsRequest>): Promise<TtsRequest | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createTtsRequest(insertRequest: InsertTtsRequest): Promise<TtsRequest> {
    const [request] = await db
      .insert(ttsRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async getTtsRequest(id: number): Promise<TtsRequest | undefined> {
    const [request] = await db.select().from(ttsRequests).where(eq(ttsRequests.id, id));
    return request || undefined;
  }

  async updateTtsRequest(id: number, updates: Partial<TtsRequest>): Promise<TtsRequest | undefined> {
    const [updated] = await db
      .update(ttsRequests)
      .set(updates)
      .where(eq(ttsRequests.id, id))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
