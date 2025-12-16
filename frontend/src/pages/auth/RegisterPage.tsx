import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, MapPin, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { calculatePasswordStrength, getPasswordStrengthColor, getPasswordStrengthTextColor } from '../../utils/passwordStrength';
import type { AuthResponse } from '../../types';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^\+92\d{10}$/, 'Phone must be in format +92XXXXXXXXXX (13 characters)')
    .length(13, 'Phone must be exactly 13 characters (+92 followed by 10 digits)'),
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
          <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Join Phonely</span>
        </h2>
        <p className="text-gray-300 mt-2">Create your account and start selling</p>
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg mb-4 flex items-center gap-2 backdrop-blur-sm"
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
            <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-1">
              <User className="w-4 h-4 text-cyan-400" /> Full Name
            </label>
          <input
            {...register('name')}
            className="input-field"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.name.message}
            </p>
          )}
        </div>

        {/* Email Field */}
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

        {/* Phone Field */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-1">
            <Phone className="w-4 h-4 text-cyan-400" /> Phone (with country code)
          </label>
          <input
            {...register('phone')}
            className="input-field"
            placeholder="+923001234567"
            maxLength={13}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.phone.message}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">Format: +92 followed by 10 digits</p>
        </div>

        {/* Password Field with Strength Indicator */}
        <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-1">
              <Lock className="w-4 h-4 text-cyan-400" /> Password
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
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
                <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
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
                <ul className="text-xs text-gray-300 space-y-0.5 ml-1">
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
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.password.message}
            </p>
          )}
        </div>

        {/* City Field */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-1">
            <MapPin className="w-4 h-4 text-cyan-400" /> City
          </label>
          <select
            {...register('city')}
            className="input-field appearance-none bg-white/5"
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
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.city.message}
            </p>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-linear-to-r from-cyan-500 to-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-xl hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" /> Sign Up
            </span>
          )}
        </motion.button>
      </form>

      <p className="text-center mt-6 text-gray-300">
        Already have an account?{' '}
        <Link to="/login" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
          Login here
        </Link>
      </p>
    </motion.div>
  );
}
