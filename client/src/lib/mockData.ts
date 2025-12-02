export interface Area {
  id: string;
  name: string;
  description: string;
  hectares: number;
  cropType: string;
  color: string;
  points: { x: number; y: number }[]; // Percentages
  tasks: Task[];
  notes: Note[];
}

export interface Task {
  id: string;
  title: string;
  status: "pending" | "in-progress" | "completed";
  assignee: string;
  dueDate: string;
}

export interface Note {
  id: string;
  content: string;
  author: string;
  date: string;
}

export const MOCK_AREAS: Area[] = [
  {
    id: "1",
    name: "North Field",
    description: "Primary wheat cultivation zone. Good drainage.",
    hectares: 12.5,
    cropType: "Wheat",
    color: "#ef4444", // Red
    points: [
      { x: 10, y: 10 },
      { x: 40, y: 10 },
      { x: 35, y: 40 },
      { x: 15, y: 45 },
    ],
    tasks: [
      { id: "t1", title: "Soil Sampling", status: "completed", assignee: "Mike", dueDate: "2025-03-01" },
      { id: "t2", title: "Fertilizer Application", status: "pending", assignee: "Sarah", dueDate: "2025-03-15" },
    ],
    notes: [
      { id: "n1", content: "Observed some early sprouting in the NE corner.", author: "Mike", date: "2025-02-20" },
    ],
  },
  {
    id: "2",
    name: "Orchard Block A",
    description: "Apple trees, planted 2020.",
    hectares: 5.2,
    cropType: "Apples",
    color: "#f59e0b", // Amber
    points: [
      { x: 50, y: 20 },
      { x: 80, y: 20 },
      { x: 80, y: 50 },
      { x: 50, y: 50 },
    ],
    tasks: [
      { id: "t3", title: "Pruning", status: "in-progress", assignee: "Dave", dueDate: "2025-02-28" },
    ],
    notes: [],
  },
];

export const USERS = [
  { id: "u1", name: "You", avatar: "https://github.com/shadcn.png" },
  { id: "u2", name: "Mike", avatar: "https://i.pravatar.cc/150?u=mike" },
  { id: "u3", name: "Sarah", avatar: "https://i.pravatar.cc/150?u=sarah" },
];

export interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  bio: string;
}

export const CURRENT_USER: User = {
  id: "u1",
  name: "Alex Farmer",
  role: "Farm Manager",
  email: "alex@farmarea.com",
  avatar: "https://github.com/shadcn.png",
  bio: "Managing operations at North Valley Farm since 2018."
};
