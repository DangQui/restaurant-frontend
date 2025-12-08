import { Fragment } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";

import { CartProvider } from "@/store/CartContext";
import { AuthProvider } from "@/store/AuthContext";

import MainLayout from "@/layouts/MainLayout/MainLayout";

import HomePage from "@/pages/Home/Home";
import AboutPage from "@/pages/About/About";
import ContactPage from "@/pages/Contact/Contact";
import MenuPage from "@/pages/Menu/Menu";
import ProductPage from "@/pages/Product/Product";
import SearchPage from "@/pages/Search/Search";
import CartPage from "@/pages/Cart/Cart";
import CheckoutPage from "@/pages/Checkout/Checkout";
import ReservationPage from "@/pages/Reservation/Reservation";
import BlogPage from "@/pages/Blog/Blog";
import PagesPage from "@/pages/Pages/Pages";
import ProfilePage from "@/pages/Profile/Profile";
import OrdersPage from "@/pages/Orders/Orders";
import SettingsPage from "@/pages/Settings/Settings";
import TrackingPage from "@/pages/Tracking/Tracking";
import AuthDialog from "@/components/AuthDialog/AuthDialog";

import AdminLayout from '@/layouts/AdminLayout/AdminLayout'
import MenuItemsPage from '@/pages/Admin/MenuItemsPage'
import UsersPage from '@/pages/Admin/UsersPage'
import DashboardPage from '@/pages/Admin/DashboardPage'
import TablesPage from '@/pages/admin/TablesPage'
import AdminOrdersPage from '@/pages/admin/OrdersPage'
import ReservationsPage from "./pages/Admin/ReservationsPage";

import ProtectedRoute from '@/components/ProtectedRoute'

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "pages", element: <PagesPage /> },
      { path: "blog", element: <BlogPage /> },
      { path: "menu", element: <MenuPage /> },
      { path: "menu/:productId", element: <ProductPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "reservation", element: <ReservationPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "tracking", element: <TrackingPage /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'reservations', element: <ReservationsPage /> },
      { path: 'menu', element: <MenuItemsPage /> },
      { path: 'tables', element: <TablesPage /> },
      { path: 'users', element: <UsersPage /> },
    ],
  },
]);

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Fragment>
          <Toaster
            richColors
            position="bottom-right"
            closeButton
            duration={4000}
          />
          <RouterProvider router={router} />
          <AuthDialog />
        </Fragment>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
