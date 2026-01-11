import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const ProjectsClient = dynamic(() => import('./ProjectsClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  ),
});

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      }
    >
      <ProjectsClient />
    </Suspense>
  );
}
