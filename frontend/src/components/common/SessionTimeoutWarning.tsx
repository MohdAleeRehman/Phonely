import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

export default function SessionTimeoutWarning() {
  const { isAuthenticated, rememberMe, lastActivity, updateActivity, logout } = useAuthStore();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes warning

  useEffect(() => {
    if (!isAuthenticated || rememberMe) return;

    const checkSession = () => {
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000;
      const twoMinutes = 2 * 60 * 1000;
      const timeSinceActivity = now - lastActivity;

      // Show warning 2 minutes before timeout
      if (timeSinceActivity >= thirtyMinutes - twoMinutes && timeSinceActivity < thirtyMinutes) {
        setShowWarning(true);
        const secondsLeft = Math.floor((thirtyMinutes - timeSinceActivity) / 1000);
        setTimeLeft(secondsLeft);
      } else if (timeSinceActivity >= thirtyMinutes) {
        // Auto logout
        logout();
        setShowWarning(false);
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkSession();

    // Check every second
    const interval = setInterval(checkSession, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, rememberMe, lastActivity, logout]);

  const handleStayLoggedIn = () => {
    updateActivity();
    setShowWarning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-9999 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-orange-100 rounded-full p-4">
                <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <h3 className="text-2xl font-black text-gray-900 text-center mb-2">
              Session Expiring Soon
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Your session will expire in <span className="font-bold text-orange-600 text-xl">{formatTime(timeLeft)}</span>
            </p>
            <p className="text-sm text-gray-500 text-center mb-6">
              You'll be automatically logged out due to inactivity. Click "Stay Logged In" to continue your session.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={logout}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Logout Now
              </button>
              <button
                onClick={handleStayLoggedIn}
                className="flex-1 px-4 py-3 bg-linear-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Stay Logged In
              </button>
            </div>

            {/* Tip */}
            <p className="text-xs text-gray-400 text-center mt-4">
              💡 Tip: Enable "Keep me logged in" on the login page to stay logged in for 7 days
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
