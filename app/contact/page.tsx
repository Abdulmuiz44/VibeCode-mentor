export default function ContactPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-center">Contact Us</h1>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
                    <form className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                            <input type="text" id="name" className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="Your name" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                            <input type="email" id="email" className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                            <textarea id="message" rows={5} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="How can we help?"></textarea>
                        </div>
                        <button type="button" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition-all">
                            Send Message
                        </button>
                    </form>
                </div>

                <div className="mt-12 text-center text-gray-400">
                    <p>Or email us directly at <a href="mailto:vibecodeguide@gmail.com" className="text-purple-400 hover:text-purple-300">support@vibecodementor.app</a></p>
                </div>
            </div>
        </div>
    );
}
