import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSection } from './components/OrderSection';
import { AdminPanel } from './components/AdminPanel';
import { BottomNavigation } from './components/BottomNavigation';
import { CartDrawer } from './components/CartDrawer';
import { ContactModal } from './components/ContactModal';
import { AboutModal } from './components/AboutModal';
import { Sparkles } from 'lucide-react';

const Layout = () => {
  const { 
    isAdminOpen, 
    setIsAdminOpen, 
    toast 
  } = useStore();

  return (
    <div className="min-h-screen bg-[#FAF2E9] flex flex-col justify-between text-[#382017] selection:bg-[#B65A37]/20 selection:text-[#382017] pb-16 sm:pb-0">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div className="bg-[#382017] text-[#FFF9F2] text-xs px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 border border-[#B65A37]/40">
            <Sparkles className="w-4 h-4 text-[#C69B52]" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Global Header (Section 1 Announcement Bar + Section 2 Mobile Header) */}
      <Header />

      {/* Dynamic Route Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPanel onClose={() => setIsAdminOpen(false)} />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order" element={<OrderSection />} />
          {/* Fallback route */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Mobile Sticky Bottom Navigation (4 tabs: Home, Bag, Contact, Order) */}
      <BottomNavigation />

      {/* Modals & Slide Drawers */}
      {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} />}
      <CartDrawer />
      <ContactModal />
      <AboutModal />

    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
