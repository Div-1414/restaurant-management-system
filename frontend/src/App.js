import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';
import '@/App.css';

import Login from './pages/Login';
import OwnerLogin from './pages/auth/OwnerLogin';
import ManagerLogin from './pages/auth/ManagerLogin';
import KitchenLogin from './pages/auth/KitchenLogin';
import SuperAdmin from './pages/SuperAdmin';
import Owner from './pages/Owner';

import CustomerDashboard from './pages/CustomerMenu/CustomerDashboard';
import CustomerOrders from './pages/CustomerMenu/CustomerOrders';
import CustomerLogin from './pages/CustomerMenu/CustomerLogin';

// ✅ Replaced Welcome with new marketing pages
import HomePage from './components/ui/HomePage';
import AboutPage from './components/ui/AboutPage';
import ContactPage from './components/ui/ContactPage';

import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import RestaurantDetails from './pages/RestaurantDetails';
import ServiceInactive from './pages/ServiceInactive';
import ParcelCustomerMenu from './components/parcel/ParcelCustomerMenu';
import ManagerDashboard from './components/manager dasboard/ManagerDashboard';
import KitchenDashboard from './components/kitchen/KitchenDashboard';

/* ---------------- PROTECTED ROUTE ---------------- */

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

/* ---------------- LAYOUT ---------------- */

const Layout = ({ children }) => {
  const location = useLocation();

  const hideLayoutRoutes = [
    '/menu/',
    '/parcel/menu/',
    '/login/',
    '/owner-login',
    '/manager-login',
    '/kitchen-login',
    '/super-admin',
    '/owner',
    '/manager',
    '/kitchen',
  ];

  // ✅ Also hide Navbar/Footer on the new marketing pages (they have their own nav)
  const hideLayoutPages = ['/', '/about', '/contact'];

  const hideLayout =
    hideLayoutRoutes.some((route) => location.pathname.startsWith(route)) ||
    hideLayoutPages.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-[#F3EBDD]">
      {!hideLayout && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideLayout && <Footer />}
    </div>
  );
};

/* ---------------- APP ---------------- */

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />

        <Layout>
          <Routes>

            {/* ---------- MARKETING PAGES ---------- */}

            {/* ✅ New landing page — replaces the old Welcome redirect logic */}
            <Route path="/"        element={<HomePage />} />
            <Route path="/about"   element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* ---------- PUBLIC ROUTES ---------- */}

            {/* Shared fallback login (SuperAdmin — unchanged) */}
            <Route path="/login" element={<Login />} />

            <Route path="/owner-login"   element={<OwnerLogin />} />
            <Route path="/manager-login" element={<ManagerLogin />} />
            <Route path="/kitchen-login" element={<KitchenLogin />} />

            <Route
              path="/login/:restaurantId/:tableId"
              element={<CustomerLogin />}
            />

            <Route path="/service-inactive" element={<ServiceInactive />} />

            <Route
              path="/menu/:restaurantId/:tableId"
              element={<CustomerDashboard />}
            />

            <Route
              path="/menu/:restaurantId/:tableId/orders"
              element={<CustomerOrders />}
            />

            <Route
              path="/parcel/menu/:restaurantId"
              element={<ParcelCustomerMenu />}
            />

            {/* ---------- SUPER ADMIN ---------- */}

            <Route
              path="/super-admin"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdmin />
                </ProtectedRoute>
              }
            />

            <Route
              path="/super-admin/restaurants/:id"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <RestaurantDetails />
                </ProtectedRoute>
              }
            />

            {/* ---------- OWNER / MANAGER ---------- */}

            <Route
              path="/owner"
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <Owner />
                </ProtectedRoute>
              }
            />

            <Route
              path="/manager"
              element={
                <ProtectedRoute allowedRoles={['restaurant_manager']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />

            {/* ---------- KITCHEN ---------- */}

            <Route
              path="/kitchen"
              element={
                <ProtectedRoute allowedRoles={['kitchen_staff', 'owner']}>
                  <KitchenDashboard />
                </ProtectedRoute>
              }
            />

          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;