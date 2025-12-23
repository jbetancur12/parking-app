import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LicensesPage } from './pages/LicensesPage';

// Simple protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // In a real app we would check auth token here
  // const { token } = useAuth();
  // if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Navigate to="/dashboard" replace />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/licenses" element={
            <ProtectedRoute>
              <DashboardLayout>
                <LicensesPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
