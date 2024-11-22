import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import QuizBuilder from './pages/QuizBuilder';
import QuizPreview from './pages/QuizPreview';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from './components/ui/toast';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/builder"
          element={
            <ProtectedRoute>
              <QuizBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/preview"
          element={
            <ProtectedRoute>
              <QuizPreview />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}