import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';

// Simple toast utility
const showToast = (message: string, type: 'success' | 'error' = 'error') => {
  // Simple alert for now - can be replaced with a proper toast library later
  if (type === 'error') {
    alert(`❌ ${message}`);
  } else {
    alert(`✅ ${message}`);
  }
};

interface LocationState {
  userId: string;
  email: string;
}

export default function AdminOTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email } = (location.state as LocationState) || {};
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuthStore();

  useEffect(() => {
    // Redirect if no userId
    if (!userId || !email) {
      showToast('Invalid access. Please login again.');
      navigate('/login');
      return;
    }

    // Focus first input
    inputRefs.current[0]?.focus();

    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          showToast('OTP expired. Please login again.');
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [userId, email, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only the last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields filled
    if (newOtp.every((digit) => digit !== '') && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) {
      showToast('Please paste only digits');
      return;
    }

    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);
    
    // Focus last filled input or first empty
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();

    // Auto-submit if complete
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== 6) {
      showToast('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyAdminOTP({ userId, otp: code });
      
      if (response.status === 'success' && response.token && response.data?.user) {
        // Store tokens
        login(response.data.user, response.token);
        
        showToast('Welcome back, Admin! 🔐', 'success');
        navigate('/admin/dashboard');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Invalid OTP. Please try again.';
      showToast(message);
      
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-red-500 to-red-600 rounded-full mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Verification</h1>
          <p className="text-gray-600">
            We've sent a 6-digit code to
            <br />
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
        </div>

        {/* OTP Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Timer */}
          <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-red-50 rounded-lg border border-red-100">
            <span className="text-2xl">⏱️</span>
            <span className="text-lg font-semibold text-red-600">
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm text-red-600">remaining</span>
          </div>

          {/* OTP Input */}
          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-4 transition-all ${
                  digit
                    ? 'border-red-500 bg-red-50 text-red-600 focus:ring-red-100'
                    : 'border-gray-300 focus:border-red-500 focus:ring-red-100'
                }`}
                disabled={loading}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleVerify()}
            disabled={loading || otp.some((d) => d === '')}
            className="w-full bg-linear-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify OTP'
            )}
          </button>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex gap-3">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  Security Notice
                </p>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Never share this code with anyone</li>
                  <li>• This is an admin-level access attempt</li>
                  <li>• Contact support if you didn't request this</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Back to Login */}
          <button
            onClick={() => navigate('/login')}
            className="w-full mt-4 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            ← Back to Login
          </button>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Didn't receive the code? Check your spam folder or try logging in again.
        </p>
      </div>
    </div>
  );
}
