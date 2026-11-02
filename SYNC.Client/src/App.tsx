import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';

import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ShiftsPage from './pages/shifts/ShiftsPage';
import EmployeesPage from './pages/employees/EmployeesPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />

              <Route path="/shifts" element={<ShiftsPage />} />

              <Route
                element={
                  <ProtectedRoute allowedRoles={['Coordinator', 'Admin']} />
                }
              >
                <Route
                  path="/employees"
                  element={<EmployeesPage />}
                />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;