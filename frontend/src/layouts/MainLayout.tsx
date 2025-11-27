import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-50 via-white to-primary-50/20">
      {/* Header with glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo & Nav */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-primary-800 hover:scale-105 transition-transform duration-200">
                📱 Phonely
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/listings" className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 hover:scale-105 transform">
                  🔍 Browse
                </Link>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <Link to="/listings/create" className="px-5 py-2 bg-linear-to-r from-primary-600 to-primary-700 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200">
                    ✨ Sell Phone
                  </Link>
                  <Link to="/chat" className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 relative">
                    💬 Chat
                  </Link>
                  <Link to="/profile" className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200 flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span>{user?.name}</span>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="px-4 py-2 text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200">
                      👑 Admin
                    </Link>
                  )}
                  <button onClick={logout} className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-all duration-200">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200">
                    Login
                  </Link>
                  <Link to="/register" className="px-5 py-2 bg-linear-to-r from-primary-600 to-primary-700 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200">
                    🚀 Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 animate-fade-in">
              <div className="flex flex-col space-y-3">
                <Link to="/listings" className="text-gray-700 hover:text-primary-600 font-medium py-2">
                  🔍 Browse Phones
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link to="/listings/create" className="text-primary-600 font-semibold py-2">
                      ✨ Sell Phone
                    </Link>
                    <Link to="/chat" className="text-gray-700 hover:text-primary-600 py-2">
                      💬 Chat
                    </Link>
                    <Link to="/profile" className="text-gray-700 hover:text-primary-600 py-2">
                      👤 {user?.name}
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="text-orange-600 py-2">
                        👑 Admin
                      </Link>
                    )}
                    <button onClick={logout} className="text-left text-gray-600 py-2">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-700 py-2">Login</Link>
                    <Link to="/register" className="text-primary-600 font-semibold py-2">🚀 Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer - Gen Z Style */}
      <footer className="bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 text-white mt-auto border-t-4 border-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-primary-400 to-primary-600">
                📱 Phonely
              </h3>
              <p className="text-gray-400 text-sm">
                Your trusted marketplace for buying and selling phones. AI-powered authenticity checks. 🔥
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200 text-xl">📘</a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200 text-xl">📷</a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200 text-xl">🐦</a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/listings" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">Browse Phones</Link></li>
                <li><Link to="/listings/create" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">Sell Your Phone</Link></li>
                <li><Link to="/chat" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">Messages</Link></li>
                <li><Link to="/profile" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">My Profile</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">Safety Tips</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">FAQs</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-bold mb-4 text-white">Stay Updated 📬</h4>
              <p className="text-gray-400 text-sm mb-3">Get the latest deals and updates!</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-r-lg transition-colors duration-200 font-semibold">
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">© 2025 Phonely. All rights reserved. Made with 💙 in Pakistan</p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
