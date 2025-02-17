import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Ratings from './pages/Ratings';
import Organization from './pages/Organization';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Rate from './pages/Rate';
import ThankYou from './pages/ThankYou';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/rate/:code" element={<Rate />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route 
              path="/login" 
              element={
                <AuthGuard requireAuth={false}>
                  <Login />
                </AuthGuard>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <AuthGuard requireAuth={false}>
                  <SignUp />
                </AuthGuard>
              } 
            />
            <Route 
              element={
                <AuthGuard>
                  <Layout />
                </AuthGuard>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ratings" element={<Ratings />} />
              <Route path="/organization" element={<Organization />} />
              <Route 
                path="/settings" 
                element={
                  <AuthGuard requireAdmin>
                    <Settings />
                  </AuthGuard>
                } 
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;