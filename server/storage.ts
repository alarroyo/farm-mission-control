import { 
  users, areas, tasks, notes, farmSettings,
  type User, type InsertUser,
  type Area, type InsertArea,
  type Task, type InsertTask,
  type Note, type InsertNote,
  type FarmSettings, type InsertFarmSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Farm settings
  getFarmSettings(userId: string): Promise<FarmSettings | undefined>;
  updateFarmSettings(userId: string, settings: Partial<InsertFarmSettings>): Promise<FarmSettings | undefined>;
  
  // Area operations
  getAreas(userId: string): Promise<Area[]>;
  getArea(id: string): Promise<Area | undefined>;
  createArea(area: InsertArea): Promise<Area>;
  updateArea(id: string, area: Partial<InsertArea>): Promise<Area | undefined>;
  deleteArea(id: string): Promise<void>;
  
  // Task operations
  getTasks(areaId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;
  
  // Note operations
  getNotes(areaId: string): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  deleteNote(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    
    // Create default farm settings
    await db.insert(farmSettings).values({
      userId: user.id,
      name: 'FarmArea',
    });
    
    return user;
  }

  async updateUser(id: string, insertUser: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(insertUser)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Farm settings
  async getFarmSettings(userId: string): Promise<FarmSettings | undefined> {
    const [settings] = await db.select().from(farmSettings).where(eq(farmSettings.userId, userId));
    return settings || undefined;
  }

  async updateFarmSettings(userId: string, settings: Partial<InsertFarmSettings>): Promise<FarmSettings | undefined> {
    const [updated] = await db
      .update(farmSettings)
      .set(settings)
      .where(eq(farmSettings.userId, userId))
      .returning();
    return updated || undefined;
  }

  // Area operations
  async getAreas(userId: string): Promise<Area[]> {
    return await db.select().from(areas).where(eq(areas.userId, userId));
  }

  async getArea(id: string): Promise<Area | undefined> {
    const [area] = await db.select().from(areas).where(eq(areas.id, id));
    return area || undefined;
  }

  async createArea(insertArea: InsertArea): Promise<Area> {
    const [area] = await db
      .insert(areas)
      .values(insertArea)
      .returning();
    return area;
  }

  async updateArea(id: string, insertArea: Partial<InsertArea>): Promise<Area | undefined> {
    const [area] = await db
      .update(areas)
      .set(insertArea)
      .where(eq(areas.id, id))
      .returning();
    return area || undefined;
  }

  async deleteArea(id: string): Promise<void> {
    await db.delete(areas).where(eq(areas.id, id));
  }

  // Task operations
  async getTasks(areaId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.areaId, areaId));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async updateTask(id: string, insertTask: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(insertTask)
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Note operations
  async getNotes(areaId: string): Promise<Note[]> {
    return await db.select().from(notes).where(eq(notes.areaId, areaId));
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const [note] = await db
      .insert(notes)
      .values(insertNote)
      .returning();
    return note;
  }

  async deleteNote(id: string): Promise<void> {
    await db.delete(notes).where(eq(notes.id, id));
  }
}

export const storage = new DatabaseStorage();
