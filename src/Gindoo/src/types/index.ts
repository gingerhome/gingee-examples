// File: web/gindoo/dev_src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar_url?: string;
}

export interface UserCreatePayload {
    name: string;
    email: string;
    password?: string; // Password is required for creation
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  assigneeId?: string | null; // Allow null for unassigned
  assigneeName?: string;
  assigneeAvatar?: string;
}

export interface TaskApiPayload {
    title?: string;
    description?: string;
    status?: 'todo' | 'in_progress' | 'done';
    assignee_id?: string | null; // Use snake_case to match the backend
}
