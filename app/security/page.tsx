export default function SecurityPage() {
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
                        Security at <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">VibeCode</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                        Protecting your intellectual property and personal data is our highest priority.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="px-4 py-12 max-w-4xl mx-auto">
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 md:p-12">
                    <div className="prose prose-invert prose-lg max-w-none text-gray-300">
                        <p className="mb-8 leading-relaxed text-xl font-light text-gray-200">
                            VibeCode Mentor is built with a security-first mindset. We leverage enterprise-grade infrastructure and best practices to ensure your blueprints and data remain confidential and secure.
                        </p>

                        <div className="grid md:grid-cols-2 gap-8 my-12 not-prose">
                            <div className="bg-black border border-gray-800 p-6 rounded-xl">
                                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="p-2 bg-green-500/10 text-green-400 rounded-lg">🔒</span>
                                    Encryption
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    All data transmitted between your browser and our servers is encrypted using TLS 1.3. Data at rest in our databases is encrypted using AES-256.
                                </p>
                            </div>
                            <div className="bg-black border border-gray-800 p-6 rounded-xl">
                                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">🛡️</span>
                                    Authentication
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    We use secure, industry-standard OAuth providers (Google) via NextAuth.js. We never see or store your passwords directly.
                                </p>
                            </div>
                            <div className="bg-black border border-gray-800 p-6 rounded-xl">
                                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">☁️</span>
                                    Infrastructure
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Hosted on Vercel and Supabase, utilizing their world-class security compliance (SOC 2 Type 2, ISO 27001, GDPR).
                                </p>
                            </div>
                            <div className="bg-black border border-gray-800 p-6 rounded-xl">
                                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="p-2 bg-red-500/10 text-red-400 rounded-lg">👁️</span>
                                    Access Control
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Strict Row Level Security (RLS) policies ensure that you—and only you—can access your generated blueprints and project data.
                                </p>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-4">Vulnerability Reporting</h2>
                        <p className="mb-6 leading-relaxed">
                            We value the security community. If you believe you have found a security vulnerability in VibeCode Mentor, please report it to us immediately at <a href="mailto:security@vibecodementor.app" className="text-purple-400 hover:text-purple-300">security@vibecodementor.app</a>. We will respond promptly and work with you to remediate the issue.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}