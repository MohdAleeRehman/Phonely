import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, FileText, Clock, MessageSquare, AlertTriangle, Zap, Target } from 'lucide-react';
import CircuitPattern from '../components/common/CircuitPattern';

export default function PrivacyPolicyPage() {
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
              Privacy Policy
              <Lock className="w-12 h-12 text-cyan-400" />
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Last updated: December 8, 2025
          </p>
          <p className="text-gray-400 mt-2">
            We take your privacy seriously. Here's how we handle your data!
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
              <h2 className="text-3xl font-black text-white">Your Privacy Matters</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              At Phonely, we're committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights. By using Phonely, you agree to this policy.
            </p>
          </section>

          {/* TL;DR */}
          <section className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-10 h-10 text-cyan-400" />
              <h2 className="text-3xl font-black text-white">TL;DR (Too Long; Didn't Read)</h2>
            </div>
            <ul className="space-y-2 text-gray-300 leading-relaxed list-disc list-inside ml-4">
              <li>We collect info you give us (name, email, phone)</li>
              <li>We use AI to analyze phone photos (not stored long-term)</li>
              <li>We DON'T sell your data to third parties</li>
              <li>We use cookies for basic functionality</li>
              <li>You can delete your account anytime</li>
              <li>We're based in Pakistan and follow local laws</li>
            </ul>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-10 h-10 text-cyan-400" />
              <h2 className="text-3xl font-black text-white">What Information Do We Collect?</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">1. Information You Provide:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300">
                  <li><strong>Account Info:</strong> Name, email, phone number, password</li>
                  <li><strong>Profile:</strong> Profile photo, bio, location (city)</li>
                  <li><strong>Listings:</strong> Phone photos, descriptions, condition details, pricing</li>
                  <li><strong>Chat Messages:</strong> Conversations with other users</li>
                  <li><strong>Reviews:</strong> Ratings and feedback for other users</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">2. Automatically Collected:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300">
                  <li><strong>Device Info:</strong> IP address, browser type, operating system</li>
                  <li><strong>Usage Data:</strong> Pages visited, features used, time spent</li>
                  <li><strong>Location:</strong> Approximate location based on IP (not GPS tracking)</li>
                  <li><strong>Cookies:</strong> Small files for authentication and preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">3. AI Analysis Data:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300">
                  <li>Phone images you upload for AI inspection</li>
                  <li>AI analysis results (condition, authenticity, pricing)</li>
                  <li>Training data to improve our AI (anonymized)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Data */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-cyan-400" />
              <h2 className="text-3xl font-black text-white">How Do We Use Your Data?</h2>
            </div>
            <ul className="list-disc list-inside space-y-3 ml-4 text-gray-300 leading-relaxed">
              <li><strong>Provide the Service:</strong> Create your account, display listings, enable chat</li>
              <li><strong>AI Inspection:</strong> Analyze phone photos to assess condition and authenticity</li>
              <li><strong>Communication:</strong> Send notifications, updates, and important alerts</li>
              <li><strong>Safety:</strong> Detect fraud, fake listings, and suspicious activity</li>
              <li><strong>Improvement:</strong> Analyze usage patterns to make Phonely better</li>
              <li><strong>Legal Compliance:</strong> Comply with Pakistani laws and regulations</li>
              <li><strong>Marketing:</strong> Send newsletters and promotions (you can opt-out)</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🤝</span>
              <h2 className="text-3xl font-black text-white">Do We Share Your Data?</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p className="font-bold text-white">
                We DO NOT sell your personal data to third parties. Period.
              </p>
              <p>However, we may share data in these situations:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Other Users:</strong> Your public profile, listings, and chat messages are visible to other Phonely users</li>
                <li><strong>Service Providers:</strong> Cloud hosting, AI verification services, analytics tools</li>
                <li><strong>Legal Requirements:</strong> If required by law, court order, or to prevent illegal activity</li>
                <li><strong>Business Transfer:</strong> If Phonely is acquired or merged, data may transfer to new owners</li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section className="bg-green-500/20 border border-green-400/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-8 h-8 text-green-400" />
              <h2 className="text-3xl font-black text-white">How We Protect Your Data</h2>
            </div>
            <ul className="space-y-2 text-gray-200 leading-relaxed list-disc list-inside ml-4">
              <li>All data transmitted using SSL/TLS encryption</li>
              <li>Passwords hashed with bcrypt (we never see your actual password)</li>
              <li>Regular security audits and updates</li>
              <li>Access controls - only authorized team members can access data</li>
              <li>Automatic logout after inactivity</li>
              <li>Two-factor authentication (coming soon)</li>
            </ul>
            <p className="font-bold mt-4 text-green-900">
              <span className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <span>No system is 100% secure. We do our best, but you should also: use strong passwords, don't share login info, and report suspicious activity!</span>
              </span>
            </p>
          </section>

          {/* AI & Photos */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🤖</span>
              <h2 className="text-3xl font-black text-white">AI Analysis & Your Photos</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                When you upload photos for AI inspection:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Photos are securely processed by our AI verification system</li>
                <li>Images are analyzed to verify phone condition and authenticity</li>
                <li>We store photos on our servers to display in your listing</li>
                <li>You can delete listings (and photos) anytime</li>
                <li>Deleted photos are removed from our servers within 30 days</li>
              </ul>
              <p className="font-bold text-white mt-4">
                Don't upload sensitive personal info in photos (documents, credit cards, etc.)!
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🍪</span>
              <h2 className="text-3xl font-black text-white">Cookies & Tracking</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>We use cookies for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential:</strong> Keep you logged in, remember preferences</li>
                <li><strong>Analytics:</strong> Understand how users interact with Phonely (Google Analytics)</li>
                <li><strong>Performance:</strong> Optimize loading times and features</li>
              </ul>
              <p className="mt-4">
                You can disable cookies in your browser, but some features may not work properly.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">✊</span>
              <h2 className="text-3xl font-black text-white">Your Privacy Rights</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of all your data</li>
                <li><strong>Edit:</strong> Update your profile, email, phone number anytime</li>
                <li><strong>Delete:</strong> Delete your account and all associated data</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing emails</li>
                <li><strong>Object:</strong> Object to certain data processing activities</li>
                <li><strong>Export:</strong> Download your data in a portable format (coming soon)</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, go to Profile → Settings or email us at privacy@phonely.com.pk
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-10 h-10 text-cyan-400" />
              <h2 className="text-3xl font-black text-white">How Long Do We Keep Data?</h2>
            </div>
            <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300 leading-relaxed">
              <li><strong>Active Accounts:</strong> As long as your account exists</li>
              <li><strong>Deleted Accounts:</strong> Removed within 30 days (some data kept for legal/fraud prevention)</li>
              <li><strong>Chat Messages:</strong> Stored for 2 years for dispute resolution</li>
              <li><strong>Transaction History:</strong> 5 years (for tax/legal compliance)</li>
              <li><strong>Analytics:</strong> Anonymized data kept indefinitely</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">👶</span>
              <h2 className="text-3xl font-black text-white">Children's Privacy</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Phonely is NOT intended for users under 18. We don't knowingly collect data from children. If you're a parent and believe your child has created an account, please contact us immediately at privacy@phonely.com.pk.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🔗</span>
              <h2 className="text-3xl font-black text-white">Third-Party Services</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>We use these third-party services:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Cloud Providers:</strong> Secure hosting and data storage</li>
                <li><strong>Analytics Tools:</strong> Website usage analytics to improve your experience</li>
                <li><strong>Payment Processors:</strong> Secure payment handling</li>
                <li><strong>Communication Services:</strong> Email notifications and messaging</li>
              </ul>
              <p className="mt-4">
                Each service has its own privacy policy. We're not responsible for their practices, but we only work with reputable providers!
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-10 h-10 text-cyan-400" />
              <h2 className="text-3xl font-black text-white">Changes to This Policy</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We'll notify you of significant changes via email or platform notification. Continued use after changes = you accept the new policy!
            </p>
          </section>

          {/* Contact */}
          <section className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-10 h-10 text-cyan-400" />
              <h2 className="text-3xl font-black text-white">Questions About Privacy?</h2>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                If you have privacy concerns or questions:
              </p>
              <ul className="space-y-2">
                <li>📧 Email: privacy@phonely.com.pk</li>
              </ul>
            </div>
          </section>

          {/* Acceptance */}
          <section className="text-center bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-xl p-8">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
              We Respect Your Privacy <Lock className="w-6 h-6 text-cyan-400" />
            </h2>
            <p className="text-gray-100 mb-6">
              Thank you for trusting Phonely with your data. We're committed to keeping it safe and private!
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
