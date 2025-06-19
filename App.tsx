
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FileText, Archive, Settings as SettingsIcon, Home, Edit3 } from 'lucide-react';
import CreateInvoicePage from './pages/CreateInvoicePage';
import ArchivePage from './pages/ArchivePage';
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<CreateInvoicePage />} />
            <Route path="/fawateer" element={<ArchivePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NavigateToHome />} /> {/* Fallback for unknown routes */}
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

const NavigateToHome: React.FC = () => {
  // Simple component to navigate to home, useful if direct <Navigate> causes issues in some setups
  React.useEffect(() => {
    window.location.hash = '#/';
  }, []);
  return null; 
};


const Header: React.FC = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'إنشاء فاتورة', icon: <Edit3 size={20} /> },
    { path: '/fawateer', label: 'أرشيف الفواتير', icon: <Archive size={20} /> },
    { path: '/settings', label: 'الإعدادات', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <header className="bg-white/70 backdrop-blur-lg shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse text-primary hover:text-secondary transition-colors">
            <FileText size={32} />
            <h1 className="text-2xl font-bold">نظام الفواتير</h1>
          </Link>
          <nav className="flex space-x-2 rtl:space-x-reverse">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-all
                  ${location.pathname === item.path 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-neutral-dark hover:bg-neutral-light hover:text-primary'
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-dark text-neutral-light py-4 text-center text-sm">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} جميع الحقوق محفوظة. نظام الفواتير الإلكترونية.</p>
      </div>
    </footer>
  );
};

export default App;
