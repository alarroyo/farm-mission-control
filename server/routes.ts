import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAreaSchema, insertTaskSchema, insertNoteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Temporary user ID - in a real app, this would come from authentication
  let DEMO_USER_ID = "demo-user";

  // Initialize demo user if not exists (run once on startup)
  let user = await storage.getUserByEmail("alex@farmarea.com");
  if (!user) {
    user = await storage.createUser({
      name: "Alex Farmer",
      email: "alex@farmarea.com",
      role: "Farm Manager",
      avatar: "https://github.com/shadcn.png",
      bio: "Managing operations at North Valley Farm since 2018.",
    });
  }
  DEMO_USER_ID = user.id;

  // User routes
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser(DEMO_USER_ID);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.patch("/api/user", async (req, res) => {
    try {
      const validated = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(DEMO_USER_ID, validated);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Farm settings routes
  app.get("/api/farm-settings", async (req, res) => {
    try {
      const settings = await storage.getFarmSettings(DEMO_USER_ID);
      res.json(settings || { name: "FarmArea" });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch farm settings" });
    }
  });

  app.patch("/api/farm-settings", async (req, res) => {
    try {
      const { name } = req.body;
      const settings = await storage.updateFarmSettings(DEMO_USER_ID, { name, userId: DEMO_USER_ID });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update farm settings" });
    }
  });

  // Area routes
  app.get("/api/areas", async (req, res) => {
    try {
      const userAreas = await storage.getAreas(DEMO_USER_ID);
      res.json(userAreas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch areas" });
    }
  });

  app.get("/api/areas/:id", async (req, res) => {
    try {
      const area = await storage.getArea(req.params.id);
      if (!area) {
        return res.status(404).json({ error: "Area not found" });
      }
      res.json(area);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch area" });
    }
  });

  app.post("/api/areas", async (req, res) => {
    try {
      const validated = insertAreaSchema.parse({ ...req.body, userId: DEMO_USER_ID });
      const area = await storage.createArea(validated);
      res.status(201).json(area);
    } catch (error) {
      res.status(400).json({ error: "Invalid area data" });
    }
  });

  app.patch("/api/areas/:id", async (req, res) => {
    try {
      const validated = insertAreaSchema.partial().parse(req.body);
      const area = await storage.updateArea(req.params.id, validated);
      if (!area) {
        return res.status(404).json({ error: "Area not found" });
      }
      res.json(area);
    } catch (error) {
      res.status(400).json({ error: "Invalid area data" });
    }
  });

  app.delete("/api/areas/:id", async (req, res) => {
    try {
      await storage.deleteArea(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete area" });
    }
  });

  // Task routes
  app.get("/api/areas/:areaId/tasks", async (req, res) => {
    try {
      const areaTasks = await storage.getTasks(req.params.areaId);
      res.json(areaTasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/areas/:areaId/tasks", async (req, res) => {
    try {
      const validated = insertTaskSchema.parse({ ...req.body, areaId: req.params.areaId });
      const task = await storage.createTask(validated);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const validated = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(req.params.id, validated);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Note routes
  app.get("/api/areas/:areaId/notes", async (req, res) => {
    try {
      const areaNotes = await storage.getNotes(req.params.areaId);
      res.json(areaNotes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/areas/:areaId/notes", async (req, res) => {
    try {
      const validated = insertNoteSchema.parse({ ...req.body, areaId: req.params.areaId });
      const note = await storage.createNote(validated);
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ error: "Invalid note data" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      await storage.deleteNote(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
