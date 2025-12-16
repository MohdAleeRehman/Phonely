import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService } from '../services/chat.service';
import { socketService } from '../services/socket.service';
import { Search, Sparkles, MessageSquare, Crown, LogOut, Rocket, Menu, X, User, Heart } from 'lucide-react';

export default function MainLayout() {
  const { user, isAuthenticated, logout, token } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const queryClient = useQueryClient();

  // Fetch unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: chatService.getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Listen for new messages to update badge in real-time
  useEffect(() => {
    if (!isAuthenticated || !user || !token) return;

    const userId = user._id || user.id;
    if (!userId) return;

    // Connect socket if not already connected
    socketService.connect(token, userId);

    // Listen for new messages to update unread count
    const handleNewMessage = () => {
      // Invalidate unread count to refetch
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    };

    socketService.onNewMessage(handleNewMessage);

    return () => {
      socketService.off('new-message');
    };
  }, [isAuthenticated, user, token, queryClient]);

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-900 via-blue-950 to-gray-900">
      {/* Header with glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-900/80 border-b border-white/10 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo & Nav - Main logo without tagline (gradient version) */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="hover:scale-105 transition-transform duration-200 flex items-center gap-2">
                <img src="/phonely-logo-wo-tagline-no-bg.png" alt="Phonely" className="h-24" />
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/listings" className="text-gray-200 hover:text-cyan-400 font-medium transition-colors duration-200 hover:scale-105 transform flex items-center gap-2">
                  <Search className="w-4 h-4" /> Browse
                </Link>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <Link to="/listings/create" className="px-5 py-2 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Sell Phone
                  </Link>
                  <Link to="/chat" className="px-4 py-2 text-gray-200 hover:text-cyan-400 font-medium transition-colors duration-200 relative flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Chat
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </Link>
                  <Link to="/profile" className="px-4 py-2 text-gray-200 hover:text-cyan-400 font-medium transition-colors duration-200 flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span>{user?.name}</span>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="px-4 py-2 text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200 flex items-center gap-2">
                      <Crown className="w-4 h-4" /> Admin
                    </Link>
                  )}
                  <button onClick={logout} className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-all duration-200 flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-gray-200 hover:text-cyan-400 font-medium transition-colors duration-200">
                    Login
                  </Link>
                  <Link to="/register" className="px-5 py-2 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-200 flex items-center gap-2">
                    <Rocket className="w-4 h-4" />
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-cyan-400"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10 animate-fade-in">
              <div className="flex flex-col space-y-3">
                <Link to="/listings" className="text-gray-200 hover:text-cyan-400 font-medium py-2 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Browse Phones
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link to="/listings/create" className="text-cyan-400 font-semibold py-2 hover:text-cyan-300 transition-colors flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Sell Phone
                    </Link>
                    <Link to="/chat" className="text-gray-200 hover:text-cyan-400 py-2 relative inline-flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Chat
                      {unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                      )}
                    </Link>
                    <Link to="/profile" className="text-gray-200 hover:text-cyan-400 py-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {user?.name}
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="text-orange-400 py-2 flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        Admin
                      </Link>
                    )}
                    <button onClick={logout} className="text-left text-gray-300 py-2 flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-200 py-2">Login</Link>
                    <Link to="/register" className="text-cyan-400 font-semibold py-2 hover:text-cyan-300 transition-colors flex items-center gap-2">
                      <Rocket className="w-4 h-4" />
                      Sign Up
                    </Link>
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

      {/* Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-md text-white mt-auto border-t-2 border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <img src="/phonely-logo-wo-tagline-no-bg.png" alt="Phonely" className="h-30" />
              <p className="text-gray-300 text-sm leading-relaxed">
                Pakistan's first AI-verified phone marketplace. Buy and sell phones with confidence.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/how-ai-verification-works" className="text-gray-300 hover:text-cyan-400 transition-colors duration-200">How AI Verification Works</Link></li>
                <li><Link to="/safety-tips" className="text-gray-300 hover:text-cyan-400 transition-colors duration-200">Safety Tips</Link></li>
                <li><Link to="/pricing-guide" className="text-gray-300 hover:text-cyan-400 transition-colors duration-200">Pricing Guide</Link></li>
                <li><Link to="/about" className="text-gray-300 hover:text-cyan-400 transition-colors duration-200">About Us</Link></li>
                <li><a href="mailto:support@phonely.com.pk" className="text-gray-300 hover:text-cyan-400 transition-colors duration-200">Contact Support</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/terms" className="text-gray-300 hover:text-cyan-400 transition-colors duration-200">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-gray-300 hover:text-cyan-400 transition-colors duration-200">Privacy Policy</Link></li>
                <li><Link to="/community-guidelines" className="text-gray-300 hover:text-cyan-400 transition-colors duration-200">Community Guidelines</Link></li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="font-bold mb-4 text-white">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-cyan-400 transition-colors duration-200">WhatsApp Support</a></li>
                <li><a href="https://facebook.com/phonelypk" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-cyan-400 transition-colors duration-200">Facebook</a></li>
                <li><a href="https://instagram.com/phonelypk" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-cyan-400 transition-colors duration-200">Instagram</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t-2 border-white/20 text-center">
            <p className="text-gray-400 text-sm flex items-center justify-center gap-1">© 2025 Phonely. All rights reserved. Made with <Heart className="w-4 h-4 text-red-500" /> in Pakistan</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
