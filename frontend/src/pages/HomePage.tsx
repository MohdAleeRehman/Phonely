import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, Shield, Zap, Users, Bot, MessageCircle, Target, TrendingUp, Eye, Star, Camera, MapPin, Search, Sparkles, ChevronDown } from 'lucide-react';
import CircuitPattern from '../components/common/CircuitPattern';
import PKRIcon from '../components/icons/PKRIcon';

export default function HomePage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  return (
    <div className="relative min-h-screen overflow-hidden">
      <CircuitPattern />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-blue-950 to-gray-900 opacity-80">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.2, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"
          />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <img src="/phonely-logo-with-tagline-no-bg.png" alt="Phonely" className="h-64 md:h-96 mx-auto" />
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight -mt-16">
              <span className="block text-white mb-4">Buy & Sell Phones</span>
              <span className="bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Like Never Before
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-6 max-w-4xl mx-auto leading-relaxed">
              Every phone analyzed by AI before it's listed. Every condition verified. Every price fair.
            </p>
            
            <p className="text-lg md:text-xl text-gray-400 mb-12 font-medium">
              No more fake listings. No more surprises.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/listings"
                className="group px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Browse Verified Phones
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/listings/create"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white rounded-full text-lg font-bold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Sell Your Phone Free
                <Sparkles className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm md:text-base text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>5,000+ phones verified by AI</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>All prices in PKR</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Zero fees, ever</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-blue-950 to-gray-900 opacity-80"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Why Buying & Selling Phones<br />
              <span className="bg-linear-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
                in Pakistan Is Broken
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Eye,
                title: '"Mint Condition" Means Nothing',
                description: 'Sellers claim perfection. You show up to scratches, dents, and a cracked back. No way to verify before you waste your time.',
                color: 'from-orange-500 to-yellow-500'
              },
              {
                icon: PKRIcon,
                title: 'Pricing Is Pure Guesswork',
                description: 'List too high? No buyers. List too low? You lose thousands. No one knows what a fair price actually is.',
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: Shield,
                title: 'Scams & Fake Listings Everywhere',
                description: 'Stolen phones. Cloned IMEIs. Sellers who vanish after taking your money. You\'re gambling every single time.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: MessageCircle,
                title: 'Endless Back-and-Forth',
                description: 'Days of "Is it available?" messages. Phone tag. Missed calls. Time wasted on people who aren\'t serious.',
                color: 'from-blue-500 to-cyan-500'
              }
            ].map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
              >
                <div className={`inline-flex p-4 rounded-xl bg-linear-to-br ${problem.color} mb-6`}>
                  <problem.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{problem.title}</h3>
                <p className="text-gray-300 leading-relaxed">{problem.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <p className="text-2xl font-bold text-white">
              We built Phonely to fix <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">every single one</span> of these problems.
            </p>
          </motion.div>
        </div>
      </section>

      {/* AI Inspector Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-950 via-purple-950 to-gray-900 opacity-80"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Meet Your <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">AI Phone Inspector</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Every phone listed on Phonely goes through our AI verification system before buyers ever see it. In 30 seconds, you know exactly what you're buying or selling.
            </p>
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 mt-8 text-cyan-400 hover:text-cyan-300 font-semibold text-lg"
            >
              See a Sample AI Report <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'Instant Authenticity Score',
                points: [
                  'Screen damage (cracks, scratches, dead pixels)',
                  'Body condition (dents, scuffs, discoloration)',
                  'Camera lens integrity',
                  'Signs of water damage',
                  'Modifications or repairs'
                ],
                color: 'from-cyan-500 to-blue-600'
              },
              {
                icon: Eye,
                title: 'Detailed Condition Report',
                points: [
                  'Component-by-component analysis',
                  'Wear and damage mapping',
                  'Battery health estimates',
                  'Photo-verified damage documentation',
                  'Builds instant credibility'
                ],
                color: 'from-purple-500 to-pink-600'
              },
              {
                icon: TrendingUp,
                title: 'Fair Market Pricing',
                points: [
                  'Phone model and storage capacity',
                  'Actual verified condition',
                  'Current market demand',
                  'Regional pricing trends',
                  'Maximum value for sellers'
                ],
                color: 'from-green-500 to-emerald-600'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
              >
                <div className={`inline-flex p-4 rounded-xl bg-linear-to-br ${feature.color} mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-6">{feature.title}</h3>
                <ul className="space-y-3">
                  {feature.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-blue-950 to-gray-900 opacity-80"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              How It <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-gray-300 mb-12">Choose your path:</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/listings"
                className="px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300"
              >
                I Want to Buy
              </Link>
              <Link
                to="/listings/create"
                className="px-8 py-4 bg-linear-to-r from-purple-500 to-pink-600 text-white rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
              >
                I Want to Sell
              </Link>
            </div>
          </motion.div>

          {/* For Buyers */}
          <div className="mb-20">
            <h3 className="text-3xl md:text-4xl font-black text-cyan-400 text-center mb-12">For Buyers</h3>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  number: '1',
                  icon: Search,
                  title: 'Search with Smart Filters',
                  description: 'Filter by brand, model, price range, condition score, and city. Find exactly what you need in seconds.'
                },
                {
                  number: '2',
                  icon: Shield,
                  title: 'Review AI-Verified Listings',
                  description: 'Every listing shows the AI authenticity score, detailed condition report, and fair price estimate.'
                },
                {
                  number: '3',
                  icon: MessageCircle,
                  title: 'Chat Directly with Sellers',
                  description: 'Connect instantly through our built-in chat. Ask questions, negotiate price, arrange meetings.'
                },
                {
                  number: '4',
                  icon: CheckCircle,
                  title: 'Meet & Complete Purchase',
                  description: 'Meet in a safe public location. Verify the phone matches the listing. Complete your transaction with confidence.'
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-xl z-20">
                    {step.number}
                  </div>
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 pt-10 h-full relative z-10">
                    <step.icon className="w-12 h-12 text-cyan-400 mb-4" />
                    <h4 className="text-xl font-bold text-white mb-3">{step.title}</h4>
                    <p className="text-gray-300">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                to="/listings"
                className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full text-lg font-bold transition-all duration-300"
              >
                Start Browsing Verified Phones <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* For Sellers */}
          <div>
            <h3 className="text-3xl md:text-4xl font-black text-purple-400 text-center mb-12">For Sellers</h3>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  number: '1',
                  icon: Camera,
                  title: 'Upload Photos',
                  time: '2 Minutes',
                  description: 'Take clear photos of your phone from all angles. Front, back, sides, screen—our AI needs to see everything.'
                },
                {
                  number: '2',
                  icon: Bot,
                  title: 'Get Instant AI Verification',
                  time: '30 Seconds',
                  description: 'Our AI analyzes your photos and generates an authenticity score, condition report, and recommended listing price.'
                },
                {
                  number: '3',
                  icon: Zap,
                  title: 'Your Listing Goes Live',
                  time: 'Immediately',
                  description: 'Your verified listing appears in search results immediately. Buyers can see your AI verification and contact you.'
                },
                {
                  number: '4',
                  icon: MessageCircle,
                  title: 'Chat with Interested Buyers',
                  time: 'Real-time',
                  description: 'Respond to questions through our built-in chat. Negotiate if needed. Arrange a safe meeting. Close the deal.'
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl font-black text-white shadow-xl z-20">
                    {step.number}
                  </div>
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 pt-10 h-full relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <step.icon className="w-12 h-12 text-purple-400" />
                      <span className="text-xs font-bold text-purple-400 bg-purple-500/20 px-3 py-1 rounded-full">
                        {step.time}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-3">{step.title}</h4>
                    <p className="text-gray-300">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                to="/listings/create"
                className="inline-flex items-center gap-2 px-8 py-4 bg-purple-500 hover:bg-purple-400 text-white rounded-full text-lg font-bold transition-all duration-300"
              >
                List Your Phone Free <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-950 via-purple-950 to-gray-900 opacity-80"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Why Phonely Is <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Different</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: 'AI-Verified Every Time',
                description: 'No listing goes live without passing through our AI verification system. Every phone is analyzed. Every condition is documented. No exceptions.'
              },
              {
                icon: MessageCircle,
                title: 'Built-In Direct Chat',
                description: 'Negotiate without sharing your phone number. See typing indicators. Get instant notifications. Close deals faster than endless SMS chains.'
              },
              {
                icon: Users,
                title: 'User Authentication',
                description: 'Every account is verified before they can list or buy. We know who\'s on our platform, so you\'re never dealing with anonymous accounts.'
              },
              {
                icon: MapPin,
                title: 'Pakistan-First Design',
                description: 'Built specifically for how Pakistanis buy and sell phones. All prices in PKR. Coverage from Karachi to Gilgit. Local payment methods accepted.'
              },
              {
                icon: Zap,
                title: 'Lightning Fast Platform',
                description: 'List your phone in under 2 minutes. Get AI verification results in 30 seconds. Start conversations immediately. No unnecessary steps.'
              },
              {
                icon: PKRIcon,
                title: 'Zero Fees, Always',
                description: 'No listing fees. No success fees. No premium features behind paywalls. Completely free to use. We make money by keeping the platform trusted and active.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 text-cyan-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-blue-950 to-gray-900 opacity-80"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Trusted by <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Thousands</span> Across Pakistan
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                name: 'Ahmed Khan',
                location: 'Karachi',
                rating: 5,
                quote: 'The AI inspection was spot-on. Bought an iPhone 14 Pro and everything matched the listing exactly—down to the minor scratch on the bottom edge that was documented in the report. Finally, a marketplace I can actually trust.'
              },
              {
                name: 'Sara Ali',
                location: 'Lahore',
                rating: 5,
                quote: 'Sold my Samsung S23 in two days at the exact price the AI recommended. Buyers didn\'t even try to lowball me because they could see the verification report. Best selling experience I\'ve had on any platform.'
              },
              {
                name: 'Hassan Raza',
                location: 'Islamabad',
                rating: 5,
                quote: 'I\'ve bought three phones and sold two on Phonely. The instant chat makes negotiations so much faster than other platforms where you\'re waiting hours for responses. This is how phone trading should work.'
              },
              {
                name: 'Fatima Malik',
                location: 'Faisalabad',
                rating: 5,
                quote: 'Listed my phone not expecting much, but the AI pricing was perfect. Got serious buyers within hours, not the usual time-wasters asking if it\'s available. The verification gave buyers confidence to actually show up.'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-500 to-purple-600 rounded-2xl opacity-20 blur"></div>
                <div className="relative bg-gray-900/90 backdrop-blur-md border border-white/20 rounded-2xl p-8 h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-bold text-lg">{testimonial.name}</p>
                        <div className="flex gap-0.5">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {testimonial.location}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed italic">"{testimonial.quote}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-950 via-purple-950 to-gray-900 opacity-80"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Frequently Asked <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: 'How does AI verification work?',
                answer: 'Our AI analyzes the photos you upload and checks for screen damage, body condition, camera integrity, water damage signs, and any modifications. It generates an authenticity score and detailed condition report in just 30 seconds.'
              },
              {
                question: 'Is Phonely really free to use?',
                answer: 'Yes! There are no listing fees, no success fees, and no hidden charges. Buyers and sellers can use the entire platform completely free. We keep the platform free to build the most trusted marketplace in Pakistan.'
              },
              {
                question: 'How do I ensure a safe transaction?',
                answer: 'Always meet in public places during daylight hours. Verify the phone matches the listing using our AI report. Check IMEI numbers. Never pay before seeing the phone. Use our built-in chat to keep all communication documented.'
              },
              {
                question: 'Can I trust the AI pricing recommendations?',
                answer: 'Our AI considers the phone model, storage capacity, verified condition, current market demand, and regional pricing trends. While it\'s a recommendation, it\'s data-driven and helps both buyers and sellers arrive at fair market value.'
              },
              {
                question: 'What if the phone doesn\'t match the listing?',
                answer: 'The AI report documents the phone\'s condition at the time of listing. If there are discrepancies, you can walk away from the deal. We recommend thoroughly inspecting the phone against the report before completing any transaction.'
              },
              {
                question: 'How quickly can I sell my phone?',
                answer: 'You can create a listing in under 2 minutes. AI verification takes 30 seconds. Your listing goes live immediately after. Many sellers report getting serious inquiries within hours and closing deals within days.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full p-8 flex items-center justify-between text-left hover:bg-white/5 transition-all duration-300"
                >
                  <h3 className="text-xl font-bold text-white flex items-start gap-3 flex-1">
                    <span className="text-cyan-400 shrink-0">Q:</span>
                    <span>{faq.question}</span>
                  </h3>
                  <motion.div
                    animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-6 h-6 text-cyan-400 shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-gray-300 leading-relaxed px-8 pb-8 pl-16">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-cyan-950 via-blue-950 to-purple-950 opacity-80"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Ready to Buy or Sell <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Smarter?</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-4">
              Join thousands using Pakistan's first AI-verified phone marketplace.
            </p>
            <p className="text-lg text-gray-400 mb-12">
              No fees. No middlemen. Just verified deals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/listings"
                className="group px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Browse Verified Phones
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/listings/create"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white rounded-full text-lg font-bold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                List Your Phone Free
                <Sparkles className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
