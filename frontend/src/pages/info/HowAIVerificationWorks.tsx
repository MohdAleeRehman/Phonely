import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bot, Camera, Target, CheckCircle, ArrowRight, Shield, Eye, TrendingUp, Zap } from 'lucide-react';
import CircuitPattern from '../../components/common/CircuitPattern';

export default function HowAIVerificationWorks() {
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
              How <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">AI Verification</span> Works
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Every phone on Phonely goes through our advanced AI verification system. Here's exactly how it works and what it checks.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: Camera,
                step: 'Step 1',
                title: 'Upload Photos',
                description: 'Sellers upload 9 required photos showing every angle of the phone: front, back, sides, screen on/off, camera lenses, ports, and any damage.',
                color: 'from-cyan-500 to-blue-600'
              },
              {
                icon: Bot,
                step: 'Step 2',
                title: 'AI Analysis',
                description: 'Our AI processes the images in 30 seconds, using computer vision to detect damage, wear patterns, authenticity markers, and condition indicators.',
                color: 'from-purple-500 to-pink-600'
              },
              {
                icon: CheckCircle,
                step: 'Step 3',
                title: 'Verification Report',
                description: 'A detailed report is generated with an authenticity score, condition breakdown, and fair price recommendation based on market data.',
                color: 'from-green-500 to-emerald-600'
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
                <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-xl z-20">
                  {index + 1}
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 pt-10 h-full relative z-10">
                  <div className={`inline-flex p-4 rounded-xl bg-linear-to-br ${step.color} mb-6`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* What We Check */}
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12">
              What Our AI <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Analyzes</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Eye,
                  title: 'Screen Condition',
                  points: ['Cracks and scratches', 'Dead pixels', 'Screen burn-in', 'Touch responsiveness indicators', 'Brightness uniformity']
                },
                {
                  icon: Shield,
                  title: 'Body & Frame',
                  points: ['Dents and scuffs', 'Paint wear and discoloration', 'Button condition', 'Port integrity', 'Frame bending or damage']
                },
                {
                  icon: Camera,
                  title: 'Camera System',
                  points: ['Lens scratches', 'Camera glass condition', 'Focus clarity', 'Flash functionality indicators', 'Multiple lens alignment']
                },
                {
                  icon: Target,
                  title: 'Authenticity Markers',
                  points: ['Logo placement and quality', 'Build quality indicators', 'Color consistency', 'Model-specific features', 'Signs of modifications']
                }
              ].map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
                >
                  <category.icon className="w-12 h-12 text-cyan-400 mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-6">{category.title}</h3>
                  <ul className="space-y-3">
                    {category.points.map((point, i) => (
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

          {/* The Score */}
          <div className="bg-linear-to-br from-cyan-950 via-blue-950 to-purple-950 rounded-3xl p-12 mb-20">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Understanding the <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Authenticity Score</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Every listing gets a score from 1-100 based on condition, authenticity, and market value alignment.
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                {[
                  { range: '85-100', label: 'Excellent', color: 'text-green-400', desc: 'Like new condition, no visible wear' },
                  { range: '70-84', label: 'Good', color: 'text-cyan-400', desc: 'Minor wear, fully functional' },
                  { range: 'Below 70', label: 'Fair', color: 'text-yellow-400', desc: 'Noticeable wear or issues documented' }
                ].map((score, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                    <div className={`text-3xl font-black ${score.color} mb-2`}>{score.range}</div>
                    <div className="text-xl font-bold text-white mb-2">{score.label}</div>
                    <p className="text-gray-400 text-sm">{score.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-12">
              Why This <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Matters</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { icon: Zap, title: 'Instant Trust', desc: 'Buyers know exactly what they\'re getting before meeting' },
                { icon: TrendingUp, title: 'Fair Pricing', desc: 'Sellers get data-driven price recommendations' },
                { icon: Shield, title: 'Reduced Scams', desc: 'Fake listings and misrepresented phones are filtered out' }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
                >
                  <benefit.icon className="w-12 h-12 text-cyan-400 mb-4 mx-auto" />
                  <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                  <p className="text-gray-300">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
            <Link
              to="/listings/create"
              className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300"
            >
              Try AI Verification Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
