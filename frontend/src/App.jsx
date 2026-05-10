import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EnvironmentSelection from './pages/EnvironmentSelection';
import StockManagement from './pages/StockManagement';
import AdminPanel from './pages/AdminPanel';
import RemiseRepris from './pages/RemiseRepris';

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
          path="/admin"
          element={user ? <AdminPanel /> : <Navigate to="/login" />}
        />
        <Route
          path="/remise-repris"
          element={user ? <RemiseRepris /> : <Navigate to="/login" />}
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
