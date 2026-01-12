export default function CareersPage() {
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
                        Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Revolution</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                        Help us democratize software engineering. We&apos;re building the tools that will power the next generation of founders and creators.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="px-4 py-12 max-w-4xl mx-auto text-center">
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 md:p-16">
                    <div className="mb-8">
                        <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800 text-4xl mb-6">
                            🚀
                        </span>
                        <h2 className="text-3xl font-bold text-white mb-4">No Open Roles Right Now</h2>
                        <p className="text-gray-400 max-w-lg mx-auto mb-8">
                            We are currently a small, focused team and do not have any open positions. However, we are always interested in connecting with passionate engineers and designers who believe in the future of vibecoding.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Stay in touch</p>
                        <a 
                            href="mailto:careers@vibecodementor.app" 
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-lg transition-all transform hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email Us Your Resume
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}