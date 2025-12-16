import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, Target, CheckCircle, Eye, Award, ArrowRight, AlertCircle } from 'lucide-react';
import CircuitPattern from '../../components/common/CircuitPattern';

export default function PricingGuide() {
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
              Phone <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Pricing Guide</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Learn how to price your phone fairly and understand what affects phone values in Pakistan's market.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How Our AI Prices Phones */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12">
            How Our AI <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Determines Price</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-8 mb-20">
            {[
              {
                icon: Target,
                title: 'Model & Specs',
                description: 'Brand, model, storage capacity, and original release price form the baseline value.',
                color: 'from-cyan-500 to-blue-600'
              },
              {
                icon: Eye,
                title: 'Verified Condition',
                description: 'AI inspection score directly impacts price. Better condition = higher value.',
                color: 'from-purple-500 to-pink-600'
              },
              {
                icon: TrendingUp,
                title: 'Market Demand',
                description: 'Current demand in Pakistan, popular models command premium prices.',
                color: 'from-green-500 to-emerald-600'
              },
              {
                icon: Award,
                title: 'Regional Data',
                description: 'City-specific pricing trends and local market conditions.',
                color: 'from-orange-500 to-red-600'
              }
            ].map((factor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center"
              >
                <div className={`inline-flex p-4 rounded-xl bg-linear-to-br ${factor.color} mb-6`}>
                  <factor.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{factor.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{factor.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Condition Impact */}
          <div className="bg-linear-to-br from-cyan-950 via-blue-950 to-purple-950 rounded-3xl p-12 mb-20">
            <h2 className="text-4xl font-black text-white text-center mb-12">
              How Condition <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Affects Price</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  condition: 'Excellent (85-100)',
                  percentage: '90-100%',
                  features: [
                    'No visible scratches or wear',
                    'Screen is perfect',
                    'All original parts',
                    'Battery health 90%+',
                    'Box and accessories included'
                  ],
                  color: 'text-green-400'
                },
                {
                  condition: 'Good (70-84)',
                  percentage: '70-90%',
                  features: [
                    'Minor scratches only',
                    'Screen has light wear',
                    'Fully functional',
                    'Battery health 80%+',
                    'May lack original box'
                  ],
                  color: 'text-cyan-400'
                },
                {
                  condition: 'Fair (Below 70)',
                  percentage: '50-70%',
                  features: [
                    'Noticeable scratches/dents',
                    'Screen may have marks',
                    'Some wear on body',
                    'Battery health below 80%',
                    'Missing accessories'
                  ],
                  color: 'text-yellow-400'
                }
              ].map((tier, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
                >
                  <h3 className={`text-2xl font-black ${tier.color} mb-2`}>{tier.condition}</h3>
                  <div className="text-3xl font-black text-white mb-6">{tier.percentage}</div>
                  <p className="text-sm text-gray-400 mb-4">of original retail price</p>
                  <ul className="space-y-2">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pricing Tips */}
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12">
            Smart Pricing <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Tips</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {[
              {
                icon: CheckCircle,
                title: 'For Sellers',
                tips: [
                  'Trust the AI recommendation - it\'s data-driven',
                  'List slightly below market if you need quick sale',
                  'Add "negotiable" to attract more buyers',
                  'Include all accessories to justify higher price',
                  'Be honest about condition - buyers will check',
                  'Update price if no interest after 1 week',
                  'Peak selling times: weekends and evenings'
                ],
                color: 'border-cyan-400/30'
              },
              {
                icon: Target,
                title: 'For Buyers',
                tips: [
                  'AI score 85+ is worth paying near asking price',
                  'Negotiate 5-10% down on lower scores',
                  'Factor in travel distance for meeting',
                  'Missing box/accessories = 5-10% discount',
                  'Check recent sold listings for comparison',
                  'Consider seller urgency (just listed vs old)',
                  'Don\'t lowball excessively - sellers will ignore'
                ],
                color: 'border-purple-400/30'
              }
            ].map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white/5 backdrop-blur-md border-2 ${section.color} rounded-2xl p-8`}
              >
                <section.icon className="w-12 h-12 text-cyan-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-6">{section.title}</h3>
                <ul className="space-y-3">
                  {section.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <ArrowRight className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Common Mistakes */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 mb-20">
            <h2 className="text-4xl font-black text-white text-center mb-12">
              <span className="bg-linear-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">Common Pricing Mistakes</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  mistake: 'Overpricing Based on Purchase Price',
                  reality: 'Phones depreciate 20-30% in first year. Your purchase price doesn\'t set market value.'
                },
                {
                  mistake: 'Ignoring AI Verification Score',
                  reality: 'Buyers trust AI scores. Low score with high price = no interest.'
                },
                {
                  mistake: 'Pricing Too Low Out of Fear',
                  reality: 'Underpricing by 20%+ makes buyers suspicious. Trust the AI recommendation.'
                },
                {
                  mistake: 'Not Adjusting After 1-2 Weeks',
                  reality: 'If no serious inquiries in 2 weeks, reduce price by 5-10%. Market has spoken.'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-6"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-1" />
                    <h3 className="text-lg font-bold text-white">{item.mistake}</h3>
                  </div>
                  <p className="text-gray-300 text-sm pl-9">{item.reality}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sample Pricing */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-white text-center mb-12">
              Example <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Price Ranges</span>
            </h2>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-12">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-white pb-4 font-bold">Model</th>
                    <th className="text-white pb-4 font-bold">Condition</th>
                    <th className="text-white pb-4 font-bold">Price Range (PKR)</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {[
                    { model: 'iPhone 15 Pro Max', condition: 'Excellent', price: '305,000 - 320,000' },
                    { model: 'iPhone 15 Pro Max', condition: 'Good', price: '290,000 - 300,000' },
                    { model: 'iPhone 14 Pro Max', condition: 'Excellent', price: '245,000 - 255,000' },
                    { model: 'iPhone 14 Pro', condition: 'Good', price: '180,000 - 190,000' },
                    { model: 'iPhone 13 Pro Max', condition: 'Excellent', price: '200,000 - 215,000' },
                    { model: 'iPhone 13 Pro', condition: 'Good', price: '140,000 - 150,000' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-4">{row.model}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          row.condition === 'Excellent' ? 'bg-green-500/20 text-green-400' : 'bg-cyan-500/20 text-cyan-400'
                        }`}>
                          {row.condition}
                        </span>
                      </td>
                      <td className="py-4 font-semibold">{row.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-gray-400 text-sm mt-6 text-center">
                *Prices updated December 2025. Actual values may vary based on specific condition and market demand.
              </p>
            </div>

            <div className="text-center">
              <Link
                to="/listings/create"
                className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300"
              >
                Get Your Phone's AI Price Estimate <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
