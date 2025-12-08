import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
            Terms of Service 📜
          </h1>
          <p className="text-xl text-gray-600">
            Last updated: December 8, 2025
          </p>
          <p className="text-gray-500 mt-2">
            (Yeah, we know legal stuff is boring, but please read this!)
          </p>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8"
        >
          {/* Intro */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">👋</span>
              <h2 className="text-3xl font-black text-gray-900">Welcome to Phonely!</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              By using Phonely (the "Service"), you agree to these Terms of Service ("Terms"). If you don't agree, please don't use our platform. These Terms apply to everyone: buyers, sellers, and browsers.
            </p>
          </section>

          {/* What Phonely Is */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">📱</span>
              <h2 className="text-3xl font-black text-gray-900">What is Phonely?</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Phonely is a marketplace platform that connects buyers and sellers of mobile phones in Pakistan. We provide:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI-powered phone inspection and authentication</li>
                <li>Real-time chat between buyers and sellers</li>
                <li>Market pricing intelligence</li>
                <li>A safe, user-friendly platform for transactions</li>
              </ul>
              <p className="font-bold text-gray-900 mt-4">
                Important: Phonely is a PLATFORM ONLY. We don't buy, sell, or ship phones. All transactions happen between users directly.
              </p>
            </div>
          </section>

          {/* Eligibility */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">✅</span>
              <h2 className="text-3xl font-black text-gray-900">Who Can Use Phonely?</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
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
              <h2 className="text-3xl font-black text-gray-900">Your Responsibilities</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-xl font-bold text-gray-900">As a Seller:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Only list phones you legally own</li>
                <li>Provide accurate descriptions and photos</li>
                <li>Disclose all defects, repairs, or issues honestly</li>
                <li>Meet buyers safely and verify identity before exchange</li>
                <li>Honor agreed-upon prices and terms</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6">As a Buyer:</h3>
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
          <section className="bg-red-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🚫</span>
              <h2 className="text-3xl font-black text-red-900">Strictly Prohibited</h2>
            </div>
            <div className="space-y-2 text-red-900 leading-relaxed">
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
              <p className="font-bold mt-4 bg-red-200 p-3 rounded-lg">
                ⚠️ Violation = Instant ban + legal action if needed!
              </p>
            </div>
          </section>

          {/* AI Inspection Disclaimer */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🤖</span>
              <h2 className="text-3xl font-black text-gray-900">AI Inspection Disclaimer</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
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
              <p className="font-bold text-gray-900 mt-4">
                Always inspect the phone in person before buying. Don't rely solely on AI!
              </p>
            </div>
          </section>

          {/* Payment & Transactions */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">💰</span>
              <h2 className="text-3xl font-black text-gray-900">Payments & Transactions</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p className="font-bold text-gray-900">
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
                ⚠️ Phonely is NOT responsible for payment disputes, fraud, or scams. Transactions are at your own risk!
              </p>
            </div>
          </section>

          {/* Content & Intellectual Property */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">©️</span>
              <h2 className="text-3xl font-black text-gray-900">Content & Ownership</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
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
              <span className="text-4xl">⚖️</span>
              <h2 className="text-3xl font-black text-gray-900">Liability & Disclaimers</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p className="font-bold text-gray-900">
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
              <p className="font-bold text-gray-900 mt-4">
                USE PHONELY AT YOUR OWN RISK. Be smart, be safe, and trust your gut!
              </p>
            </div>
          </section>

          {/* Account Termination */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🔒</span>
              <h2 className="text-3xl font-black text-gray-900">Account Termination</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
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
              <span className="text-4xl">📝</span>
              <h2 className="text-3xl font-black text-gray-900">Changes to Terms</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We may update these Terms from time to time. We'll notify you of major changes via email or platform notification. Continued use = you accept the new Terms!
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🇵🇰</span>
              <h2 className="text-3xl font-black text-gray-900">Governing Law</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                These Terms are governed by the laws of Pakistan. Any disputes will be resolved in Pakistani courts.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-primary-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">💬</span>
              <h2 className="text-3xl font-black text-gray-900">Questions About Terms?</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                If you have questions about these Terms, contact us:
              </p>
              <ul className="space-y-2">
                <li>📧 Email: legal@phonely.com.pk</li>
              </ul>
            </div>
          </section>

          {/* Acceptance */}
          <section className="text-center bg-linear-to-r from-primary-600 to-purple-700 text-white rounded-xl p-8">
            <h2 className="text-2xl font-black mb-4">By Using Phonely, You Accept These Terms ✅</h2>
            <p className="text-gray-100 mb-6">
              Thank you for being part of the Phonely community! Let's make phone trading safe and awesome! 🚀
            </p>
            <Link
              to="/"
              className="inline-block px-8 py-3 bg-white text-primary-700 rounded-full font-bold hover:scale-105 transition-transform duration-200"
            >
              Back to Home
            </Link>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
