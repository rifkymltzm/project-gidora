import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageTransition from "../utilities/PageTransition";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <PageTransition />
      </main>

      <Footer />
    </div>
  );
}
