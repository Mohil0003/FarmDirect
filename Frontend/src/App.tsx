import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Import your pages (We will create dummy versions below)
import DashboardPage from './pages/DashboardPage'; // Re-use the one we made!
import LoginPage from './pages/LoginPage';
import ShoPage from './pages/ShopPage'
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<h1>Access Denied!</h1>} />

          {/* --- ADMIN ROUTES --- */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            {/* This makes /admin load the new dashboard */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* --- FARMER ROUTES --- */}
          <Route element={<ProtectedRoute allowedRoles={['Farmer']} />}>
            {/* We reuse the DashboardPage we built earlier, but customize it for Farmers */}
            <Route path="/farmer" element={<DashboardPage userType="Farmer" />} />
          </Route>

          {/* --- CONSUMER ROUTES --- */}
          {/* --- CONSUMER ROUTES --- */}
          <Route element={<ProtectedRoute allowedRoles={['Consumer']} />}>
            {/* THIS IS THE LINE defining the route: */}
            <Route path="/shop" element={<ShoPage />} />
          </Route>
          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;