import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Users, MessageCircle, AlertTriangle, CheckCircle, ThumbsUp, ThumbsDown, ArrowRight } from 'lucide-react';
import CircuitPattern from '../components/common/CircuitPattern';

export default function CommunityGuidelines() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-950 to-gray-900">
      <CircuitPattern />
      
      {/* Hero Section */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
              Community <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Guidelines</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Phonely thrives on trust, respect, and transparency. These guidelines help us maintain a safe, welcoming marketplace for everyone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-12 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12">
            Our Core <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Principles</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: Shield,
                title: 'Honesty First',
                description: 'Always represent your phone accurately. Use AI verification to build trust. No fake listings, no hidden damage.',
                color: 'from-cyan-500 to-blue-600'
              },
              {
                icon: Users,
                title: 'Respect Everyone',
                description: 'Treat all users with courtesy. No harassment, discrimination, or abusive language. Professional communication only.',
                color: 'from-purple-500 to-pink-600'
              },
              {
                icon: MessageCircle,
                title: 'Communicate Clearly',
                description: 'Respond promptly. Be transparent about condition, pricing, and availability. Keep all communication on platform.',
                color: 'from-green-500 to-emerald-600'
              }
            ].map((principle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center"
              >
                <div className={`inline-flex p-4 rounded-xl bg-linear-to-br ${principle.color} mb-6`}>
                  <principle.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{principle.title}</h3>
                <p className="text-gray-300 leading-relaxed">{principle.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Do's and Don'ts */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-green-500/10 border-2 border-green-400/30 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <ThumbsUp className="w-8 h-8 text-green-400" />
                <h3 className="text-3xl font-black text-white">Do</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Upload clear, accurate photos of your phone',
                  'Use the AI verification system for every listing',
                  'Price fairly based on AI recommendations',
                  'Respond to messages within 24 hours',
                  'Meet in safe, public places',
                  'Verify phone condition before payment',
                  'Report suspicious activity immediately',
                  'Be honest about phone history and repairs',
                  'Update listing if phone is sold',
                  'Leave honest feedback after transactions'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-red-500/10 border-2 border-red-400/30 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <ThumbsDown className="w-8 h-8 text-red-400" />
                <h3 className="text-3xl font-black text-white">Don't</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'List stolen or illegally obtained phones',
                  'Misrepresent phone condition or specifications',
                  'Use stock photos instead of actual phone photos',
                  'Engage in price manipulation or fake bidding',
                  'Share personal contact info in public listings',
                  'Harass other users or send spam messages',
                  'Create multiple accounts to manipulate reviews',
                  'Demand payment before meeting in person',
                  'Leave negative reviews for unfair reasons',
                  'Ignore or abuse the AI verification system'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Prohibited Items */}
          <div className="bg-linear-to-br from-red-950 via-orange-950 to-red-950 rounded-3xl p-12 mb-20">
            <h2 className="text-4xl font-black text-white text-center mb-12">
              <span className="bg-linear-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">Strictly Prohibited</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'Stolen phones or phones with blacklisted IMEI numbers',
                'Phones locked to carriers without disclosure',
                'Non-functional phones listed as working',
                'Counterfeit or cloned devices',
                'Phones with iCloud/Google lock active',
                'Illegal modifications or jailbroken devices without disclosure'
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-3 bg-red-500/20 border border-red-400/30 rounded-xl p-4"
                >
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-gray-300">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Enforcement */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12">
              Enforcement & <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Consequences</span>
            </h2>
            <div className="space-y-6 mb-12">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-4">First Violation</h3>
                <p className="text-gray-300 leading-relaxed">
                  Warning issued with explanation. Account temporarily suspended for 7 days for serious violations.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Second Violation</h3>
                <p className="text-gray-300 leading-relaxed">
                  30-day suspension. All active listings removed. Restricted access to certain features upon return.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Third Violation or Severe Cases</h3>
                <p className="text-gray-300 leading-relaxed">
                  Permanent ban. All listings removed. Legal action may be pursued for illegal activity.
                </p>
              </div>
            </div>

            <div className="bg-blue-500/20 border border-blue-400/30 rounded-2xl p-8 mb-12">
              <h3 className="text-2xl font-bold text-white mb-4">Reporting Violations</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                If you see a user or listing violating these guidelines, please report it immediately. We review all reports within 24 hours.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span> Use the "Report" button on any listing or user profile
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span> Email us at support@phonely.com.pk with details
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span> All reports are confidential and taken seriously
                </li>
              </ul>
            </div>

            <div className="text-center">
              <p className="text-xl text-gray-300 mb-8">
                By using Phonely, you agree to follow these Community Guidelines and help us build Pakistan's most trusted phone marketplace.
              </p>
              <Link
                to="/listings"
                className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300"
              >
                Browse Verified Listings <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
