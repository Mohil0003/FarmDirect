import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import ConsumerLayout from './components/layout/ConsumerLayout';
import FarmerLayout from './components/layout/FarmerLayout';

// Pages
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShopPage from './pages/ShopPage';
import AdminDashboard from './pages/AdminDashboard';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ProductFormPage from './pages/ProductFormPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import ProductsListPage from './pages/ProductsListPage';
import CategoryManagementPage from './pages/CategoryManagementPage';
import PaymentManagementPage from './pages/PaymentManagementPage';
import ReviewManagementPage from './pages/ReviewManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import RevenuePage from './pages/RevenuePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" />
          <Routes>

            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<h1>Access Denied!</h1>} />

            {/* --- ADMIN ROUTES (wrapped in AdminLayout) --- */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/orders" element={<OrdersPage />} />
                <Route path="/admin/orders/:id" element={<OrderDetailsPage />} />
                <Route path="/admin/products" element={<ProductsListPage />} />
                <Route path="/admin/categories" element={<CategoryManagementPage />} />
                <Route path="/admin/payments" element={<PaymentManagementPage />} />
                <Route path="/admin/reviews" element={<ReviewManagementPage />} />
              </Route>
            </Route>

            {/* --- FARMER ROUTES (wrapped in FarmerLayout) --- */}
            <Route element={<ProtectedRoute allowedRoles={['Farmer']} />}>
              <Route element={<FarmerLayout />}>
                <Route path="/farmer" element={<DashboardPage userType="Farmer" />} />
                <Route path="/products" element={<ProductsListPage />} />
                <Route path="/products/new" element={<ProductFormPage />} />
                <Route path="/products/:id/edit" element={<ProductFormPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailsPage />} />
                <Route path="/revenue" element={<RevenuePage />} />
              </Route>
            </Route>

            {/* --- CONSUMER ROUTES (wrapped in ConsumerLayout) --- */}
            <Route element={<ProtectedRoute allowedRoles={['Consumer']} />}>
              <Route element={<ConsumerLayout />}>
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/products/:id" element={<ProductDetailsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/consumer/orders" element={<OrdersPage />} />
                <Route path="/consumer/orders/:id" element={<OrderDetailsPage />} />
              </Route>
            </Route>

            {/* Default Redirect */}
            <Route path="*" element={<Navigate to="/login" />} />

          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;