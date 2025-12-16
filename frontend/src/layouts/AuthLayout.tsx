import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Horizontal Circuit Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="authCircuit" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor:'#06b6d4',stopOpacity:1}} />
            <stop offset="50%" style={{stopColor:'#2563eb',stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#7c3aed',stopOpacity:1}} />
          </linearGradient>
          <pattern id="authPattern" x="0" y="0" width="300" height="200" patternUnits="userSpaceOnUse">
            <path d="M0 30 L100 30 L120 50 L220 50" stroke="url(#authCircuit)" strokeWidth="2" fill="none"/>
            <path d="M0 70 L80 70 L100 90 L240 90" stroke="url(#authCircuit)" strokeWidth="2" fill="none"/>
            <path d="M0 110 L90 110 L110 130 L260 130" stroke="url(#authCircuit)" strokeWidth="2" fill="none"/>
            <circle cx="100" cy="30" r="4" fill="#06b6d4"/>
            <circle cx="220" cy="50" r="4" fill="none" stroke="#2563eb" strokeWidth="1.5"/>
            <circle cx="80" cy="70" r="4" fill="#7c3aed"/>
            <rect x="96" y="86" width="8" height="8" fill="none" stroke="#7c3aed" strokeWidth="1.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#authPattern)"/>
      </svg>

      <div className="w-full max-w-md relative z-10">
        {/* Logo with tagline in white pill - CTA/Promo style */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <a href="/" onClick={() => window.scrollTo(0, 0)} className="inline-block">
            <div className="inline-block hover:scale-105 transition-transform duration-200">
              <img src="/phonely-logo-with-tagline-no-bg.png" alt="Phonely - Your trusted phone marketplace" className="h-56 md:h-64 drop-shadow-2xl" />
            </div>
          </a>
        </motion.div>
        <motion.div 
          className="card backdrop-blur-xl bg-white/5 shadow-2xl border border-white/10 -mt-16"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
