import React, { Suspense, lazy } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SaasProvider } from './context/SaasContext';
import { OfflineProvider } from './context/OfflineContext';
import { ShiftProvider } from './context/ShiftContext';
import { Loader2 } from 'lucide-react';
import DashboardLayout from './layouts/DashboardLayout';

// Lazy Load Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LocationSelectionPage = lazy(() => import('./pages/LocationSelectionPage'));
const SetupPage = lazy(() => import('./pages/SetupPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ParkingPage = lazy(() => import('./pages/ParkingPage'));
const MonthlyClientsPage = lazy(() => import('./pages/MonthlyClientsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage'));
const BrandsPage = lazy(() => import('./pages/BrandsPage'));
const ExpensesPage = lazy(() => import('./pages/ExpensesPage'));
const IncomesPage = lazy(() => import('./pages/IncomesPage'));
const WashPage = lazy(() => import('./pages/WashPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const AgreementsPage = lazy(() => import('./pages/AgreementsPage'));
const ShiftHistoryPage = lazy(() => import('./pages/ShiftHistoryPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage').then(module => ({ default: module.InventoryPage }))); // Handle named export
const TicketStatusPage = lazy(() => import('./pages/TicketStatusPage'));
const LicenseActivationPage = lazy(() => import('./pages/LicenseActivationPage'));
const TenantsPage = lazy(() => import('./pages/admin/TenantsPage'));
const TenantFormPage = lazy(() => import('./pages/admin/TenantFormPage'));
const TenantDetailPage = lazy(() => import('./pages/admin/TenantDetailPage'));
const LocationsPage = lazy(() => import('./pages/admin/LocationsPage'));
const BillingPage = lazy(() => import('./pages/BillingPage'));
const AdminBillingPage = lazy(() => import('./pages/admin/AdminBillingPage'));

// Detect if running in Electron
const isElectron = import.meta.env.VITE_APP_MODE === 'electron';

// Use HashRouter for Electron, BrowserRouter for Web
const Router = isElectron ? HashRouter : BrowserRouter;

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const LoadingSpinner = () => (
  <div className="h-screen w-full flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="animate-spin text-brand-blue" size={48} />
      <p className="text-gray-500 font-medium animate-pulse">Cargando...</p>
    </div>
  </div>
);

function App() {
  return (
    <OfflineProvider>
      <AuthProvider>
        <SaasProvider>
          <ShiftProvider>
            <Toaster richColors position="top-center" />
            <Router>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/setup" element={<SetupPage />} />
                  <Route path="/ticket/:ticketId" element={<TicketStatusPage />} />
                  <Route path="/activate" element={<LicenseActivationPage />} />

                  <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="select-location" element={<LocationSelectionPage />} />

                    <Route path="parking" element={<ParkingPage />} />
                    <Route path="monthly" element={<MonthlyClientsPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="billing" element={<BillingPage />} />
                    <Route path="audit-logs" element={<AuditLogsPage />} />
                    <Route path="brands" element={<BrandsPage />} />
                    <Route path="expenses" element={<ExpensesPage />} />
                    <Route path="incomes" element={<IncomesPage />} />
                    <Route path="wash" element={<WashPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="agreements" element={<AgreementsPage />} />
                    <Route path="shifts" element={<ShiftHistoryPage />} />
                    <Route path="transactions" element={<TransactionsPage />} />
                    <Route path="inventory" element={<InventoryPage />} />

                    {/* Admin Routes */}
                    <Route path="admin/tenants" element={<TenantsPage />} />
                    <Route path="admin/tenants/new" element={<TenantFormPage />} />
                    <Route path="admin/tenants/:id" element={<TenantDetailPage />} />
                    <Route path="admin/locations" element={<LocationsPage />} />
                    <Route path="admin/billing" element={<AdminBillingPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </Router>
          </ShiftProvider>
        </SaasProvider>
      </AuthProvider>
    </OfflineProvider>
  );
}

export default App;
