// File: web/gindoo/src/App.tsx

//import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

// Import Page and Layout Components
import { LoginPage } from './pages/LoginPage';
import { KanbanPage } from './pages/KanbanPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { ProfilePage } from './pages/ProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { MainLayout } from './components/MainLayout';

/**
 * A wrapper component that protects routes.
 * It renders its child routes via an <Outlet /> if the user is authenticated,
 * otherwise it redirects to the login page.
 */
const ProtectedRoutes = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

/**
 * The main component that sets up providers and the router.
 */
function App() {
    return (
        <AuthProvider>
            <Router basename="/gindoo">
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

/**
 * This component handles the core routing logic.
 */
function AppRoutes() {
    const { isAuthenticated, isLoading, user } = useAuth();

    // Show a loading screen while the session is being checked.
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <Routes>
            {/* Public Route: If logged in, redirect away from login page. */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoutes />}>
                <Route 
                    element={
                        <DataProvider>
                            <MainLayout />
                        </DataProvider>
                    }
                >
                    <Route path="/" element={<KanbanPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    
                    {/* Admin-Only Route */}
                    {user?.role === 'admin' && (
                        <Route path="/admin/users" element={<AdminUsersPage />} />
                    )}

                    {/* Fallback for any other authenticated route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
