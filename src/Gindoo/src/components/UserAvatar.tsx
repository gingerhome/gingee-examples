// File: web/gindoo/src/components/UserAvatar.tsx

//import React from 'react';
import type { User } from '../types';

interface UserAvatarProps {
    user?: Partial<User> | null; // Allow partial user object for flexibility
}

export const UserAvatar = ({ user }: UserAvatarProps) => {
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    if (!user || !user.name) {
        return (
            <div title="Unassigned" className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold text-gray-300">?</div>
        );
    }

    return (
        <div title={user.name} className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold">
            {/* We'll add real image support later if needed */}
            {getInitials(user.name)}
        </div>
    );
};
