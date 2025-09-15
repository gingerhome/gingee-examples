// File: web/gindoo/src/contexts/DataContext.tsx

import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Task, User, TaskApiPayload, UserCreatePayload } from '../types';
import { useAuth } from './AuthContext';

// Define the shape of our context's value
interface DataContextType {
    tasks: Task[];
    users: User[];
    fetchUsers: () => Promise<void>;
    addUser: (userData: UserCreatePayload) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    loading: boolean;
    fetchTasks: (filters?: { assigneeId: string | null }) => Promise<void>;
    addTask: (taskData: Partial<Task>) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/gindoo/api/users/list');
            if (!response.ok) throw new Error('Failed to fetch users');
            const data: User[] = await response.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
        }
    };

    const addUser = async (userData: UserCreatePayload) => { // +++ CORRECTED: Use the new type
        try {
            // No transformation is needed as the payload already matches the API
            const response = await fetch('/gindoo/api/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData), // The userData object is now the correct shape
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create user');
            }
            const newUser: User = await response.json();
            setUsers(prevUsers => [...prevUsers, newUser].sort((a, b) => a.name.localeCompare(b.name))); // Keep the list sorted
        } catch (error) {
            console.error("Failed to add user:", error);
            throw error;
        }
    };

    const deleteUser = async (userId: string) => {
        try {
            const response = await fetch(`/gindoo/api/users/${userId}`, { // Assuming a DELETE endpoint
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete user');
            }
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
        } catch (error) {
            console.error("Failed to delete user:", error);
            throw error; // Re-throw
        }
    };

    const fetchTasks = async (filters: { assigneeId: string | null } = { assigneeId: null }) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.assigneeId) {
                params.append('assigneeId', filters.assigneeId);
            }
            const response = await fetch(`/gindoo/api/tasks?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const data: Task[] = await response.json();
            setTasks(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (taskData: Partial<Task>) => {
        try {
            const payload: TaskApiPayload = {
                title: taskData.title,
                description: taskData.description,
                status: taskData.status,
                assignee_id: taskData.assigneeId,
            };

            const response = await fetch('/gindoo/api/tasks/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create task');
            }
            const newTask: Task = await response.json();
            setTasks(prevTasks => [newTask, ...prevTasks]); // Add new task to the top of the list
        } catch (error) {
            console.error("Failed to add task:", error);
            throw error; // Re-throw to be caught by the modal
        }
    };

    const updateTask = async (taskId: string, updates: Partial<Task>) => {
        try {
            const payload: TaskApiPayload = {
                title: updates.title,
                description: updates.description,
                status: updates.status,
                assignee_id: updates.assigneeId,
            };

            const response = await fetch(`/gindoo/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update task');
            }
            const updatedTask: Task = await response.json();
            setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? updatedTask : t));
        } catch (error) {
            console.error("Failed to update task:", error);
            throw error; // Re-throw
        }
    };
    
    const deleteTask = async (taskId: string) => {
        try {
            const response = await fetch(`/gindoo/api/tasks/${taskId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete task');
            }
            setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
        } catch (error) {
            console.error("Failed to delete task:", error);
            throw error; // Re-throw
        }
    };

    useEffect(() => {
        // Fetch data only if the user is authenticated
        if (isAuthenticated) {
            Promise.all([fetchTasks(), fetchUsers()]);
        } else {
            // Clear data on logout
            setTasks([]);
            setUsers([]);
        }
    }, [isAuthenticated]);

    const value: DataContextType = {
        tasks,
        users,
        loading,
        fetchUsers,
        addUser,
        deleteUser,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Custom hook for easy access
export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
