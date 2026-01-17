
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import { getProStatusFromCloud } from '@/lib/supabase.server';
import BuildFullAppClient from './BuildFullAppClient';

export const metadata = {
  title: 'Build Full App | VibeCode Mentor',
  description: 'Turn your blueprint into a production-ready application.',
};

export default async function BuildFullAppPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth?callbackUrl=/build-full-app');
  }

  const isPro = await getProStatusFromCloud(session.user.id);

  if (!isPro) {
    redirect('/dashboard?upgrade=true');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<div className="p-8 text-center">Loading builder...</div>}>
        <BuildFullAppClient user={session.user} />
      </Suspense>
    </div>
  );
}
