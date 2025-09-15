// File: web/gindoo/src/components/Navbar.tsx

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Reusable function to define styles for NavLink, making the code cleaner
    const getNavLinkStyle = ({ isActive }: { isActive: boolean }) => ({
        borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent', // blue-600
        color: isActive ? '#1F2937' : '#6B7280', // gray-800 for active, gray-500 for inactive
        paddingBottom: '0.65rem', // Adjust padding to align border nicely
        paddingTop: '0.65rem'
    });

    const navLinks = (
        <>
            <NavLink to="/" end style={getNavLinkStyle} className="hover:text-gray-900 py-2">
                Kanban
            </NavLink>
            <NavLink to="/dashboard" style={getNavLinkStyle} className="hover:text-gray-900 py-2">
                Dashboard
            </NavLink>
            {user?.role === 'admin' && (
                <NavLink to="/admin/users" style={getNavLinkStyle} className="hover:text-gray-900 py-2">
                    Users
                </NavLink>
            )}
            {user?.role !== 'admin' && (
                <NavLink to="/profile" style={getNavLinkStyle} className="hover:text-gray-900 py-2">
                    Profile
                </NavLink>
            )}
        </>
    );

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-6 py-3">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Gindoo</h1>
                    
                    <div className="hidden md:flex items-center space-x-6">
                        <nav className="flex items-center space-x-8 text-sm font-medium">
                            {navLinks}
                        </nav>
                        <div className="flex items-center">
                            <span className="text-gray-600 text-sm mr-4">Welcome, {user?.name}!</span>
                            <button onClick={logout} className="text-sm text-red-500 hover:text-red-700 font-medium">
                                Logout
                            </button>
                        </div>
                    </div>

                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-gray-800 focus:outline-none">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
                        <nav className="flex flex-col space-y-4 text-sm font-medium">
                            {navLinks}
                        </nav>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                             <span className="block text-gray-600 text-sm mb-2">Welcome, {user?.name}!</span>
                             <button onClick={logout} className="w-full text-left text-sm text-red-500 hover:text-red-700 font-medium">
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};
