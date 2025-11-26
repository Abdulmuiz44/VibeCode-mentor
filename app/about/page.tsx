export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">About VibeCode Mentor</h1>
                <div className="prose prose-invert max-w-none">
                    <p className="text-xl text-gray-300 mb-8">
                        VibeCode Mentor is an AI-powered platform designed to help developers, founders, and creators turn their ideas into production-ready technical blueprints.
                    </p>
                    <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                    <p className="text-gray-400 mb-8">
                        We believe that planning shouldn&apos;t be the bottleneck in software development. Our mission is to democratize access to senior-level architectural guidance, making it easier for anyone to build high-quality software.
                    </p>
                    <h2 className="text-2xl font-bold mb-4">The Team</h2>
                    <p className="text-gray-400 mb-8">
                        We are a team of passionate developers and AI enthusiasts who understand the struggle of starting a new project. We built VibeCode Mentor to solve our own problem: the &quot;blank canvas paralysis.&quot;
                    </p>
                </div>
            </div>
        </div>
    );
}
