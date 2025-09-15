// File: web/gindoo/src/pages/AdminUsersPage.tsx

import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import type { UserCreatePayload } from '../types';

export const AdminUsersPage = () => {
    const { users, fetchUsers, addUser, deleteUser } = useData();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            const newUser: UserCreatePayload = { name, email, password };
            await addUser(newUser);
            
            // Reset form on success
            setName('');
            setEmail('');
            setPassword('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await deleteUser(userId);
            } catch (err: any) {
                alert(`Failed to delete user: ${err.message}`);
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Existing Users List */}
            <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Existing Users</h2>
                <div className="bg-white rounded-lg shadow">
                    <div className="divide-y divide-gray-200">
                        {/* Header */}
                        <div className="px-6 py-3 flex text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="w-2/5">Username</div>
                            <div className="w-2/5">Email</div>
                            <div className="w-1/5 text-right">Actions</div>
                        </div>
                        {/* User Rows */}
                        {users.map(user => (
                            <div key={user.id} className="px-6 py-4 flex items-center">
                                <div className="w-2/5 text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="w-2/5 text-sm text-gray-500">{user.email}</div>
                                <div className="w-1/5 text-right">
                                    <button 
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add New User Form */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New User</h2>
                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleAddUser}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                             <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                                <p className="mt-2 text-xs text-gray-500">Must be at least 8 characters.</p>
                            </div>
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            <button type="submit" disabled={isSubmitting} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
                                {isSubmitting ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
