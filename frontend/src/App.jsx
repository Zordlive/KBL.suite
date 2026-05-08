import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EnvironmentSelection from './pages/EnvironmentSelection';
import StockManagement from './pages/StockManagement';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/environment" /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/environment" /> : <Register />}
        />
        <Route
          path="/environment"
          element={user ? <EnvironmentSelection /> : <Navigate to="/login" />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/stock-management"
          element={user ? <StockManagement /> : <Navigate to="/login" />}
        />
        <Route
          path="/remise-repris"
          element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-gray-500">Module Remise et Repris</h1><p className="text-gray-400 mt-2">Bientôt disponible</p></div></div>}
        />
        <Route
          path="/"
          element={<Navigate to={user ? "/environment" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
