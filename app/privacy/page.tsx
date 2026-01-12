export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Policy</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                        We are committed to protecting your personal data and ensuring your privacy.
                    </p>
                    <p className="mt-4 text-sm text-gray-500">Last updated: November 2025</p>
                </div>
            </section>

            {/* Content Section */}
            <section className="px-4 py-12 max-w-4xl mx-auto">
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 md:p-12">
                    <div className="prose prose-invert prose-lg max-w-none text-gray-300">
                        <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                        <p className="mb-6 leading-relaxed">
                            We collect information that you provide directly to us, such as when you create an account, generate a blueprint, subscribe to our newsletter, or contact us for support. This may include:
                        </p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Name and email address;</li>
                            <li>Project descriptions and blueprint data;</li>
                            <li>Payment information (processed securely by our payment providers);</li>
                            <li>Usage data and interaction with our AI tools.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                        <p className="mb-6 leading-relaxed">
                            We use the information we collect to provide, maintain, and improve our services, including:
                        </p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Processing your transactions and managing your account;</li>
                            <li>Generating and saving your project blueprints;</li>
                            <li>Sending you technical notices, updates, and support messages;</li>
                            <li>Improving our AI models and user experience (using anonymized data only).</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-white mb-4">3. Data Security</h2>
                        <p className="mb-6 leading-relaxed">
                            We implement appropriate technical and organizational measures to protect the security of your personal information, including encryption of data in transit and at rest. However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure.
                        </p>

                        <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Services</h2>
                        <p className="mb-6 leading-relaxed">
                            We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work (e.g., payment processing, hosting, email delivery).
                        </p>

                        <h2 className="text-2xl font-bold text-white mb-4">5. Your Rights</h2>
                        <p className="mb-6 leading-relaxed">
                            Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, delete, or restrict the use of your data. To exercise these rights, please contact us at support@vibecodementor.app.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}