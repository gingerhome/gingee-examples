// File: web/gindoo/src/components/MainLayout.tsx

//import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const MainLayout = () => {
    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />
            <main className="container mx-auto p-6">
                {/* All routed pages will render here */}
                <Outlet />
            </main>
        </div>
    );
};
