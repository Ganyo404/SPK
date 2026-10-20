import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Parent Pages
import { ParentDashboard } from '../pages/parent/ParentDashboard';
import { ChildrenListPage } from '../pages/parent/ChildrenListPage';
import { ChildProfilePage } from '../pages/parent/ChildProfilePage';
import { ParentConsultationPage } from '../pages/parent/ParentConsultationPage';
import { ParentProfilePage } from '../pages/parent/ParentProfilePage';

// Staff Pages
import { StaffDashboard } from '../pages/staff/StaffDashboard';
import { StaffChildrenListPage } from '../pages/staff/StaffChildrenListPage';
import { ChildRegistrationQueue } from '../pages/staff/ChildRegistrationQueue';
import { ExaminationFormPage } from '../pages/staff/ExaminationFormPage';
import { PendingExaminationsPage } from '../pages/staff/PendingExaminationsPage';
import { BirthYearGroupsPage } from '../pages/staff/BirthYearGroupsPage';
import { SPKCalculationPage } from '../pages/staff/SPKCalculationPage';
import { StaffConsultationPage } from '../pages/staff/StaffConsultationPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { PosyanduManagementPage } from '../pages/admin/PosyanduManagementPage';
import { AHPConfigPage } from '../pages/admin/AHPConfigPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

// Redirect Root to appropriate Role Dashboard
function RootRedirect() {
  const { role, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'staff') return <Navigate to="/staff" replace />;
  return <Navigate to="/parent" replace />;
}

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { role, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Arahkan ke dashboard perannya sendiri jika mencoba akses rute di luar wewenang
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/parent" replace />;
  }

  return children;
}

export function AppRouter() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Main Authenticated Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RootRedirect />} />

        {/* Parent Routes */}
        <Route
          path="parent"
          element={
            <ProtectedRoute allowedRoles={['parent', 'staff', 'admin']}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="parent/children"
          element={
            <ProtectedRoute allowedRoles={['parent', 'staff', 'admin']}>
              <ChildrenListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="parent/children/:childId"
          element={
            <ProtectedRoute allowedRoles={['parent', 'staff', 'admin']}>
              <ChildProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="parent/consultations"
          element={
            <ProtectedRoute allowedRoles={['parent', 'staff', 'admin']}>
              <ParentConsultationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="parent/profile"
          element={
            <ProtectedRoute allowedRoles={['parent', 'staff', 'admin']}>
              <ParentProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Staff Routes */}
        <Route
          path="staff"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff/children"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <StaffChildrenListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff/children/:childId"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <ChildProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff/registration-queue"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <ChildRegistrationQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff/examination/new"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <ExaminationFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff/examinations/pending"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <PendingExaminationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff/cohorts"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <BirthYearGroupsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff/spk-calculation"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <SPKCalculationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff/consultations"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <StaffConsultationPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/posyandu"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PosyanduManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/ahp-config"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AHPConfigPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
