import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import MembershipPage from './pages/MembershipPage';
import KnowledgePage from './pages/KnowledgePage';
import MemberPage from './pages/MemberPage';
import BoutiquePage from './pages/BoutiquePage';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import NewsPage from './pages/NewsPage';
import NewsArticlePage from './pages/NewsArticlePage';
import CalendarPage from './pages/CalendarPage';

import MemberPageWrapper from './pages/MemberPageWrapper';

import SiteLock from './components/SiteLock';

function App() {
    return (
        <AuthProvider>
            <SiteLock>
                <BrowserRouter>
                    <Routes>
                        {/* Standalone Application Funnel - NO LAYOUT */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Main Website Layout */}
                        <Route path="/" element={<Layout />}>
                            <Route index element={<HomePage />} />
                            <Route path="news" element={<NewsPage />} />
                            <Route path="news/:slug" element={<NewsArticlePage />} />
                            <Route path="membership" element={<MembershipPage />} />
                            <Route path="boutique" element={<BoutiquePage />} />
                            <Route path="boutique/:id" element={<ProductPage />} />
                            <Route path="knowledge" element={<KnowledgePage />} />
                            <Route path="calendar" element={<CalendarPage />} />
                            <Route path="booking" element={<BookingPage />} />

                            {/* Protected Routes */}
                            <Route path="members" element={
                                <ProtectedRoute>
                                    <MemberPageWrapper />
                                </ProtectedRoute>
                            } />

                            {/* Admin Routes */}
                            <Route path="admin" element={
                                <AdminRoute>
                                    <AdminPage />
                                </AdminRoute>
                            } />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </SiteLock>
        </AuthProvider>
    );
}

export default App;
