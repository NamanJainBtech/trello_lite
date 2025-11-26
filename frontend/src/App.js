// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import BoardList from './components/boards/BoardList';
import BoardDetail from './components/boards/BoardDetail';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/boards" 
            element={
              <ProtectedRoute>
                <BoardList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/boards/:id" 
            element={
              <ProtectedRoute>
                <BoardDetail />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/boards" />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;