// File: web/gindoo/src/components/UserFilter.tsx

//import React from 'react';
import { useData } from '../contexts/DataContext';

interface UserFilterProps {
    selectedUserId: string | null;
    onChange: (userId: string | null) => void;
}

export const UserFilter = ({ selectedUserId, onChange }: UserFilterProps) => {
    const { users } = useData();

    return (
        <select
            value={selectedUserId || 'all'}
            onChange={(e) => onChange(e.target.value === 'all' ? null : e.target.value)}
            className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
            <option value="all">All Users</option>
            {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
            ))}
        </select>
    );
};
