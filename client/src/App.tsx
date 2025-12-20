import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ParkingPage from './pages/ParkingPage';
import MonthlyClientsPage from './pages/MonthlyClientsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import BrandsPage from './pages/BrandsPage';
import ExpensesPage from './pages/ExpensesPage';
import IncomesPage from './pages/IncomesPage';
import WashPage from './pages/WashPage';
import UsersPage from './pages/UsersPage';
import ShiftHistoryPage from './pages/ShiftHistoryPage';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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
            <Route path="shift-history" element={<ShiftHistoryPage />} />
            {/* Add other nested routes here */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
