export default function ContactPage() {
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
                        Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Touch</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                        Have a question, feedback, or just want to say hello? We&apos;d love to hear from you.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="px-4 py-12 max-w-2xl mx-auto">
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 md:p-10 shadow-2xl shadow-purple-900/10">
                    <form className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-gray-300">Name</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" 
                                    placeholder="John Doe" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" 
                                    placeholder="john@example.com" 
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label htmlFor="subject" className="text-sm font-medium text-gray-300">Subject</label>
                            <div className="relative">
                                <select 
                                    id="subject" 
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                >
                                    <option>General Inquiry</option>
                                    <option>Support Request</option>
                                    <option>Feature Request</option>
                                    <option>Partnership</option>
                                    <option>Other</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium text-gray-300">Message</label>
                            <textarea 
                                id="message" 
                                rows={6} 
                                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none" 
                                placeholder="Tell us how we can help..."
                            ></textarea>
                        </div>

                        <button 
                            type="button" 
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-purple-500/20"
                        >
                            Send Message
                        </button>
                    </form>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-400 mb-2">Prefer email?</p>
                    <a href="mailto:support@vibecodementor.app" className="text-lg font-medium text-purple-400 hover:text-purple-300 transition-colors">
                        support@vibecodementor.app
                    </a>
                </div>
            </section>
        </main>
    );
}