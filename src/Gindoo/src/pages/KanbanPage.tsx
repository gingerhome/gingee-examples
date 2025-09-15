// File: web/gindoo/src/pages/KanbanPage.tsx

import { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
//import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useData } from '../contexts/DataContext';
import type { Task } from '../types';
import { KanbanColumn } from '../components/KanbanColumn';
import { UserFilter } from '../components/UserFilter';
import { TaskModal } from '../components/TaskModal';

// Defines the columns for the board
const KANBAN_COLUMNS: { id: Task['status']; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
];

export const KanbanPage = () => {
    const { tasks: initialTasks, loading, fetchTasks, updateTask } = useData();
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Partial<Task> | null>(null);

    // Update local task state when data context changes (e.g., after filter)
    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const handleFilterChange = (userId: string | null) => {
        setSelectedUserId(userId);
        fetchTasks({ assigneeId: userId });
    };

    const handleOpenModal = (task: Partial<Task> | null) => {
        setTaskToEdit(task || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setTaskToEdit(null);
        setIsModalOpen(false);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const activeTask = tasks.find(t => t.id === active.id);
            const newStatus = over.id as Task['status'];
            
            if (activeTask && activeTask.status !== newStatus) {
                // Optimistically update the UI
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.id === active.id ? { ...task, status: newStatus } : task
                    )
                );
                // Send the update to the backend
                updateTask(active.id as string, { status: newStatus });
            }
        }
    };
    
    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Kanban Board</h2>
            <div className="flex justify-between items-center mb-6">
                <div className="w-48">
                    <UserFilter selectedUserId={selectedUserId} onChange={handleFilterChange} />
                </div>
                <button 
                    onClick={() => handleOpenModal(null)} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                    Add Task
                </button>
            </div>

            <div className="h-auto md:h-[calc(100vh-250px)]">
                {loading ? (
                    <div className="text-center py-10">Loading tasks...</div>
                ) : (
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                            {KANBAN_COLUMNS.map(column => (
                                <KanbanColumn
                                    key={column.id}
                                    id={column.id}
                                    title={column.title}
                                    tasks={tasks.filter(task => task.status === column.id)}
                                    onCardClick={handleOpenModal}
                                />
                            ))}
                        </div>
                    </DndContext>
                )}
            </div>

            {isModalOpen && (
                <TaskModal
                    taskToEdit={taskToEdit}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};
