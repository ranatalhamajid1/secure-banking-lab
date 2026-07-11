import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import ProfilePage from "./pages/ProfilePage";
import Settings from "./pages/Settings";
import Security from "./pages/Security";
import Transactions from "./pages/Transactions";
import Cards from "./pages/Cards";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import InactivityTimer from './components/InactivityTimer';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InactivityTimer />
        <BrowserRouter>
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
                    <Admin />
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
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;