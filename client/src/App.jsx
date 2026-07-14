import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { TransactionProvider } from './context/TransactionContext';
import { CardProvider } from './context/CardContext';
import { AdminProvider } from './context/AdminContext';

// Lazy loaded pages to reduce initial bundle size
const Landing = React.lazy(() => import("./pages/Landing"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Admin = React.lazy(() => import("./pages/Admin"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Security = React.lazy(() => import("./pages/Security"));
const Transactions = React.lazy(() => import("./pages/Transactions"));
const Cards = React.lazy(() => import("./pages/Cards"));

// Loading fallback for Suspense
const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
    <div style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>Loading...</div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <TransactionProvider>
          <CardProvider>
            <Suspense fallback={<LoadingSpinner />}>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminProvider>
                          <Admin />
                        </AdminProvider>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/security"
                    element={
                      <ProtectedRoute>
                        <Security />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/transactions"
                    element={
                      <ProtectedRoute>
                        <Transactions />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/cards"
                    element={
                      <ProtectedRoute>
                        <Cards />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </CardProvider>
        </TransactionProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;