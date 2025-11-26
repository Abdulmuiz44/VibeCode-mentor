export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Security</h1>
                <div className="prose prose-invert max-w-none text-gray-300">
                    <p className="mb-4">
                        Security is a top priority at VibeCode Mentor. We are committed to protecting your data and ensuring the reliability of our platform.
                    </p>
                    <h2 className="text-2xl font-bold mt-8 mb-4 text-white">Data Encryption</h2>
                    <p className="mb-4">
                        All data transmitted between your browser and our servers is encrypted using TLS 1.2 or higher. Data at rest is encrypted using industry-standard AES-256 encryption.
                    </p>
                    <h2 className="text-2xl font-bold mt-8 mb-4 text-white">Authentication</h2>
                    <p className="mb-4">
                        We use secure authentication providers (Google, NextAuth) to handle user identity. We do not store passwords on our servers.
                    </p>
                    <h2 className="text-2xl font-bold mt-8 mb-4 text-white">Infrastructure</h2>
                    <p className="mb-4">
                        Our infrastructure is hosted on Vercel and Supabase, which provide enterprise-grade security and compliance certifications.
                    </p>
                    <h2 className="text-2xl font-bold mt-8 mb-4 text-white">Reporting Vulnerabilities</h2>
                    <p className="mb-4">
                        If you believe you have found a security vulnerability in VibeCode Mentor, please report it to us at vibecodeguide@gmail.com.
                    </p>
                </div>
            </div>
        </div>
    );
}
