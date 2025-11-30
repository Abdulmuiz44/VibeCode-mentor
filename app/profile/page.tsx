import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import { getCurrentUsage } from '@/lib/kv';
import { getProStatusFromCloud } from '@/lib/supabase.server';
import ProBadge from '@/components/ProBadge';
import { ProUpgradeModalProvider, useProUpgradeModal } from '@/components/ProUpgradeModal';
import ProfileClient from './ProfileClient'; // We'll separate client logic

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/auth');
    }

    const userId = session.user.id;
    const email = session.user.email || '';

    // Get IP for rate limiting check if userId is missing (fallback, though auth is required here)
    // In a server component, getting IP is a bit trickier without headers, but we have userId.

    const [usageCount, isPro] = await Promise.all([
        getCurrentUsage(userId, '0.0.0.0'), // IP irrelevant if userId present
        getProStatusFromCloud(userId)
    ]);

    const limit = 10;
    const percentage = Math.min((usageCount / limit) * 100, 100);

    // Calculate reset date (end of current month)
    const date = new Date();
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const resetDate = endOfMonth.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    {session.user.image ? (
                        <img
                            src={session.user.image}
                            alt={session.user.name || 'User'}
                            className="w-20 h-20 rounded-full border-2 border-purple-500"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-bold">
                            {session.user.name?.[0] || 'U'}
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold">{session.user.name}</h1>
                        <p className="text-gray-400">{email}</p>
                        <div className="mt-2">
                            {isPro ? <ProBadge /> : <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">Free Plan</span>}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Plan Usage</h2>

                    {isPro ? (
                        <div className="text-center py-8">
                            <div className="text-5xl mb-2">∞</div>
                            <p className="text-green-400 font-medium">Unlimited Access</p>
                            <p className="text-gray-500 text-sm mt-2">You are on the Pro plan. No limits apply.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-300">Blueprint Generations</span>
                                <span className="font-medium">{usageCount} / {limit}</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-4 mb-4 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${percentage >= 100 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                        }`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mb-6">
                                Monthly limit resets on {resetDate}.
                            </p>

                            <ProfileClient />
                        </>
                    )}
                </div>

                {/* Account Details / Settings Placeholder */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-800">
                            <span className="text-gray-400">Email</span>
                            <span>{email}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-800">
                            <span className="text-gray-400">User ID</span>
                            <span className="font-mono text-xs text-gray-500">{userId}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
