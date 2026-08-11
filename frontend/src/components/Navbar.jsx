import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-gray-900">
          MyStore
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>

          <Link to="/products" className="text-gray-600 hover:text-gray-900">
            Products
          </Link>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Register
          </Link>
        </div>
      </nav>
    </header>
  );
}
