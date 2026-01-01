import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Import your pages
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ShopPage from './pages/ShopPage';
import AdminDashboard from './pages/AdminDashboard';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';

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
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />
          </Route>

          {/* --- FARMER ROUTES --- */}
          <Route element={<ProtectedRoute allowedRoles={['Farmer']} />}>
            <Route path="/farmer" element={<DashboardPage userType="Farmer" />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />
          </Route>

          {/* --- CONSUMER ROUTES --- */}
          <Route element={<ProtectedRoute allowedRoles={['Consumer']} />}>
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/products/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />
          </Route>
          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;