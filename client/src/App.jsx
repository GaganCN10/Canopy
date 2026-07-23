import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import AdminSpecies from './pages/AdminSpecies';
import Species from './pages/Species';
import AdminGeofences from './pages/AdminGeofences';
import Sightings from './pages/Sightings';
import ReportSighting from './pages/ReportSighting';
import MapPage from './pages/MapPage';
import SubmitTip from './pages/SubmitTip';
import AdminTips from './pages/AdminTips';
import ReportHWC from './pages/ReportHWC';
import CreateRescueCase from './pages/CreateRescueCase';
import RescueCases from './pages/RescueCases';
import RescueCaseDetail from './pages/RescueCaseDetail';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="min-h-screen bg-canopy-sand-50 text-canopy-ink-900">
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="unauthorized" element={<h1>Unauthorized</h1>} />
              <Route path="species" element={<Species />} />
              <Route path="sightings" element={<Sightings />} />
              <Route path="sightings/report" element={<ReportSighting />} />
              <Route path="map" element={<MapPage />} />
              <Route path="tips/submit" element={<SubmitTip />} />
              <Route path="hwc/report" element={<ReportHWC />} />
              <Route path="rescue" element={<RescueCases />} />
              <Route path="rescue/new" element={<CreateRescueCase />} />
              <Route path="rescue/:id" element={<RescueCaseDetail />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/species"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminSpecies />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/tips"
                element={
                  <ProtectedRoute allowedRoles={['ranger', 'admin']}>
                    <AdminTips />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/geofences"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminGeofences />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
