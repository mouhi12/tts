import { users, ttsRequests, type User, type InsertUser, type TtsRequest, type InsertTtsRequest } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createTtsRequest(request: InsertTtsRequest): Promise<TtsRequest>;
  getTtsRequest(id: number): Promise<TtsRequest | undefined>;
  updateTtsRequest(id: number, updates: Partial<TtsRequest>): Promise<TtsRequest | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ttsRequests: Map<number, TtsRequest>;
  private currentUserId: number;
  private currentTtsId: number;

  constructor() {
    this.users = new Map();
    this.ttsRequests = new Map();
    this.currentUserId = 1;
    this.currentTtsId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createTtsRequest(insertRequest: InsertTtsRequest): Promise<TtsRequest> {
    const id = this.currentTtsId++;
    const request: TtsRequest = { 
      id,
      text: insertRequest.text,
      language: insertRequest.language,
      voice: insertRequest.voice,
      speed: insertRequest.speed,
      pitch: insertRequest.pitch,
      audioUrl: null,
      duration: null,
      fileSize: null,
      createdAt: new Date()
    };
    this.ttsRequests.set(id, request);
    return request;
  }

  async getTtsRequest(id: number): Promise<TtsRequest | undefined> {
    return this.ttsRequests.get(id);
  }

  async updateTtsRequest(id: number, updates: Partial<TtsRequest>): Promise<TtsRequest | undefined> {
    const existing = this.ttsRequests.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.ttsRequests.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
