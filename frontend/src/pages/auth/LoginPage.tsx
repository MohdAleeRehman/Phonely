import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { AuthResponse } from '../../types';
import type { AdminOTPResponse } from '../../services/auth.service';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await api.post<AuthResponse | AdminOTPResponse>('/auth/login', data);
      
      // Check if admin OTP is required
      if ('data' in response.data && response.data.data && 'requiresOtp' in response.data.data) {
        const otpData = response.data.data as { requiresOtp: boolean; email: string; userId: string };
        if (otpData.requiresOtp) {
          // Redirect to OTP verification page
          navigate('/admin/verify-otp', {
            state: {
              userId: otpData.userId,
              email: otpData.email,
            },
          });
          return;
        }
      }
      
      // Regular user login
      const authResponse = response.data as AuthResponse;
      const { user } = authResponse.data;
      const token = authResponse.token;
      const refreshToken = authResponse.refreshToken;
      
      login(user, token, refreshToken, rememberMe);
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black text-white">
          <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-600">Welcome Back!</span>
        </h2>
        <p className="text-gray-300 mt-2">Login to your account</p>
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg mb-4 flex items-center gap-2 backdrop-blur-sm"
        >
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-1">
            <Mail className="w-4 h-4 text-cyan-400" /> Email
          </label>
          <input
            type="email"
            {...register('email')}
            className="input-field"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.email.message}
            </p>
          )}
        </div>

        <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-1">
              <Lock className="w-4 h-4 text-cyan-400" /> Password
            </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className="input-field pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.password.message}
            </p>
          )}
        </div>

        {/* Keep me logged in checkbox */}
        <div className="flex items-center">
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-200 cursor-pointer select-none">
            Keep me logged in (7 days)
          </label>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-linear-to-r from-cyan-500 to-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-xl hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Logging in...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Login
            </span>
          )}
        </motion.button>
      </form>

      <p className="text-center mt-6 text-gray-300">
        Don't have an account?{' '}
        <Link to="/register" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
          Sign up here
        </Link>
      </p>
    </motion.div>
  );
}
