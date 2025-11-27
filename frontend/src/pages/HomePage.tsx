import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Gen Z Style */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary-600 via-primary-700 to-purple-800 text-white">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center space-y-8 animate-slide-up">
            {/* Emoji Header */}
            <div className="text-6xl md:text-8xl animate-bounce">📱</div>
            
            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              Buy & Sell Phones
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-300 to-pink-400">
                Like Never Before
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-100 max-w-2xl mx-auto font-medium">
              AI-powered authenticity checks 🤖 • Real-time chat 💬 • 
              <br className="hidden md:block" />
              Secure transactions 🔒 • Best deals in Pakistan 🇵🇰
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link 
                to="/listings" 
                className="px-8 py-4 bg-white text-primary-700 rounded-full font-bold text-lg hover:scale-105 transition-transform duration-200 shadow-2xl hover:shadow-primary-400/50 flex items-center space-x-2"
              >
                <span>🔍</span>
                <span>Browse Phones</span>
              </Link>
              <Link 
                to="/listings/create" 
                className="px-8 py-4 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-full font-bold text-lg hover:scale-105 transition-transform duration-200 shadow-2xl hover:shadow-yellow-400/50 flex items-center space-x-2"
              >
                <span>✨</span>
                <span>Sell Now</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Why Choose <span className="text-primary-600">Phonely?</span> 🚀
            </h2>
            <p className="text-xl text-gray-600">No cap, we're the best in the game fr fr</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-linear-to-br from-blue-50 to-blue-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">🤖</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Inspection</h3>
              <p className="text-gray-700">
                Our AI analyzes every phone using advanced image recognition. Get authenticity scores, condition reports, and fair price estimates instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-linear-to-br from-purple-50 to-purple-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up animation-delay-200">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">💬</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Real-time Chat</h3>
              <p className="text-gray-700">
                Connect instantly with buyers and sellers. See typing indicators, get notifications, and close deals faster than ever.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-linear-to-br from-green-50 to-green-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up animation-delay-400">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">🔒</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">100% Secure</h3>
              <p className="text-gray-700">
                Every listing is verified. Every user is authenticated. Your data is encrypted. Trade with confidence and peace of mind.
              </p>
            </div>
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
