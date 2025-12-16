import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ScrollText, Smartphone, CheckCircle2, Copyright, Scale, FileText, MessageSquare, AlertTriangle, Mail, Lock } from 'lucide-react';
import PKRIcon from '../components/icons/PKRIcon';
import CircuitPattern from '../components/common/CircuitPattern';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-950 to-gray-900 py-12">
      <CircuitPattern />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            <span className="flex items-center justify-center gap-3">
              Terms of Service
              <ScrollText className="w-12 h-12 text-cyan-400" />
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Last updated: December 8, 2025
          </p>
          <p className="text-gray-400 mt-2">
            (Yeah, we know legal stuff is boring, but please read this!)
          </p>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg p-8 md:p-12 space-y-8 relative z-10"
        >
          {/* Intro */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">👋</span>
              <h2 className="text-3xl font-black text-white">Welcome to Phonely!</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              By using Phonely (the "Service"), you agree to these Terms of Service ("Terms"). If you don't agree, please don't use our platform. These Terms apply to everyone: buyers, sellers, and browsers.
            </p>
          </section>

          {/* What Phonely Is */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-10 h-10 text-cyan-400" />
              <h2 className="text-3xl font-black text-white">What is Phonely?</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Phonely is a marketplace platform that connects buyers and sellers of mobile phones in Pakistan. We provide:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI-powered phone inspection and authentication</li>
                <li>Real-time chat between buyers and sellers</li>
                <li>Market pricing intelligence</li>
                <li>A safe, user-friendly platform for transactions</li>
              </ul>
              <p className="font-bold text-white mt-4">
                Important: Phonely is a PLATFORM ONLY. We don't buy, sell, or ship phones. All transactions happen between users directly.
              </p>
            </div>
          </section>

          {/* Eligibility */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-10 h-10 text-cyan-400" />
              <h2 className="text-3xl font-black text-white">Who Can Use Phonely?</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>You must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Be at least 18 years old (or have parental consent)</li>
                <li>Be a resident of Pakistan</li>
                <li>Provide accurate, truthful information</li>
                <li>Have the legal right to sell phones you list</li>
                <li>Not be banned or restricted from using our Service</li>
              </ul>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🤝</span>
              <h2 className="text-3xl font-black text-white">Your Responsibilities</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <h3 className="text-xl font-bold text-white">As a Seller:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Only list phones you legally own</li>
                <li>Provide accurate descriptions and photos</li>
                <li>Disclose all defects, repairs, or issues honestly</li>
                <li>Meet buyers safely and verify identity before exchange</li>
                <li>Honor agreed-upon prices and terms</li>
              </ul>

              <h3 className="text-xl font-bold text-white mt-6">As a Buyer:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Verify phone authenticity and condition in person</li>
                <li>Check IMEI, test all features before payment</li>
                <li>Meet sellers in safe public places</li>
                <li>Make payment only after receiving and verifying the phone</li>
                <li>Report suspicious listings or sellers</li>
              </ul>
            </div>
          </section>

          {/* Prohibited Actions */}
          <section className="bg-red-500/20 border border-red-400/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🚫</span>
              <h2 className="text-3xl font-black text-red-300">Strictly Prohibited</h2>
            </div>
            <div className="space-y-2 text-red-300 leading-relaxed">
              <p className="font-bold">You may NOT:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>List stolen, illegal, or counterfeit phones</li>
                <li>Use fake photos or descriptions</li>
                <li>Scam, defraud, or mislead other users</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Create multiple accounts to manipulate the platform</li>
                <li>Scrape data or use bots</li>
                <li>Sell anything other than mobile phones</li>
                <li>Impersonate other users or entities</li>
              </ul>
              <p className="font-bold mt-4 bg-red-600/30 border border-red-400/50 p-3 rounded-lg">
                <span className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                  <span>Violation = Instant ban + legal action if needed!</span>
                </span>
              </p>
            </div>
          </section>

          {/* AI Inspection Disclaimer */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🤖</span>
              <h2 className="text-3xl font-black text-white">AI Inspection Disclaimer</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Our AI inspection is a TOOL to help you make informed decisions. However:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI is not 100% perfect (though we try hard!)</li>
                <li>Poor photo quality can affect AI accuracy</li>
                <li>AI cannot detect internal hardware issues</li>
                <li>AI cannot verify if a phone is stolen</li>
                <li>Final verification is YOUR responsibility</li>
              </ul>
              <p className="font-bold text-white mt-4">
                Always inspect the phone in person before buying. Don't rely solely on AI!
              </p>
            </div>
          </section>

          {/* Payment & Transactions */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <PKRIcon className="w-10 h-10 text-cyan-400" />
              <h2 className="text-3xl font-black text-white">Payments & Transactions</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p className="font-bold text-white">
                Phonely does NOT process payments. All transactions are between users.
              </p>
              <p>We recommend:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cash transactions in safe public places</li>
                <li>Bank transfers only after verifying the phone</li>
                <li>Never send payment before receiving the phone</li>
                <li>Get a written receipt with IMEI number</li>
              </ul>
              <p className="font-bold text-red-600 mt-4">
                <span className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                  <span>Phonely is NOT responsible for payment disputes, fraud, or scams. Transactions are at your own risk!</span>
                </span>
              </p>
            </div>
          </section>

          {/* Content & Intellectual Property */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Copyright className="w-10 h-10 text-cyan-400" />
              <h2 className="text-3xl font-black text-white">Content & Ownership</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                <strong>Your Content:</strong> You own photos and descriptions you upload. By posting, you grant Phonely a license to display and promote your listings.
              </p>
              <p>
                <strong>Our Content:</strong> Phonely's logo, design, AI technology, and platform are our property. Don't copy, steal, or misuse them!
              </p>
            </div>
          </section>

          {/* Liability Limitations */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-10 h-10 text-cyan-400" />
              <h2 className="text-3xl font-black text-white">Liability & Disclaimers</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p className="font-bold text-white">
                Phonely provides the Service "AS IS" without warranties. We are NOT liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fraudulent sellers or fake phones</li>
                <li>Theft, robbery, or violence during meetups</li>
                <li>Payment disputes or scams</li>
                <li>Phone defects discovered after purchase</li>
                <li>AI inspection inaccuracies</li>
                <li>Service downtime or technical issues</li>
                <li>Lost profits or business opportunities</li>
              </ul>
              <p className="font-bold text-white mt-4">
                USE PHONELY AT YOUR OWN RISK. Be smart, be safe, and trust your gut!
              </p>
            </div>
          </section>

          {/* Account Termination */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-8 h-8 text-cyan-400" />
              <h2 className="text-3xl font-black text-white">Account Termination</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We reserve the right to suspend or ban accounts that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate these Terms</li>
                <li>Engage in fraudulent activities</li>
                <li>Receive multiple user reports</li>
                <li>Abuse the platform or other users</li>
              </ul>
              <p>
                You can delete your account anytime from Profile → Settings → Delete Account.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-10 h-10 text-cyan-400" />
              <h2 className="text-3xl font-black text-white">Changes to Terms</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                We may update these Terms from time to time. We'll notify you of major changes via email or platform notification. Continued use = you accept the new Terms!
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🇵🇰</span>
              <h2 className="text-3xl font-black text-white">Governing Law</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                These Terms are governed by the laws of Pakistan. Any disputes will be resolved in Pakistani courts.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-10 h-10 text-cyan-400" />
              <h2 className="text-3xl font-black text-white">Questions About Terms?</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                If you have questions about these Terms, contact us:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email: legal@phonely.com.pk</li>
              </ul>
            </div>
          </section>

          {/* Acceptance */}
          <section className="text-center bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-xl p-8">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
              By Using Phonely, You Accept These Terms
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </h2>
            <p className="text-gray-100 mb-6">
              Thank you for being part of the Phonely community! Let's make phone trading safe and awesome!
            </p>
            <Link
              to="/"
              className="inline-block px-8 py-3 bg-white/10 backdrop-blur-md text-white border-2 border-white/20 rounded-full font-bold hover:scale-105 hover:bg-white/20 transition-all duration-200"
            >
              Back to Home
            </Link>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
