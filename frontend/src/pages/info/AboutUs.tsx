import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, Shield, Zap, Users, Heart, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import CircuitPattern from '../../components/common/CircuitPattern';

export default function AboutUs() {
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
              About <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Phonely</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              We're building Pakistan's first AI-verified phone marketplace. No more fake listings. No more surprises. Just verified deals.
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-cyan-400 font-semibold">
              <Heart className="w-5 h-5" /> Made in Pakistan
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 mb-20"
          >
            <h2 className="text-4xl font-black text-white mb-8 text-center">
              Why We <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Built This</span>
            </h2>
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                We've all been there. You find a "mint condition" iPhone on OLX. The seller swears it's perfect. You drive across the city. You show up. The phone has scratches everywhere. The back is cracked. The battery is dead. You wasted your time, your fuel, and your trust.
              </p>
              <p>
                Or you're selling your phone. You take photos. You write a description. You list it at what you think is a fair price. Then come the lowballers. "Will you take 50% of asking price?" "Can you deliver it 100km away?" "Is it available?" (spoiler: yes, it's still listed).
              </p>
              <p>
                The phone marketplace in Pakistan is broken. Sellers exaggerate condition. Buyers can't verify authenticity. Pricing is guesswork. Scammers thrive. Everyone wastes time on deals that go nowhere.
              </p>
              <p className="text-white font-bold text-2xl">
                We built Phonely to fix all of this.
              </p>
            </div>
          </motion.div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-linear-to-br from-cyan-950 via-blue-950 to-purple-950 rounded-2xl p-8"
            >
              <Target className="w-12 h-12 text-cyan-400 mb-6" />
              <h3 className="text-3xl font-black text-white mb-4">Our Mission</h3>
              <p className="text-gray-300 leading-relaxed">
                Make phone trading transparent, safe, and efficient for everyone in Pakistan. Every phone verified. Every price fair. Every transaction secure.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-linear-to-br from-purple-950 via-pink-950 to-blue-950 rounded-2xl p-8"
            >
              <TrendingUp className="w-12 h-12 text-purple-400 mb-6" />
              <h3 className="text-3xl font-black text-white mb-4">Our Vision</h3>
              <p className="text-gray-300 leading-relaxed">
                Become the only place Pakistanis trust for buying and selling phones. Zero fake listings. Zero surprises. Complete transparency through AI verification.
              </p>
            </motion.div>
          </div>

          {/* Our Values */}
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12">
            What We <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Stand For</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: Shield,
                title: 'Trust First',
                description: 'Every decision we make prioritizes building trust between buyers and sellers. AI verification isn\'t optional—it\'s mandatory.'
              },
              {
                icon: Zap,
                title: 'Speed Matters',
                description: 'List your phone in 2 minutes. Get AI verification in 30 seconds. Start chatting immediately. No unnecessary steps.'
              },
              {
                icon: Users,
                title: 'Pakistan-Focused',
                description: 'Built specifically for how Pakistanis buy and sell. PKR pricing. Local cities. WhatsApp support. We get it.'
              },
              {
                icon: Heart,
                title: 'Always Free',
                description: 'No listing fees. No success fees. No premium tiers. Completely free forever. We make money by keeping the platform trusted.'
              },
              {
                icon: Target,
                title: 'Data-Driven',
                description: 'Our AI uses real market data, not guesses. Pricing recommendations are based on thousands of actual transactions.'
              },
              {
                icon: CheckCircle,
                title: 'Transparency',
                description: 'No hidden algorithms. No promoted listings. Best matches shown first. Everyone gets equal visibility.'
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
              >
                <value.icon className="w-12 h-12 text-cyan-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-gray-300 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>

          {/* By the Numbers */}
          <div className="bg-linear-to-br from-cyan-950 via-blue-950 to-purple-950 rounded-3xl p-12 mb-20">
            <h2 className="text-4xl font-black text-white text-center mb-12">
              Phonely <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">By the Numbers</span>
            </h2>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { number: '5,000+', label: 'Phones Verified' },
                { number: '30 sec', label: 'AI Verification Time' },
                { number: '0 PKR', label: 'Listing Fees' },
                { number: '24/7', label: 'Platform Available' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="text-5xl font-black bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-300 font-semibold">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Team Note */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 mb-20 text-center">
            <h2 className="text-3xl font-black text-white mb-6">
              Built by Phone Buyers & Sellers
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8">
              We're not some Silicon Valley tech bros who've never experienced the pain of buying a used phone in Pakistan. We're locals who've been scammed, lowballed, and wasted countless hours on fake listings. We built Phonely because we needed it to exist.
            </p>
            <div className="flex items-center justify-center gap-4 text-gray-300">
              <span>🇵🇰</span>
              <span className="font-semibold">Proudly Pakistani</span>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center">
            <h2 className="text-4xl font-black text-white mb-6">
              Get in <span className="bg-linear-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Touch</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Questions? Feedback? Ideas? We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a
                href="mailto:support@phonely.com.pk"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white rounded-full text-lg font-bold hover:bg-white/20 transition-all duration-300"
              >
                support@phonely.com.pk
              </a>
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-full text-lg font-bold transition-all duration-300"
              >
                WhatsApp Support
              </a>
            </div>
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300"
            >
              Start Using Phonely <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
