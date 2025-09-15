// File: web/gindoo/src/components/TaskCard.tsx (Corrected)

//import React from 'react';
import type { Task } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { UserAvatar } from './UserAvatar';

interface TaskCardProps {
    task: Task;
    onClick: (task: Task) => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
    const { user } = useAuth();
    const { deleteTask } = useData();
    const isAdmin = user?.role === 'admin';

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the edit modal from opening
        if (window.confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
            try {
                await deleteTask(task.id);
            } catch (err: any) {
                alert(`Error: ${err.message}`); // Simple error feedback
            }
        }
    };

    return (
        // The main div is now the droppable target, but not the drag handle.
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white rounded-lg p-4 shadow-sm touch-none"
        >
            {/* 1. Header with Title (as Drag Handle) and Edit Button */}
            <div className="flex justify-between items-start mb-2">
                <h3
                    {...attributes}
                    {...listeners}
                    className="font-medium text-gray-800 cursor-grab active:cursor-grabbing"
                >
                    {task.title}
                </h3>
                <div>
                    <button
                        onClick={() => onClick(task)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold me-3"
                    >
                        Edit
                    </button>
                    {isAdmin ? (
                        <button onClick={handleDelete} className="text-xs text-red-500 hover:text-red-700 font-medium">
                            Delete
                        </button>
                    ) : (
                        <div /> // Empty div to keep the layout consistent for non-admins
                    )}
                </div>
            </div>

            {/* 2. Body and Footer (Clickable for editing) */}
            {/* We can wrap the rest of the content in a div with the onClick handler as well
                to provide a larger clickable area. */}
            <div onClick={() => onClick(task)} className="cursor-pointer">
                {task.description && (
                    <p className="text-sm text-gray-600">
                        {task.description}
                    </p>
                )}
                <div className="mt-4 flex justify-end items-center">
                    <UserAvatar user={{ name: task.assigneeName, avatar_url: task.assigneeAvatar }} />
                </div>
            </div>
        </div>
    );
};
