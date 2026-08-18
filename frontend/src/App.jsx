import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Cart from "./pages/Cart";

import CartProvider from "./contexts/CartContext";
import ScrollToTop from "./utilities/ScrollToTop";

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToTop />

        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
