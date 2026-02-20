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
// import AdminPage from './pages/AdminPage'; // Removed legacy import
import AdminLayout from './layout/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminNews from './pages/admin/News';
import AdminKnowledge from './pages/admin/Knowledge';
import AdminMedia from './pages/admin/Media';
import AdminDebug from './pages/admin/Debug';

import AdminUsers from './pages/admin/Users';
import AdminStats from './components/admin/modules/AdminStats';
import AdminAds from './components/admin/modules/AdminAds';
import AdminSEO from './components/admin/modules/AdminSEO';

import CoachLayout from './layout/CoachLayout';
import CoachDashboard from './pages/coach/Dashboard';
import CoachPlans from './pages/coach/CoachPlans';
import CoachClients from './pages/coach/CoachClients';
import CoachChat from './pages/coach/CoachChat';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import NewsPage from './pages/NewsPage';
import NewsArticlePage from './pages/NewsArticlePage';
import CalendarPage from './pages/CalendarPage';

import MemberPageWrapper from './pages/MemberPageWrapper';

import SiteLock from './components/SiteLock';
import AuthDebug from './components/AuthDebug';

import { HelmetProvider } from 'react-helmet-async';

function App() {
    return (
        <HelmetProvider>
            <AuthProvider>
                <BrowserRouter>
                    {/* DEBUG COMPONENT - Always visible */}
                    <AuthDebug />
                    <SiteLock>
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


                            </Route>


                            {/* New Admin Panel Layout */}
                            <Route path="/admin" element={<AdminLayout />}>
                                <Route index element={<AdminDashboard />} />
                                <Route path="stats" element={<AdminStats />} />
                                <Route path="news" element={<AdminNews />} />
                                <Route path="knowledge" element={<AdminKnowledge />} />
                                <Route path="media" element={<AdminMedia />} />
                                <Route path="users" element={<AdminUsers />} />
                                <Route path="ads" element={<AdminAds />} />
                                <Route path="seo" element={<AdminSEO />} />
                                <Route path="debug" element={<AdminDebug />} />
                            </Route>

                            {/* Coach Panel Layout */}
                            <Route path="/coach" element={<CoachLayout />}>
                                <Route index element={<CoachDashboard />} />
                                <Route path="clients" element={<CoachClients />} />
                                <Route path="chat" element={<CoachChat />} />
                                <Route path="plans" element={<CoachPlans />} />
                            </Route>
                        </Routes>
                    </SiteLock>
                </BrowserRouter>
            </AuthProvider>
        </HelmetProvider>
    );
}

export default App;
