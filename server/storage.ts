import { type User, type InsertUser, type TtsRequest, type InsertTtsRequest } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createTtsRequest(request: InsertTtsRequest): Promise<TtsRequest>;
  getTtsRequest(id: number): Promise<TtsRequest | undefined>;
  updateTtsRequest(id: number, updates: Partial<TtsRequest>): Promise<TtsRequest | undefined>;
}

export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private ttsRequests: TtsRequest[] = [];
  private nextUserId = 1;
  private nextTtsRequestId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      ...insertUser,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  async createTtsRequest(insertRequest: InsertTtsRequest): Promise<TtsRequest> {
    const request: TtsRequest = {
      id: this.nextTtsRequestId++,
      ...insertRequest,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.ttsRequests.push(request);
    return request;
  }

  async getTtsRequest(id: number): Promise<TtsRequest | undefined> {
    return this.ttsRequests.find(request => request.id === id);
  }

  async updateTtsRequest(id: number, updates: Partial<TtsRequest>): Promise<TtsRequest | undefined> {
    const index = this.ttsRequests.findIndex(request => request.id === id);
    if (index === -1) return undefined;
    
    this.ttsRequests[index] = {
      ...this.ttsRequests[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.ttsRequests[index];
  }
}

export const storage = new MemoryStorage();
