import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SaasProvider } from './context/SaasContext';
import { OfflineProvider } from './context/OfflineContext';
import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ParkingPage from './pages/ParkingPage';
import MonthlyClientsPage from './pages/MonthlyClientsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import AuditPage from './pages/AuditPage';
import BrandsPage from './pages/BrandsPage';
import ExpensesPage from './pages/ExpensesPage';
import IncomesPage from './pages/IncomesPage';
import WashPage from './pages/WashPage';
import UsersPage from './pages/UsersPage';
import AgreementsPage from './pages/AgreementsPage';
import ShiftHistoryPage from './pages/ShiftHistoryPage';
import TransactionsPage from './pages/TransactionsPage';
import TicketStatusPage from './pages/TicketStatusPage';
import LicenseActivationPage from './pages/LicenseActivationPage';
import TenantsPage from './pages/admin/TenantsPage';
import TenantFormPage from './pages/admin/TenantFormPage';
import TenantDetailPage from './pages/admin/TenantDetailPage';
import LocationsPage from './pages/admin/LocationsPage';

// Detect if running in Electron
const isElectron = import.meta.env.VITE_APP_MODE === 'electron';

// Use HashRouter for Electron, BrowserRouter for Web
const Router = isElectron ? HashRouter : BrowserRouter;

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <OfflineProvider>
      <AuthProvider>
        <SaasProvider>
          <Toaster richColors position="top-center" />
          <Router>
            <Routes>
              {/* License activation route - only in Electron */}
              {isElectron && <Route path="/license" element={<LicenseActivationPage />} />}

              {/* Setup route only available in Electron */}
              {isElectron && <Route path="/setup" element={<SetupPage />} />}

              <Route path="/login" element={<LoginPage />} />
              <Route path="/ticket/:id" element={<TicketStatusPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="parking" element={<ParkingPage />} />
                <Route path="monthly-clients" element={<MonthlyClientsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="brands" element={<BrandsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="incomes" element={<IncomesPage />} />
                <Route path="wash" element={<WashPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="audit" element={<AuditPage />} />
                <Route path="agreements" element={<AgreementsPage />} />
                <Route path="shift-history" element={<ShiftHistoryPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                {/* Admin Routes - SUPER_ADMIN only */}
                <Route path="admin/tenants" element={<TenantsPage />} />
                <Route path="admin/tenants/new" element={<TenantFormPage />} />
                <Route path="admin/tenants/:id/edit" element={<TenantFormPage />} />
                <Route path="admin/tenants/:id" element={<TenantDetailPage />} />
                <Route path="admin/locations" element={<LocationsPage />} />
                {/* Add other nested routes here */}
              </Route>
            </Routes>
          </Router>
        </SaasProvider>
      </AuthProvider>
    </OfflineProvider>
  );
}

export default App;
