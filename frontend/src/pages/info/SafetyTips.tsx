import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Eye, MessageCircle, AlertTriangle, CheckCircle, Users, Clock, ArrowRight } from 'lucide-react';
import CircuitPattern from '../../components/common/CircuitPattern';

export default function SafetyTips() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-950 to-gray-900">
      <CircuitPattern />
      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
              Stay <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Safe</span> While Trading
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Your safety is our priority. Follow these essential tips for secure transactions on Phonely.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Before Meeting */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12">
            Before <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Meeting</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {[
              {
                icon: Eye,
                title: 'Verify the AI Report',
                tips: [
                  'Review the authenticity score carefully',
                  'Check all documented damage in photos',
                  'Compare listed specs with manufacturer specs',
                  'Look for consistent lighting in photos',
                  'Note any discrepancies to ask about'
                ]
              },
              {
                icon: MessageCircle,
                title: 'Use Built-In Chat',
                tips: [
                  'Keep all communication on Phonely',
                  'Never share personal phone numbers early',
                  'Ask specific questions about condition',
                  'Request additional photos if needed',
                  'Document all agreements in chat'
                ]
              },
              {
                icon: Users,
                title: 'Check Seller Profile',
                tips: [
                  'Review their verification status',
                  'Check previous listings and ratings',
                  'Look for established account history',
                  'See how quickly they respond',
                  'Trust your instincts about behavior'
                ]
              },
              {
                icon: AlertTriangle,
                title: 'Watch for Red Flags',
                tips: [
                  'Prices significantly below market value',
                  'Pressure to complete deal quickly',
                  'Requests for payment before meeting',
                  'Reluctance to meet in public places',
                  'Unwillingness to answer questions'
                ]
              }
            ].map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
              >
                <section.icon className="w-12 h-12 text-cyan-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-6">{section.title}</h3>
                <ul className="space-y-3">
                  {section.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* During Meeting */}
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12">
            During the <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Meeting</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: MapPin,
                title: 'Meet in Public',
                description: 'Always meet in busy, well-lit public places during daylight hours. Shopping malls, coffee shops, or mobile phone stores are ideal.',
                color: 'from-cyan-500 to-blue-600'
              },
              {
                icon: Users,
                title: 'Bring Someone',
                description: 'Bring a friend or family member with you. If not possible, tell someone where you\'re going and when you\'ll be back.',
                color: 'from-purple-500 to-pink-600'
              },
              {
                icon: Clock,
                title: 'Take Your Time',
                description: 'Don\'t rush. Thoroughly inspect the phone against the AI report. Test all features before handing over any money.',
                color: 'from-green-500 to-emerald-600'
              }
            ].map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
              >
                <div className={`inline-flex p-4 rounded-xl bg-linear-to-br ${tip.color} mb-6`}>
                  <tip.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{tip.title}</h3>
                <p className="text-gray-300 leading-relaxed">{tip.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Inspection Checklist */}
          <div className="bg-linear-to-br from-cyan-950 via-blue-950 to-purple-950 rounded-3xl p-12 mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12">
              Phone <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Inspection Checklist</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                'Compare phone to AI report photos',
                'Check IMEI number matches listing',
                'Test screen touch response',
                'Check all buttons and ports',
                'Test cameras (front and back)',
                'Check speaker and microphone',
                'Verify battery health if possible',
                'Test WiFi and cellular connectivity',
                'Check for water damage indicators',
                'Ensure phone is not locked to carrier',
                'Verify it\'s not reported stolen',
                'Check if Find My iPhone/Google is off'
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <span className="text-gray-300">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Payment Safety */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12">
              Payment <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Safety</span>
            </h2>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-12">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" /> Do
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'Use cash for in-person transactions',
                      'Count cash carefully before handing it over',
                      'Get a receipt or written confirmation',
                      'Only pay after thorough inspection',
                      'Confirm payment before handing over phone'
                    ].map((item, i) => (
                      <li key={i} className="text-gray-300 flex items-start gap-2">
                        <span className="text-green-400">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" /> Don't
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'Never send payment before meeting',
                      'Don\'t accept payment promises or IOUs',
                      'Avoid accepting checks or money orders',
                      'Don\'t give phone before receiving full payment',
                      'Never share banking details unnecessarily'
                    ].map((item, i) => (
                      <li key={i} className="text-gray-300 flex items-start gap-2">
                        <span className="text-red-400">✗</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xl text-gray-300 mb-8">
                If something feels wrong at any point, trust your instincts and walk away. Your safety comes first.
              </p>
              <Link
                to="/listings"
                className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300"
              >
                Browse Safe Listings <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
