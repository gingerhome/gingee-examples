// File: web/gindoo/src/components/TaskModal.tsx (Corrected)

import { useState, useEffect } from 'react';
import type { Task } from '../types';
import { useData } from '../contexts/DataContext';

interface TaskModalProps {
    taskToEdit: Partial<Task> | null;
    onClose: () => void;
}

export const TaskModal = ({ taskToEdit, onClose }: TaskModalProps) => {
    const { users, addTask, updateTask } = useData();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState<string>('unassigned');
    const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditing = taskToEdit && taskToEdit.id;

    useEffect(() => {
        if (isEditing) {
            setTitle(taskToEdit.title || '');
            setDescription(taskToEdit.description || '');
            setAssigneeId(taskToEdit.assigneeId || 'unassigned');
            setStatus(taskToEdit.status || 'todo');
        } else {
            setTitle('');
            setDescription('');
            setAssigneeId('unassigned');
            setStatus('todo');
        }
    }, [taskToEdit, isEditing]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) {
            setError('Title is a required field.');
            return;
        }
        
        setIsSubmitting(true);
        setError(null);

        const taskData: Partial<Task> = {
            title,
            description,
            status,
            assigneeId: assigneeId === 'unassigned' ? null : assigneeId,
        };

        try {
            if (isEditing) {
                await updateTask(taskToEdit.id!, taskData);
            } else {
                await addTask(taskData);
            }
            onClose();
        } catch (apiError: any) {
            setError(apiError.message || 'An error occurred while saving the task.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!taskToEdit) return null;

    return (
        // Backdrop
        <div className="fixed inset-0 bg-gray-900/75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            {/* Modal Panel */}
            <div className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
                <form onSubmit={handleSave}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                id="description"
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">Assignee</label>
                                <select
                                    id="assignee"
                                    value={assigneeId}
                                    onChange={(e) => setAssigneeId(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="unassigned">Unassigned</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    id="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as Task['status'])}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="todo">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={onClose} className="px-5 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-sm font-medium text-white disabled:bg-blue-400 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Saving...' : 'Save Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
