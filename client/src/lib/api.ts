import type { User, Area, Task, Note, FarmSettings } from "@shared/schema";

const API_BASE = "/api";

// User API
export const userAPI = {
  get: async (): Promise<User> => {
    const res = await fetch(`${API_BASE}/user`);
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  },

  update: async (data: Partial<User>): Promise<User> => {
    const res = await fetch(`${API_BASE}/user`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update user");
    return res.json();
  },
};

// Farm settings API
export const farmSettingsAPI = {
  get: async (): Promise<FarmSettings> => {
    const res = await fetch(`${API_BASE}/farm-settings`);
    if (!res.ok) throw new Error("Failed to fetch farm settings");
    return res.json();
  },

  update: async (name: string): Promise<FarmSettings> => {
    const res = await fetch(`${API_BASE}/farm-settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Failed to update farm settings");
    return res.json();
  },
};

// Area API
export const areaAPI = {
  list: async (): Promise<Area[]> => {
    const res = await fetch(`${API_BASE}/areas`);
    if (!res.ok) throw new Error("Failed to fetch areas");
    return res.json();
  },

  get: async (id: string): Promise<Area> => {
    const res = await fetch(`${API_BASE}/areas/${id}`);
    if (!res.ok) throw new Error("Failed to fetch area");
    return res.json();
  },

  create: async (data: Omit<Area, "id" | "userId" | "createdAt">): Promise<Area> => {
    const res = await fetch(`${API_BASE}/areas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create area");
    return res.json();
  },

  update: async (id: string, data: Partial<Area>): Promise<Area> => {
    const res = await fetch(`${API_BASE}/areas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update area");
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/areas/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete area");
  },
};

// Task API
export const taskAPI = {
  list: async (areaId: string): Promise<Task[]> => {
    const res = await fetch(`${API_BASE}/areas/${areaId}/tasks`);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
  },

  create: async (areaId: string, data: Omit<Task, "id" | "areaId" | "createdAt">): Promise<Task> => {
    const res = await fetch(`${API_BASE}/areas/${areaId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create task");
    return res.json();
  },

  update: async (id: string, data: Partial<Task>): Promise<Task> => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update task");
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete task");
  },
};

// Note API
export const noteAPI = {
  list: async (areaId: string): Promise<Note[]> => {
    const res = await fetch(`${API_BASE}/areas/${areaId}/notes`);
    if (!res.ok) throw new Error("Failed to fetch notes");
    return res.json();
  },

  create: async (areaId: string, data: Omit<Note, "id" | "areaId" | "createdAt">): Promise<Note> => {
    const res = await fetch(`${API_BASE}/areas/${areaId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create note");
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/notes/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete note");
  },
};
