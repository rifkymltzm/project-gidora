import { useRoutes } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public pages
import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetail from '../pages/ProductDetail';
import About from '../pages/About';

// Customer pages
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import Payment from '@/pages/customer/Payment';
import OrderSuccess from '../pages/customer/OrderSuccess';

// Auth pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Account pages
import UserProfile from '../pages/customer/account/UserProfile';
import UserAddresses from '../pages/customer/account/UserAddresses';
import UserOrders from '../pages/customer/account/UserOrders';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminProductEdit from '../pages/admin/AdminProductEdit';
import AdminProductCreate from '../pages/admin/AdminProductCreate';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminCustomers from '../pages/admin/AdminCustomers';

import { getOrders } from '../features/order/orderService';

const routes = [
  // =========================
  // MAIN
  // =========================

  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/about',
        element: <About />,
      },
      {
        path: '/products',
        element: <Products />,
      },
      {
        path: '/products/:slug',
        element: <ProductDetail />,
      },
      {
        path: '/cart',
        element: <Cart />,
      },
      {
        path: '/checkout',
        element: <Checkout />,
      },
      {
        path: '/payment',
        element: <Payment />,
      },
      {
        path: '/payment/:orderId',
        element: <Payment />,
      },
      {
        path: '/order-success/:orderId',
        element: <OrderSuccess />,
      },

      // =========================
      // ACCOUNT
      // =========================

      {
        path: '/account/profile',
        element: <UserProfile />,
      },
      {
        path: '/account/addresses',
        element: <UserAddresses />,
      },
      {
        path: '/account/orders',
        element: <UserOrders />,
      },

      // =========================
      // AUTH
      // =========================

      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
    ],
  },

  // =========================
  // ADMIN
  // =========================

  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'products',
        element: <AdminProducts />,
      },
      {
        path: 'products/new',
        element: <AdminProductCreate />,
      },
      {
        path: 'products/:sku',
        element: <AdminProductEdit />,
      },
      {
        path: 'orders',
        element: <AdminOrders />,
      },
      {
        path: 'customers',
        element: <AdminCustomers orders={getOrders()} />,
      },
    ],
  },
];

export default function AppRoutes() {
  return useRoutes(routes);
}
