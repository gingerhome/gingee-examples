//import React from 'react';
import type { Task } from '../types';
import { TaskCard } from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KanbanColumnProps {
    id: string;
    title: string;
    tasks: Task[];
    onCardClick: (task: Task) => void;
}

export const KanbanColumn = ({ id, title, tasks, onCardClick }: KanbanColumnProps) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="bg-gray-200 rounded-lg flex flex-col overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-700 p-4 border-b border-gray-300 flex-shrink-0">
                {title} <span className="text-sm font-normal text-gray-500">{tasks.length}</span>
            </h3>
            
            {/* 
              - 'flex-grow': Allows this container to fill the available vertical space.
              - 'overflow-y-auto': THIS IS THE KEY. It makes only this part of the column scrollable.
            */}
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} onClick={onCardClick} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};
