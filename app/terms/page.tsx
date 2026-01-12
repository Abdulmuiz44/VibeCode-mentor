export default function TermsPage() {
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
                        Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Service</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                        Please read these terms carefully before using VibeCode Mentor.
                    </p>
                    <p className="mt-4 text-sm text-gray-500">Last updated: November 2025</p>
                </div>
            </section>

            {/* Content Section */}
            <section className="px-4 py-12 max-w-4xl mx-auto">
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 md:p-12">
                    <div className="prose prose-invert prose-lg max-w-none text-gray-300">
                        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p className="mb-6 leading-relaxed">
                            By accessing or using VibeCode Mentor, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>

                        <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
                        <p className="mb-6 leading-relaxed">
                            Permission is granted to temporarily download one copy of the materials (information or software) on VibeCode Mentor&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="list-disc pl-6 mb-6 space-y-2">
                            <li>Modify or copy the materials;</li>
                            <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                            <li>Attempt to decompile or reverse engineer any software contained on VibeCode Mentor&apos;s website;</li>
                            <li>Remove any copyright or other proprietary notations from the materials; or</li>
                            <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-white mb-4">3. Disclaimer</h2>
                        <p className="mb-6 leading-relaxed">
                            The materials on VibeCode Mentor&apos;s website are provided on an &apos;as is&apos; basis. VibeCode Mentor makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>

                        <h2 className="text-2xl font-bold text-white mb-4">4. Limitations</h2>
                        <p className="mb-6 leading-relaxed">
                            In no event shall VibeCode Mentor or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on VibeCode Mentor&apos;s website, even if VibeCode Mentor or a VibeCode Mentor authorized representative has been notified orally or in writing of the possibility of such damage.
                        </p>

                        <h2 className="text-2xl font-bold text-white mb-4">5. Revisions and Errata</h2>
                        <p className="mb-6 leading-relaxed">
                            The materials appearing on VibeCode Mentor&apos;s website could include technical, typographical, or photographic errors. VibeCode Mentor does not warrant that any of the materials on its website are accurate, complete, or current. VibeCode Mentor may make changes to the materials contained on its website at any time without notice.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}