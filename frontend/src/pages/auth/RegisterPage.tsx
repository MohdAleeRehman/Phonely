import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { calculatePasswordStrength, getPasswordStrengthColor, getPasswordStrengthTextColor } from '../../utils/passwordStrength';
import type { AuthResponse } from '../../types';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+\d{10,15}$/, 'Phone must be in format +923001234567'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  city: z.string().min(2, 'City is required'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

// Complete Cities of Pakistan organized by Province
const CITIES_BY_PROVINCE = {
  Punjab: [
    'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot', 
    'Bahawalpur', 'Sargodha', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 
    'Gujrat', 'Kasur', 'Sahiwal', 'Okara', 'Wah Cantonment', 'Dera Ghazi Khan',
    'Mirpur Khas', 'Kamoke', 'Mandi Burewala', 'Jhelum', 'Sadiqabad',
    'Khanewal', 'Hafizabad', 'Muzaffargarh', 'Khanpur', 'Chiniot', 'Attock'
  ],
  Sindh: [
    'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpur Khas',
    'Jacobabad', 'Shikarpur', 'Khairpur', 'Dadu', 'Ghotki', 'Badin',
    'Thatta', 'Tando Adam', 'Tando Allahyar', 'Umerkot', 'Sanghar'
  ],
  'Khyber Pakhtunkhwa': [
    'Peshawar', 'Mardan', 'Abbottabad', 'Mingora', 'Kohat', 'Dera Ismail Khan',
    'Swabi', 'Charsadda', 'Nowshera', 'Mansehra', 'Bannu', 'Haripur',
    'Karak', 'Swat', 'Malakand', 'Dir', 'Chitral', 'Hangu'
  ],
  Balochistan: [
    'Quetta', 'Turbat', 'Khuzdar', 'Hub', 'Chaman', 'Gwadar', 'Sibi',
    'Zhob', 'Loralai', 'Dera Murad Jamali', 'Mastung', 'Kalat', 'Nushki'
  ],
  'Islamabad Capital Territory': ['Islamabad'],
  'Azad Jammu & Kashmir': [
    'Muzaffarabad', 'Mirpur', 'Rawalakot', 'Kotli', 'Bhimber', 'Bagh'
  ],
  'Gilgit-Baltistan': [
    'Gilgit', 'Skardu', 'Hunza', 'Ghanche', 'Diamir', 'Ghizer'
  ]
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = calculatePasswordStrength(password);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await api.post<AuthResponse>('/auth/register', data);
      
      // Auto-login user but they'll need to verify email for full access
      const { user } = response.data.data;
      const token = response.data.token;
      const refreshToken = response.data.refreshToken;
      
      login(user, token, refreshToken);
      
      // Redirect to verification sent page
      navigate('/verify-email-sent', { 
        state: { email: data.email } 
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
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
        <h2 className="text-3xl font-black">
          <span className="bg-linear-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">Join Phonely</span> <span>✨</span>
        </h2>
        <p className="text-gray-600 mt-2">Create your account and start selling</p>
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              👤 Full Name
            </label>
          <input
            {...register('name')}
            className="input-field"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <span className="grayscale opacity-70">⚠️</span> {errors.name.message}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
            <span className="grayscale opacity-70">📧</span> Email
          </label>
          <input
            type="email"
            {...register('email')}
            className="input-field"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <span className="grayscale opacity-70">⚠️</span> {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
            📱 Phone (with country code)
          </label>
          <input
            {...register('phone')}
            className="input-field"
            placeholder="+923001234567"
          />
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <span className="grayscale opacity-70">⚠️</span> {errors.phone.message}
            </p>
          )}
        </div>

        {/* Password Field with Strength Indicator */}
        <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              🔒 Password
            </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                onChange: (e) => setPassword(e.target.value),
              })}
              className="input-field pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    transition={{ duration: 0.3 }}
                    className={`h-full ${getPasswordStrengthColor(passwordStrength.score)}`}
                  />
                </div>
                <span className={`text-sm font-medium ${getPasswordStrengthTextColor(passwordStrength.score)}`}>
                  {passwordStrength.label}
                </span>
              </div>
              {passwordStrength.feedback.length > 0 && (
                <ul className="text-xs text-gray-600 space-y-0.5 ml-1">
                  {passwordStrength.feedback.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1">
                      <span className="text-gray-400">•</span> {item}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
          
          {errors.password && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <span className="grayscale opacity-70">⚠️</span> {errors.password.message}
            </p>
          )}
        </div>

        {/* City Field */}
        <div>
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
            📍 City
          </label>
          <select
            {...register('city')}
            className="input-field"
          >
            <option value="">Select your city</option>
            {Object.entries(CITIES_BY_PROVINCE).map(([province, cities]) => (
              <optgroup key={province} label={province}>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {errors.city && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <span className="grayscale opacity-70">⚠️</span> {errors.city.message}
            </p>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-linear-to-r from-primary-600 to-primary-800 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating Account...
            </span>
          ) : (
            'Sign Up 🚀'
          )}
        </motion.button>
      </form>

      <p className="text-center mt-6 text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
          Login here 🚀
        </Link>
      </p>
    </motion.div>
  );
}
