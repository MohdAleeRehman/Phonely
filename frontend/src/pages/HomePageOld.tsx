import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  CheckCircle2, 
  TrendingUp, 
  Shield, 
  Zap, 
  MessageSquare,
  MapPin,
  Camera,
  Bot,
  Rocket,
  Eye,
  Star,
  Target,
  Filter,
  Gift
} from 'lucide-react';
import PKRIcon from '../components/icons/PKRIcon';

export default function HomePage() {
  const location = useLocation();
  const [showSuccessMessage, setShowSuccessMessage] = useState(
    location.state?.message === 'listing_submitted'
  );
  const [listingTitle] = useState(
    location.state?.listingTitle || 'Your phone'
  );

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 10000);

      window.history.replaceState({}, document.title);

      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  return (
    <div className="min-h-screen">
      {/* Success Message Banner */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
            <div className="bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl p-6 border-2 border-green-400/50 backdrop-blur-md">
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold transition-colors"
              >
                ×
              </button>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-10 h-10 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Listing Submitted Successfully!</h3>
                  <p className="text-green-50 leading-relaxed text-sm">
                    <span className="font-semibold">{listingTitle}</span> has been received! 
                    Our AI is currently analyzing your phone's condition, authenticity, and market pricing. 
                    This usually takes <span className="font-semibold">1-2 minutes</span>.
                  </p>
                  <p className="text-green-50 mt-2 flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4" />
                    You'll receive an email once your ad is <span className="font-bold">approved and live</span>!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section with Horizontal Circuit Pattern */}
      <section className="relative overflow-hidden bg-linear-to-br from-gray-900 via-blue-950 to-gray-900">
        {/* Horizontal Circuit Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="heroCircuit" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor:'#06b6d4',stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'#2563eb',stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#7c3aed',stopOpacity:1}} />
            </linearGradient>
            <pattern id="heroPattern" x="0" y="0" width="300" height="200" patternUnits="userSpaceOnUse">
              <path d="M0 30 L100 30 L120 50 L220 50" stroke="url(#heroCircuit)" strokeWidth="2" fill="none"/>
              <path d="M0 70 L80 70 L100 90 L240 90" stroke="url(#heroCircuit)" strokeWidth="2" fill="none"/>
              <path d="M0 110 L90 110 L110 130 L260 130" stroke="url(#heroCircuit)" strokeWidth="2" fill="none"/>
              <path d="M0 150 L70 150 L90 170 L230 170" stroke="url(#heroCircuit)" strokeWidth="2" fill="none"/>
              <line x1="100" y1="30" x2="120" y2="50" stroke="#7c3aed" strokeWidth="1" strokeDasharray="3,3" opacity="0.5"/>
              <circle cx="100" cy="30" r="4" fill="#06b6d4"/>
              <circle cx="220" cy="50" r="4" fill="none" stroke="#2563eb" strokeWidth="1.5"/>
              <circle cx="80" cy="70" r="4" fill="#7c3aed"/>
              <circle cx="90" cy="110" r="4" fill="none" stroke="#ec4899" strokeWidth="1.5"/>
              <rect x="96" y="86" width="8" height="8" fill="none" stroke="#7c3aed" strokeWidth="1.5"/>
              <rect x="106" y="126" width="8" height="8" fill="#ec4899" opacity="0.7"/>
              <path d="M180 60 L190 60 M185 55 L185 65" stroke="#2563eb" strokeWidth="1.5" opacity="0.4"/>
              <circle cx="150" cy="110" r="1.5" fill="#7c3aed" opacity="0.6"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroPattern)"/>
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center space-y-8">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <img 
                src="/phonely-logo-with-tagline-no-bg.png" 
                alt="Phonely" 
                className="h-48 md:h-64 drop-shadow-2xl" 
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-7xl font-black leading-tight text-white mb-6">
                Buy & Sell Phones
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600">
                  Like Never Before
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-4">
                Every phone analyzed by AI before it's listed. Every condition verified. Every price fair.
              </p>
              <p className="text-lg text-gray-400 font-medium">
                No more fake listings. No more surprises.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-4xl mx-auto"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <span className="text-sm md:text-base text-gray-200 font-medium">5,000+ phones verified by AI</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <PKRIcon className="w-5 h-5 text-blue-400" />
                <span className="text-sm md:text-base text-gray-200 font-medium">All prices in PKR</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Gift className="w-5 h-5 text-purple-400" />
                <span className="text-sm md:text-base text-gray-200 font-medium">Zero fees, ever</span>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <Link 
                to="/listings" 
                className="group px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center space-x-2"
              >
                <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Browse Verified Phones</span>
              </Link>
              <Link 
                to="/listings/create" 
                className="group px-8 py-4 bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white rounded-full font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center space-x-2"
              >
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Sell Your Phone Free</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different - Vertical Circuit Pattern */}
      <section className="relative py-20 bg-linear-to-br from-gray-900 via-blue-950 to-gray-900">
        {/* Vertical Circuit Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="diffGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor:'#06b6d4',stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'#2563eb',stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#7c3aed',stopOpacity:1}} />
            </linearGradient>
            <pattern id="vertPattern1" x="0" y="0" width="200" height="300" patternUnits="userSpaceOnUse">
              <path d="M40 0 L40 100 L60 120 L60 250" stroke="url(#diffGrad)" strokeWidth="2" fill="none"/>
              <path d="M100 0 L100 80 L120 100 L120 220" stroke="url(#diffGrad)" strokeWidth="2" fill="none"/>
              <path d="M160 0 L160 120 L140 140 L140 280" stroke="url(#diffGrad)" strokeWidth="2" fill="none"/>
              <circle cx="40" cy="100" r="4" fill="#06b6d4"/>
              <circle cx="60" cy="120" r="4" fill="none" stroke="#2563eb" strokeWidth="1.5"/>
              <circle cx="100" cy="80" r="4" fill="#7c3aed"/>
              <circle cx="160" cy="120" r="4" fill="#ec4899"/>
              <rect x="56" y="116" width="8" height="8" fill="none" stroke="#7c3aed" strokeWidth="1.5"/>
              <rect x="136" y="96" width="8" height="8" fill="#ec4899" opacity="0.7"/>
              <path d="M80 200 L90 200 M85 195 L85 205" stroke="#2563eb" strokeWidth="1.5" opacity="0.4"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#vertPattern1)"/>
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all hover:scale-105"
            >
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <span className="text-lg font-bold text-white text-center">No Middleman Fees</span>
              <p className="text-sm text-gray-300 text-center">Direct buyer-seller connection</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all hover:scale-105"
            >
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <span className="text-lg font-bold text-white text-center">Price Transparency</span>
              <p className="text-sm text-gray-300 text-center">AI-powered fair pricing</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all hover:scale-105"
            >
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Filter className="w-8 h-8 text-white" />
              </div>
              <span className="text-lg font-bold text-white text-center">Smart Search</span>
              <p className="text-sm text-gray-300 text-center">Find exactly what you need</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all hover:scale-105"
            >
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-pink-500 to-red-600 flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <span className="text-lg font-bold text-white text-center">Free to Use</span>
              <p className="text-sm text-gray-300 text-center">No listing fees, no charges</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Horizontal Circuit Pattern */}
      <section className="relative py-20 bg-linear-to-br from-gray-900 via-blue-950 to-gray-900">
        {/* Horizontal Circuit Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="featGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor:'#2563eb',stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'#7c3aed',stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#ec4899',stopOpacity:1}} />
            </linearGradient>
            <pattern id="horizPattern2" x="0" y="0" width="300" height="200" patternUnits="userSpaceOnUse">
              <path d="M0 40 L80 40 L100 60 L220 60" stroke="url(#featGrad)" strokeWidth="2" fill="none"/>
              <path d="M0 80 L60 80 L80 100 L200 100" stroke="url(#featGrad)" strokeWidth="2" fill="none"/>
              <path d="M0 120 L100 120 L120 140 L260 140" stroke="url(#featGrad)" strokeWidth="2" fill="none"/>
              <circle cx="80" cy="40" r="4" fill="#2563eb"/>
              <circle cx="220" cy="60" r="4" fill="none" stroke="#7c3aed" strokeWidth="1.5"/>
              <circle cx="100" cy="120" r="4" fill="#ec4899"/>
              <rect x="76" y="96" width="8" height="8" fill="#7c3aed" opacity="0.7"/>
              <path d="M180 80 L190 80 M185 75 L185 85" stroke="#2563eb" strokeWidth="1.5" opacity="0.4"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#horizPattern2)"/>
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Why Choose <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-600">Phonely?</span>
            </h2>
            <p className="text-xl text-gray-300">The smartest way to buy and sell phones in Pakistan</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="group p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-16 h-16 mb-4 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">AI Inspection</h3>
              <p className="text-gray-300 leading-relaxed">
                Our AI analyzes every phone using advanced image recognition. Get authenticity scores, condition reports, and fair price estimates instantly. No more fake listings!
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="group p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-16 h-16 mb-4 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Real-time Chat</h3>
              <p className="text-gray-300 leading-relaxed">
                Connect instantly with buyers and sellers. See typing indicators, get notifications, and close deals faster than ever. It's seamless communication!
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="group p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-16 h-16 mb-4 rounded-2xl bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">100% Secure</h3>
              <p className="text-gray-300 leading-relaxed">
                Every listing is verified. Every user is authenticated. Your data is encrypted. Trade with confidence and peace of mind. We got your back!
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="group p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-16 h-16 mb-4 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PKRIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Best Prices</h3>
              <p className="text-gray-300 leading-relaxed">
                AI-powered pricing algorithm ensures you get the fairest deal. Whether buying or selling, you'll always get maximum value for your money.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="group p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-16 h-16 mb-4 rounded-2xl bg-linear-to-br from-yellow-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-300 leading-relaxed">
                List your phone in under 2 minutes. Get AI inspection results in 30 seconds. Start chatting with buyers instantly. Speed is our priority!
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="group p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-16 h-16 mb-4 rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Local & Trusted</h3>
              <p className="text-gray-300 leading-relaxed">
                Built specifically for Pakistan. All prices in PKR. Cities from Karachi to Gilgit. Local payment methods. We understand the Pakistani market!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works - Vertical Circuit Pattern */}
      <section className="relative py-20 bg-linear-to-br from-gray-900 via-blue-950 to-gray-900">
        {/* Vertical Circuit Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="howGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor:'#2563eb',stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'#7c3aed',stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#ec4899',stopOpacity:1}} />
            </linearGradient>
            <pattern id="vertPattern3" x="0" y="0" width="220" height="300" patternUnits="userSpaceOnUse">
              <path d="M50 0 L50 110 L70 130 L70 260" stroke="url(#howGrad)" strokeWidth="2" fill="none"/>
              <path d="M110 0 L110 90 L130 110 L130 240" stroke="url(#howGrad)" strokeWidth="2" fill="none"/>
              <path d="M170 0 L170 130 L150 150 L150 290" stroke="url(#howGrad)" strokeWidth="2" fill="none"/>
              <circle cx="50" cy="110" r="4" fill="#2563eb"/>
              <circle cx="110" cy="90" r="4" fill="#ec4899"/>
              <rect x="126" y="106" width="8" height="8" fill="#7c3aed" opacity="0.7"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#vertPattern3)"/>
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              How It <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-600">Works</span>
            </h2>
            <p className="text-xl text-gray-300">Super simple, in just 4 easy steps!</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative text-center"
            >
              <div className="w-20 h-20 mx-auto bg-linear-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-black mb-4 shadow-xl">
                1
              </div>
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-linear-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Upload Photos</h3>
                <p className="text-gray-300 text-sm">Take clear photos from all angles. Our AI will analyze them!</p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative text-center"
            >
              <div className="w-20 h-20 mx-auto bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-black mb-4 shadow-xl">
                2
              </div>
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-linear-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI Inspection</h3>
                <p className="text-gray-300 text-sm">Get instant authenticity check and fair price estimate!</p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="relative text-center"
            >
              <div className="w-20 h-20 mx-auto bg-linear-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl font-black mb-4 shadow-xl">
                3
              </div>
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-linear-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Start Chatting</h3>
                <p className="text-gray-300 text-sm">Connect with buyers. Negotiate and close deals!</p>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto bg-linear-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center text-white text-3xl font-black mb-4 shadow-xl">
                4
              </div>
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-linear-to-br from-pink-500/20 to-red-600/20 flex items-center justify-center">
                  <PKRIcon className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Get Paid</h3>
                <p className="text-gray-300 text-sm">Meet safely, verify, hand over phone, and get paid!</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials - Horizontal Circuit Pattern */}
      <section className="relative py-20 bg-linear-to-br from-gray-900 via-blue-950 to-gray-900">
        {/* Horizontal Circuit Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="testGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor:'#06b6d4',stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'#7c3aed',stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#ec4899',stopOpacity:1}} />
            </linearGradient>
            <pattern id="horizPattern4" x="0" y="0" width="280" height="180" patternUnits="userSpaceOnUse">
              <path d="M0 45 L90 45 L110 65 L240 65" stroke="url(#testGrad)" strokeWidth="2" fill="none"/>
              <path d="M0 90 L70 90 L90 110 L220 110" stroke="url(#testGrad)" strokeWidth="2" fill="none"/>
              <circle cx="90" cy="45" r="4" fill="#06b6d4"/>
              <circle cx="70" cy="90" r="4" fill="#7c3aed"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#horizPattern4)"/>
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              What People Are <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-600">Saying</span>
            </h2>
            <p className="text-xl text-gray-300">Real reviews from real users</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-2"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  A
                </div>
                <div className="ml-4">
                  <div className="font-bold text-white">Ahmed Khan</div>
                  <div className="text-sm text-gray-400">Karachi • Buyer</div>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 italic leading-relaxed">
                "Bought an iPhone 14 and the AI inspection was spot on! No surprises. The seller was legit. Best experience ever!"
              </p>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-2"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  S
                </div>
                <div className="ml-4">
                  <div className="font-bold text-white">Sara Ali</div>
                  <div className="text-sm text-gray-400">Lahore • Seller</div>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 italic leading-relaxed">
                "Sold my Samsung S23 in just 2 days! The AI pricing was perfect and buyers trusted the listing immediately. Love it!"
              </p>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-2"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  H
                </div>
                <div className="ml-4">
                  <div className="font-bold text-white">Hassan Raza</div>
                  <div className="text-sm text-gray-400">Islamabad • Both</div>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 italic leading-relaxed">
                "I've bought 3 phones and sold 2 on Phonely. The chat feature is insane - so fast! This is the future of phone trading!"
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - Vertical Circuit Pattern */}
      <section className="relative py-20 bg-linear-to-br from-gray-900 via-blue-950 to-gray-900">
        {/* Vertical Circuit Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ctaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor:'#06b6d4',stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'#2563eb',stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#7c3aed',stopOpacity:1}} />
            </linearGradient>
            <pattern id="vertPattern5" x="0" y="0" width="180" height="250" patternUnits="userSpaceOnUse">
              <path d="M40 0 L40 80 L60 100 L60 200" stroke="url(#ctaGrad)" strokeWidth="2" fill="none"/>
              <path d="M90 0 L90 60 L110 80 L110 180" stroke="url(#ctaGrad)" strokeWidth="2" fill="none"/>
              <path d="M140 0 L140 100 L120 120 L120 220" stroke="url(#ctaGrad)" strokeWidth="2" fill="none"/>
              <circle cx="40" cy="80" r="4" fill="#06b6d4"/>
              <circle cx="90" cy="60" r="4" fill="#2563eb"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#vertPattern5)"/>
        </svg>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Join thousands of happy users buying and selling phones daily!
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Link 
              to="/register" 
              className="group px-8 py-4 bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white rounded-full font-bold text-lg transition-all duration-300 shadow-2xl hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Get Started Free</span>
            </Link>
            <Link 
              to="/listings" 
              className="group px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/20 text-white rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Browse Listings</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
