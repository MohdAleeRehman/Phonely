import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // Buying Questions
  {
    category: 'Buying',
    question: 'How does the AI inspection work?',
    answer: 'Our AI analyzes all uploaded images using advanced computer vision technology. It checks for authenticity markers, physical condition, screen quality, and potential issues. You get a detailed report with a condition score (0-10), authenticity confidence, and detected issues within seconds!'
  },
  {
    category: 'Buying',
    question: 'Can I trust the AI inspection?',
    answer: 'Our AI has been trained on thousands of phones and achieves 98% accuracy. However, we always recommend meeting the seller in person to verify the phone yourself. The AI inspection is a powerful tool to filter out suspicious listings, but your own verification is the final step!'
  },
  {
    category: 'Buying',
    question: 'How do I make a payment?',
    answer: 'Phonely does NOT handle payments directly. We recommend meeting in a safe public place (bank, shopping mall) and exchanging cash after verifying the phone. For high-value transactions, consider meeting at a bank branch where you can verify the phone and make the payment securely.'
  },
  {
    category: 'Buying',
    question: 'What if the phone is fake or not as described?',
    answer: 'Always verify the phone in person before making payment. Check the IMEI number, test all features, and compare with the listing description. If something doesn\'t match, don\'t proceed with the transaction. Report suspicious sellers to us immediately.'
  },

  // Selling Questions
  {
    category: 'Selling',
    question: 'How long does it take to list my phone?',
    answer: 'About 2 minutes! Upload 9 clear photos, fill in basic details (brand, model, storage, condition), and our AI will analyze everything. You\'ll get instant pricing recommendations based on current market data from OLX, WhatMobile, and PriceOye.'
  },
  {
    category: 'Selling',
    question: 'Is the AI pricing accurate?',
    answer: 'Yes! Our AI analyzes current market trends, phone condition, age, and included accessories to provide accurate pricing. For used phones, expect realistic C2C (customer-to-customer) pricing which is typically 35-45% below retail. The AI gives you a fair market range that buyers will actually pay.'
  },
  {
    category: 'Selling',
    question: 'How do I get more buyers interested?',
    answer: 'Take clear, well-lit photos from all angles. Write a detailed description mentioning: purchase date, usage history, any repairs, included accessories, and reason for selling. Honest listings get more serious buyers. Price competitively based on AI suggestions!'
  },
  {
    category: 'Selling',
    question: 'When should I mark my listing as sold?',
    answer: 'Only after you\'ve received full payment and handed over the phone! This prevents other buyers from contacting you unnecessarily. You can edit your listing anytime from your profile.'
  },

  // Safety & Security
  {
    category: 'Safety',
    question: 'Where should I meet buyers/sellers?',
    answer: 'Always meet in PUBLIC places during DAYLIGHT hours. Best options: Bank branches, shopping mall food courts, coffee shops with security, or police stations. Never go to someone\'s home or invite them to yours. Bring a friend if possible!'
  },
  {
    category: 'Safety',
    question: 'How do I verify a buyer is genuine?',
    answer: 'Check their Phonely profile: registration date, verified email/phone, past transactions (if any). During chat, genuine buyers ask specific questions about the phone. Be wary of buyers who: rush you, offer overpayment, ask for personal banking details, or suggest shipping without meeting.'
  },
  {
    category: 'Safety',
    question: 'What info should I never share?',
    answer: 'NEVER share: your home address, bank account details, credit card info, or passwords. Only share your phone number when you\'re ready to finalize the deal. Use Phonely\'s chat feature for initial communication.'
  },
  {
    category: 'Safety',
    question: 'How do I spot fake phones?',
    answer: 'Check: 1) IMEI number (dial *#06#) matches box/listing. 2) Software looks genuine (no typos, smooth animations). 3) Build quality (Apple/Samsung have premium feel). 4) All features work (camera, Face ID, fingerprint). 5) Weight feels right (fakes are often lighter). Trust your instincts!'
  },

  // Technical Questions
  {
    category: 'Technical',
    question: 'Why do I need to upload 9 photos?',
    answer: 'More photos = better AI analysis! We need: front view, back view, both sides, top, bottom, screen-on, close-up of any damage, and accessories. This helps our AI assess condition accurately and helps buyers trust your listing.'
  },
  {
    category: 'Technical',
    question: 'What if AI detects my phone as fake?',
    answer: 'First, ensure photos are clear and well-lit. Sometimes poor lighting or reflections confuse the AI. If AI consistently flags it as fake and you know it\'s genuine, you can still list it but include proof of authenticity (purchase receipt, official warranty card) to reassure buyers.'
  },
  {
    category: 'Technical',
    question: 'Can I edit my listing after posting?',
    answer: 'Yes! Go to your profile, find the listing, and click Edit. You can update price, description, photos, or condition anytime. If you make significant changes, the listing gets re-analyzed by our AI.'
  },
  {
    category: 'Technical',
    question: 'Why is my chat delayed?',
    answer: 'Phonely uses real-time WebSocket connections. If experiencing delays: 1) Check your internet connection. 2) Refresh the page. 3) Clear browser cache. Messages are never lost - they\'ll sync once connection is restored!'
  },

  // Pricing & Market
  {
    category: 'Pricing',
    question: 'Why is AI pricing lower than what I see on OLX?',
    answer: 'Many OLX listings are ASKING prices, not SELLING prices. Our AI factors in realistic C2C (customer-to-customer) market rates. Phones typically sell for 35-45% below retail for used condition. We show you what buyers will ACTUALLY pay, not wishful thinking!'
  },
  {
    category: 'Pricing',
    question: 'My phone has box & warranty but price seems low?',
    answer: 'Box adds ~PKR 500, active warranty adds ~PKR 1,000-2,000 to our estimates. However, age and condition have much bigger impact. A 1-year-old phone in excellent condition with box/warranty will be priced higher than a 2-year-old phone without them.'
  },
  {
    category: 'Pricing',
    question: 'What affects my phone\'s value?',
    answer: 'Major factors: 1) Age (biggest impact!) 2) Physical condition 3) Display quality 4) Battery health 5) Original box & accessories 6) Active warranty 7) PTA approval (in Pakistan) 8) Brand/model popularity 9) Storage capacity. Our AI weighs all these factors!'
  },
  {
    category: 'Pricing',
    question: 'Should I price below AI suggestion?',
    answer: 'Only if you need QUICK cash! AI suggests fair market range. Pricing at the lower end gets more inquiries. Pricing at higher end (but still within range) works if your phone is in exceptional condition. Avoid pricing above the suggested max - buyers won\'t bite!'
  },

  // Account & Features
  {
    category: 'Account',
    question: 'Do I need an account to browse?',
    answer: 'Nope! You can browse all listings without signing up. But to chat with sellers, post your own listings, or save favorites - you\'ll need a free account. Takes 30 seconds to sign up!'
  },
  {
    category: 'Account',
    question: 'Is Phonely free to use?',
    answer: '100% FREE! No listing fees, no commission, no hidden charges. We make money through optional premium features (coming soon: listing boosts, verified seller badges). Our mission is making phone trading easy and safe for everyone in Pakistan!'
  },
  {
    category: 'Account',
    question: 'How do I delete my account?',
    answer: 'Go to Profile → Settings → Account → Delete Account. This will remove all your listings and data permanently. Make sure to complete any pending transactions first! (Note: chats with other users are preserved for their records but your profile becomes anonymous.)'
  },
  {
    category: 'Account',
    question: 'Can I report suspicious users?',
    answer: 'Absolutely! Every profile and listing has a "Report" button. If someone: requests payment before meeting, offers suspiciously low prices, uses fake photos, or behaves inappropriately - report them immediately. We review all reports within 24 hours.'
  },
];

const categories = ['All', 'Buying', 'Selling', 'Safety', 'Technical', 'Pricing', 'Account'];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black text-gray-900 mb-4"
          >
            Got Questions? 🤔
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600"
          >
            We've got answers! Everything you need to know about buying & selling on Phonely.
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-full border-2 border-gray-300 focus:border-primary-500 focus:outline-none text-lg shadow-sm"
            />
          </div>
        </motion.div>

        {/* Category Pills */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                activeCategory === category
                  ? 'bg-linear-to-r from-primary-600 to-primary-700 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold">
                      {faq.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{faq.question}</h3>
                </div>
                <div className={`text-3xl transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                  {openIndex === index ? '⬆️' : '⬇️'}
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 text-gray-700 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤷‍♂️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No answers found</h3>
            <p className="text-gray-600 mb-6">Try a different search term or category!</p>
          </div>
        )}

        {/* Still Have Questions CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center bg-linear-to-r from-primary-600 to-purple-700 rounded-2xl p-12 text-white"
        >
          <h2 className="text-3xl font-black mb-4">Still Have Questions? 💬</h2>
          <p className="text-lg mb-6 text-gray-100">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@phonely.com.pk"
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-primary-700 transition-all duration-200"
            >
              📧 Email Us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
