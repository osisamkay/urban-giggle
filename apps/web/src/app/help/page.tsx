'use client';

import { useState } from 'react';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click on the "Sign Up" button in the navigation bar and fill out the registration form with your email and password.',
      },
      {
        q: 'What is group purchasing?',
        a: 'Group purchasing allows multiple buyers to pool their orders together to unlock wholesale pricing and better deals from producers.',
      },
    ],
  },
  {
    category: 'Orders & Shipping',
    questions: [
      {
        q: 'How long does shipping take?',
        a: 'Standard shipping typically takes 3-5 business days. Expedited options are available at checkout.',
      },
      {
        q: 'Can I track my order?',
        a: 'Yes! Once your order ships, you will receive a tracking number via email and can monitor your delivery in your dashboard.',
      },
    ],
  },
  {
    category: 'Products',
    questions: [
      {
        q: 'Are all products verified?',
        a: 'Yes, all producers and products go through a strict verification process to ensure quality and safety standards.',
      },
      {
        q: 'How is the meat packaged?',
        a: 'All meat is vacuum-sealed and shipped in insulated packaging with ice packs to maintain proper temperature.',
      },
    ],
  },
  {
    category: 'Payment',
    questions: [
      {
        q: 'What payment methods are accepted?',
        a: 'We accept all major credit cards, debit cards, and digital payment methods through our secure checkout.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes, all transactions are encrypted and processed through secure payment gateways. We never store your full card details.',
      },
    ],
  },
];

export default function HelpPage() {
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);

  const toggleFAQ = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setExpandedIndex(expandedIndex === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            How Can We Help?
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions or contact our support team
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full px-6 py-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-meat-500 focus:border-transparent"
            />
            <svg
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
                {category.category}
              </h2>
              <div className="space-y-3">
                {category.questions.map((item, questionIndex) => {
                  const key = `${categoryIndex}-${questionIndex}`;
                  const isExpanded = expandedIndex === key;

                  return (
                    <div
                      key={questionIndex}
                      className="bg-white rounded-lg shadow-sm overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{item.q}</span>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${
                            isExpanded ? 'transform rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {isExpanded && (
                        <div className="px-6 pb-4 text-gray-600">{item.a}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-meat-600 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-display font-bold mb-2">
            Still need help?
          </h3>
          <p className="mb-6">
            Our support team is here to assist you
          </p>
          <a
            href="mailto:support@sharesteak.com"
            className="inline-block bg-white text-meat-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
