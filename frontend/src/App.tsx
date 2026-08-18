import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductListingPage from './pages/ProductListingPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSizeCharts from './pages/admin/AdminSizeCharts';
import AdminOccasions from './pages/admin/AdminOccasions';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCollectionManager from './pages/admin/AdminCollectionManager';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCustomerDetail from './pages/admin/AdminCustomerDetail';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSeoManager from './pages/admin/AdminSeoManager';
import AdminScheduledMessages from './pages/admin/AdminScheduledMessages';
import AdminFestivalMessages from './pages/admin/AdminFestivalMessages';
import AdminRestockRequests from './pages/admin/AdminRestockRequests';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import AddressPage from './pages/AddressPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import GuestLoginPage from './pages/auth/GuestLoginPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactPage from './pages/ContactPage';
import FaqPage from './pages/FaqPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ReturnPolicyPage from './pages/ReturnPolicyPage';
import TermsPage from './pages/TermsPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/ScrollToTop';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import './index.css';
import './App.css';

function App() {
  return (
    <SiteSettingsProvider>
      <div className="app">
      <ScrollToTop />
      <Toaster position="top-center" />
      <Routes>

        <Route path="/orders/:id/track" element={<OrderTrackingPage />} />

        {/* Admin Routes - without Navbar/Footer */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="size-charts" element={<AdminSizeCharts />} />
          <Route path="occasions" element={<AdminOccasions />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="trending" element={<AdminCollectionManager type="trending" title="Trending Products" />} />
          <Route path="new-arrivals" element={<AdminCollectionManager type="new-arrivals" title="New Arrivals" />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/edit/:id" element={<AdminProductForm />} />
          <Route path="restock-requests" element={<AdminRestockRequests />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="customers/:id" element={<AdminCustomerDetail />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="seo" element={<AdminSeoManager />} />
          <Route path="scheduled-messages" element={<AdminScheduledMessages />} />
          <Route path="festival-messages" element={<AdminFestivalMessages />} />
        </Route>

        {/* Public Routes - with Navbar/Footer */}
        <Route path="/*" element={
          <>
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faqs" element={<FaqPage />} />
                <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/return-policy" element={<ReturnPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/new-arrivals" element={<ProductListingPage />} />
                <Route path="/trending" element={<ProductListingPage />} />
                <Route path="/search" element={<ProductListingPage />} />
                <Route path="/products" element={<ProductListingPage />} />
                <Route path="/category/:slug" element={<ProductListingPage />} />
                <Route path="/occasion/:slug" element={<ProductListingPage />} />
                <Route path="/maternity" element={<ProductListingPage />} />
                <Route path="/collection/:id" element={<ProductListingPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/address" element={<AddressPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/guest-login" element={<GuestLoginPage />} />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
      </div>
    </SiteSettingsProvider>
  );
}

export default App;
