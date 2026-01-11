import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ github_connected?: string; error?: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/auth?returnTo=/projects');
  }

  const params = await searchParams;
  const githubConnected = params.github_connected;
  const error = params.error;

  // If GitHub was just connected, redirect to hub
  if (githubConnected === 'true') {
    redirect('/hub');
  }

  // If there's an error, still redirect to hub (it will show in the app)
  if (error) {
    redirect(`/hub?error=${encodeURIComponent(error)}`);
  }

  // Default: redirect to hub
  redirect('/hub');
}
