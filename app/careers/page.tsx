export default function CareersPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Careers</h1>
                <div className="py-20">
                    <svg className="w-24 h-24 text-gray-800 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-white mb-4">Join Our Team</h2>
                    <p className="text-gray-400 mb-8">
                        We&apos;re always looking for talented individuals to join our mission.
                    </p>
                    <a href="mailto:careers@vibecodementor.app" className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
                        Contact Us
                    </a>
                </div>
            </div>
        </div>
    );
}
