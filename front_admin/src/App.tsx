// src/App.tsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/login/LoginPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import ProtectedRoute from './utils/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Navigate replace to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        {/* Définissez d'autres routes protégées de la même manière */}
      </Routes>
    </Router>
  );
};

export default App
