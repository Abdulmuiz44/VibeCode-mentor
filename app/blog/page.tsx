export default function BlogPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Blog</h1>
                <div className="py-20">
                    <svg className="w-24 h-24 text-gray-800 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-white mb-4">Coming Soon</h2>
                    <p className="text-gray-400">
                        We are working on some amazing content for you. Stay tuned!
                    </p>
                </div>
            </div>
        </div>
    );
}
