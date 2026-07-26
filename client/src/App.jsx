import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import AdminSpecies from './pages/AdminSpecies';
import Species from './pages/Species';
import AdminGeofences from './pages/AdminGeofences';
import AdminRoleRequests from './pages/AdminRoleRequests';
import AdminInviteCodes from './pages/AdminInviteCodes';
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

import Missions from './pages/Missions';
import MissionDetail from './pages/MissionDetail';
import CreateMission from './pages/CreateMission';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import CreateArticle from './pages/CreateArticle';
import RequestRole from './pages/RequestRole';
import RoleProfileForm from './pages/RoleProfileForm';
import Sessions from './pages/Sessions';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from './features/auth/authSlice';

function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="min-h-screen bg-canopy-sand-50 text-canopy-ink-900">
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
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
              <Route path="missions" element={<Missions />} />
              <Route path="missions/create" element={
                <ProtectedRoute allowedRoles={['citizen', 'ranger', 'researcher', 'rescue', 'admin']}>
                  <CreateMission />
                </ProtectedRoute>
              } />
              <Route path="missions/:id" element={<MissionDetail />} />
              <Route path="articles" element={<Articles />} />
              <Route path="articles/:slug" element={<ArticleDetail />} />
              <Route path="articles/create" element={
                <ProtectedRoute allowedRoles={['researcher', 'ranger', 'admin']}>
                  <CreateArticle />
                </ProtectedRoute>
              } />
              <Route path="roles/request" element={
                <ProtectedRoute>
                  <RequestRole />
                </ProtectedRoute>
              } />
              <Route path="roles/profile" element={
                <ProtectedRoute>
                  <RoleProfileForm />
                </ProtectedRoute>
              } />
              <Route
                path="sessions"
                element={
                  <ProtectedRoute>
                    <Sessions />
                  </ProtectedRoute>
                }
              />
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
              <Route
                path="admin/role-requests"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminRoleRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/invite-codes"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminInviteCodes />
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
