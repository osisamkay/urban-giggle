export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 mb-6">
            About ShareSteak
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connecting quality meat producers with conscious consumers through
            community-driven group purchasing
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            ShareSteak was founded on the belief that everyone deserves access to
            high-quality, ethically-sourced meat at fair prices. By leveraging the
            power of group purchasing, we enable individuals and businesses to buy
            directly from verified producers, cutting out unnecessary middlemen and
            ensuring transparency from farm to table.
          </p>
        </div>

        {/* Values Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-meat-600 mb-4">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
              Quality Assurance
            </h3>
            <p className="text-gray-600">
              Every producer is thoroughly verified and all products meet strict
              quality standards.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-meat-600 mb-4">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
              Community First
            </h3>
            <p className="text-gray-600">
              We believe in the power of collective purchasing to benefit everyone
              involved.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-meat-600 mb-4">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
              Sustainability
            </h3>
            <p className="text-gray-600">
              Supporting local producers and reducing environmental impact through
              efficient distribution.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-6 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-meat-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-meat-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Browse</h4>
              <p className="text-sm text-gray-600">
                Explore products from verified producers
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-meat-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-meat-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Join</h4>
              <p className="text-sm text-gray-600">
                Join a group purchase or buy individually
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-meat-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-meat-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Save</h4>
              <p className="text-sm text-gray-600">
                Unlock wholesale prices through collective buying
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-meat-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-meat-600">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Enjoy</h4>
              <p className="text-sm text-gray-600">
                Receive fresh, quality meat at your door
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
