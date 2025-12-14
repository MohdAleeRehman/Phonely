import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

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
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 10000);

      // Clear location state to prevent message showing on refresh
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
            <div className="bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl p-6 border-2 border-green-400">
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
              <div className="flex items-start gap-4">
                <div className="text-4xl">✅</div>
                <div className="flex-1">
                  <h3 className="text-xl font-black mb-2">Listing Submitted Successfully!</h3>
                  <p className="text-green-50 leading-relaxed">
                    <span className="font-semibold">{listingTitle}</span> has been received! 
                    Our AI is currently analyzing your phone's condition, authenticity, and market pricing. 
                    This usually takes <span className="font-semibold">1-2 minutes</span>.
                  </p>
                  <p className="text-green-50 mt-2">
                    📧 You'll receive an email once your ad is <span className="font-bold">approved and live</span>. 
                    Check your inbox shortly!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - #F2F2F2 (Section 1) */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#F2F2F2' }}>
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center space-y-6 animate-slide-up">
            {/* Logo with tagline - clean on light background */}
            <div className="flex justify-center">
              <img src="/phonely-logo-with-tagline-no-bg.png" alt="Phonely - Your trusted phone marketplace" className="h-56 md:h-64" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black leading-tight text-gray-900 -mt-16">
              Buy & Sell Phones
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-purple-700">
                Like Never Before
              </span>
            </h1>
            
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-lg md:text-xl text-gray-700 font-medium">
                <span>🤖</span>
                <span>AI-powered authenticity checks</span>
              </div>
              <div className="flex items-center gap-2 text-lg md:text-xl text-gray-700 font-medium">
                <span>💬</span>
                <span>Real-time chat</span>
              </div>
              <div className="flex items-center gap-2 text-lg md:text-xl text-gray-700 font-medium">
                <span>🔒</span>
                <span>Secure transactions</span>
              </div>
              <div className="flex items-center gap-2 text-lg md:text-xl text-gray-700 font-medium">
                <span>🇵🇰</span>
                <span>Best deals in Pakistan</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link 
                to="/listings" 
                className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-bold text-lg hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center space-x-2"
              >
                <span>🔍</span>
                <span>Browse Phones</span>
              </Link>
              <Link 
                to="/listings/create" 
                className="px-8 py-4 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-full font-bold text-lg hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center space-x-2"
              >
                <span>✨</span>
                <span>Sell Now</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* What Makes Us Different Section - Gradient (Section 2) */}
      <section className="py-16 bg-linear-to-r from-primary-600 via-purple-700 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center space-y-3"
            >
              <span className="text-5xl">🎯</span>
              <span className="text-xl font-bold text-white">No Middleman Fees</span>
              <p className="text-sm text-gray-100">Direct buyer-seller connection</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="flex flex-col items-center space-y-3"
            >
              <span className="text-5xl">📊</span>
              <span className="text-xl font-bold text-white">Price Transparency</span>
              <p className="text-sm text-gray-100">AI-powered fair pricing</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col items-center space-y-3"
            >
              <span className="text-5xl">🔍</span>
              <span className="text-xl font-bold text-white">Smart Search Filters</span>
              <p className="text-sm text-gray-100">Find exactly what you need</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="flex flex-col items-center space-y-3"
            >
              <span className="text-5xl">🆓</span>
              <span className="text-xl font-bold text-white">Free to Use</span>
              <p className="text-sm text-gray-100">No listing fees, no hidden charges</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - #F2F2F2 (Section 3) */}
      <section className="py-20" style={{ backgroundColor: '#F2F2F2' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Why Choose <span className="text-primary-600">Phonely?</span> 🚀
            </h2>
            <p className="text-xl text-gray-600">No cap, we're the best in the game fr fr</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="group p-8 rounded-2xl bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">🤖</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Inspection</h3>
              <p className="text-gray-700 leading-relaxed">
                Our AI analyzes every phone using advanced image recognition. Get authenticity scores, condition reports, and fair price estimates instantly. No more fake listings!
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="group p-8 rounded-2xl bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">💬</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Real-time Chat</h3>
              <p className="text-gray-700 leading-relaxed">
                Connect instantly with buyers and sellers. See typing indicators, get notifications, and close deals faster than ever. It's like WhatsApp, but for phones!
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="group p-8 rounded-2xl bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">🔒</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">100% Secure</h3>
              <p className="text-gray-700 leading-relaxed">
                Every listing is verified. Every user is authenticated. Your data is encrypted. Trade with confidence and peace of mind. We got your back!
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="group p-8 rounded-2xl bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">💰</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Best Prices</h3>
              <p className="text-gray-700 leading-relaxed">
                AI-powered pricing algorithm ensures you get the fairest deal. Whether buying or selling, you'll always get maximum value for your money.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="group p-8 rounded-2xl bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">⚡</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-700 leading-relaxed">
                List your phone in under 2 minutes. Get AI inspection results in 30 seconds. Start chatting with buyers instantly. Speed is our middle name!
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="group p-8 rounded-2xl bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">🇵🇰</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Local & Trusted</h3>
              <p className="text-gray-700 leading-relaxed">
                Built specifically for Pakistan. All prices in PKR. Cities from Karachi to Gilgit. Local payment methods. We understand the Pakistani market!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Gradient (Section 4) */}
      <section className="py-20 bg-linear-to-r from-primary-600 via-purple-700 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              How It <span className="text-yellow-300">Works</span> 🎯
            </h2>
            <p className="text-xl text-gray-100">Super simple, even your grandma can do it!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="relative text-center"
            >
              <div className="w-20 h-20 mx-auto bg-linear-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-2">📸 Upload Photos</h3>
              <p className="text-gray-100">Take clear photos of your phone from all angles. Our AI will analyze them!</p>
              {/* Arrow */}
              <div className="hidden md:block absolute top-10 -right-4 text-4xl text-primary-300">→</div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="relative text-center"
            >
              <div className="w-20 h-20 mx-auto bg-linear-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-2">🤖 AI Inspection</h3>
              <p className="text-gray-100">Get instant authenticity check, condition score, and fair price estimate!</p>
              {/* Arrow */}
              <div className="hidden md:block absolute top-10 -right-4 text-4xl text-purple-300">→</div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="relative text-center"
            >
              <div className="w-20 h-20 mx-auto bg-linear-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-2">💬 Start Chatting</h3>
              <p className="text-gray-100">Connect with buyers instantly. Negotiate, answer questions, close deals!</p>
              {/* Arrow */}
              <div className="hidden md:block absolute top-10 -right-4 text-4xl text-green-300">→</div>
            </motion.div>

            {/* Step 4 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto bg-linear-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg">
                4
              </div>
              <h3 className="text-xl font-bold text-white mb-2">💰 Get Paid</h3>
              <p className="text-gray-100">Meet safely, verify the buyer, hand over phone, and get paid. Easy money!</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - #F2F2F2 (Section 5) */}
      <section className="py-20" style={{ backgroundColor: '#F2F2F2' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              What People Are <span className="text-primary-600">Saying</span> 💬
            </h2>
            <p className="text-xl text-gray-600">Real reviews from real users (no cap!)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  A
                </div>
                <div className="ml-4">
                  <div className="font-bold text-gray-900">Ahmed Khan</div>
                  <div className="text-sm text-gray-500">Karachi • Buyer</div>
                </div>
              </div>
              <div className="text-yellow-400 text-2xl mb-2">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-700 italic">
                "Bought an iPhone 14 and the AI inspection was spot on! No surprises. The seller was legit. Best experience ever! 🔥"
              </p>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  S
                </div>
                <div className="ml-4">
                  <div className="font-bold text-gray-900">Sara Ali</div>
                  <div className="text-sm text-gray-500">Lahore • Seller</div>
                </div>
              </div>
              <div className="text-yellow-400 text-2xl mb-2">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-700 italic">
                "Sold my Samsung S23 in just 2 days! The AI pricing was perfect and buyers trusted the listing immediately. Love it! 💯"
              </p>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  H
                </div>
                <div className="ml-4">
                  <div className="font-bold text-gray-900">Hassan Raza</div>
                  <div className="text-sm text-gray-500">Islamabad • Both</div>
                </div>
              </div>
              <div className="text-yellow-400 text-2xl mb-2">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-700 italic">
                "I've bought 3 phones and sold 2 on Phonely. The chat feature is insane - so fast! This is the future of phone trading! 🚀"
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-primary-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-black">
            Ready to Level Up? 🎯
          </h2>
          <p className="text-xl md:text-2xl text-gray-100">
            Join thousands of happy users buying and selling phones daily!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link 
              to="/register" 
              className="px-8 py-4 bg-white text-primary-700 rounded-full font-bold text-lg hover:scale-105 transition-transform duration-200 shadow-2xl flex items-center justify-center space-x-2"
            >
              <span>🚀</span>
              <span>Get Started Free</span>
            </Link>
            <Link 
              to="/listings" 
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:scale-105 transition-transform duration-200 hover:bg-white hover:text-primary-700 flex items-center justify-center space-x-2"
            >
              <span>👀</span>
              <span>Browse Listings</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
