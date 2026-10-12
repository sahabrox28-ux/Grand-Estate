import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import News from './components/News';
import Roster from './components/Roster';
import Rules from './components/Rules';
import Games from './components/Games';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminLogin from './components/AdminLogin';
import { AdminProvider } from './lib/AdminContext';
import { useEffect } from 'react';

function ScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

function HomePage() {
  return (
    <>
      <Hero />
      <News />
      <Rules />
      <Roster />
      <Contact />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <div className="min-h-screen bg-[#050b18] text-slate-100 font-sans selection:bg-[#D4AF37]/30 selection:text-[#F5DF8A] relative overflow-x-hidden">
          <ScrollToHash />
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/games" element={<Games />} />
            </Routes>
          </main>
          <Footer />
          <AdminLogin />
        </div>
      </AdminProvider>
    </BrowserRouter>
  );
}
