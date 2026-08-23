import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";
import CartProvider from "./contexts/CartContext";

import SmoothScroll from "./utilities/SmoothScroll";
import ScrollToTop from "./utilities/ScrollToTop";

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
