import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { SurgeriesPage } from './pages/SurgeriesPage';
import { ModelsPage } from './pages/ModelsPage';
import { EvidencePage } from './pages/EvidencePage';
import { ExceptionsPage } from './pages/ExceptionsPage';
import { OverridesPage } from './pages/OverridesPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { FairnessPage } from './pages/FairnessPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { ChecklistsPage } from './pages/ChecklistsPage';

import { ProtectedRoute } from './components/ProtectedRoute';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="patients" element={<ProtectedRoute requiredPermission="VIEW_PATIENTS"><PatientsPage /></ProtectedRoute>} />
            <Route path="patients/:id" element={<ProtectedRoute requiredPermission="VIEW_PATIENTS"><PatientDetailPage /></ProtectedRoute>} />
            <Route path="surgeries" element={<ProtectedRoute requiredPermission="VIEW_SURGERIES"><SurgeriesPage /></ProtectedRoute>} />
            <Route path="checklists" element={<ProtectedRoute requiredPermission="VIEW_CHECKLIST"><ChecklistsPage /></ProtectedRoute>} />
            <Route path="evidence" element={<ProtectedRoute requiredPermission="VIEW_EVIDENCE"><EvidencePage /></ProtectedRoute>} />
            <Route path="exceptions" element={<ProtectedRoute requiredPermission="VIEW_EXCEPTIONS"><ExceptionsPage /></ProtectedRoute>} />
            <Route path="overrides" element={<ProtectedRoute requiredPermission="VIEW_EXCEPTIONS"><OverridesPage /></ProtectedRoute>} />
            <Route path="audit-log" element={<ProtectedRoute requiredPermission="VIEW_AUDIT"><AuditLogPage /></ProtectedRoute>} />
            <Route path="analytics" element={<ProtectedRoute requiredPermission="VIEW_ANALYTICS"><AnalyticsPage /></ProtectedRoute>} />
            <Route path="models" element={<ProtectedRoute requiredPermission="VIEW_MODELS"><ModelsPage /></ProtectedRoute>} />
            <Route path="fairness" element={<ProtectedRoute requiredPermission="VIEW_BIAS"><FairnessPage /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute requiredPermission="MANAGE_USERS"><UsersPage /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute requiredPermission="MANAGE_SETTINGS"><SettingsPage /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
