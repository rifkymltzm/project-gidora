import { BrowserRouter } from 'react-router-dom';

import AppRoutes from './routes/AppRoutes';
import CartProvider from './features/cart/context/CartContext';

import SmoothScroll from './utils/SmoothScroll';
import ScrollToTop from './utils/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <SmoothScroll />
        <ScrollToTop />

        <AppRoutes />
      </CartProvider>
    </BrowserRouter>
  );
}
