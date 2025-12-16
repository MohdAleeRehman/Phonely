import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';

export default function VerifyEmailSentPage() {
  const location = useLocation();
  const email = location.state?.email || '';
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResend = async () => {
    if (!email) {
      setError('Email address not found. Please register again.');
      return;
    }

    try {
      setIsResending(true);
      setError('');
      setMessage('');
      
      await authService.resendVerification({ email });
      
      setMessage('Verification email sent! Please check your inbox.');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto relative">
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-primary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
        <p className="text-gray-300">
          We've sent a verification link to
        </p>
        <p className="text-primary-600 font-semibold mt-1">{email}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 mr-3 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">What to do next:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Open your email inbox</li>
              <li>Find the email from Phonely</li>
              <li>Click the verification link</li>
              <li>You'll be redirected back here</li>
            </ol>
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="text-center">
          <p className="text-gray-300 text-sm mb-2">Didn't receive the email?</p>
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-primary-600 font-medium hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>

        <div className="border-t pt-4">
          <p className="text-center text-sm text-gray-500 mb-2">
            Check your spam folder if you don't see it
          </p>
          <div className="text-center">
            <Link
              to="/"
              className="text-sm text-gray-300 hover:text-white underline"
            >
              Continue to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t">
        <p className="text-center text-xs text-gray-500">
          The verification link will expire in 24 hours
        </p>
      </div>
    </div>
  );
}
