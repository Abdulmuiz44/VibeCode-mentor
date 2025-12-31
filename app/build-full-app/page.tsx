'use client';

import { Suspense } from 'react';
import BuildFullAppClient from './BuildFullAppClient';

export default function BuildFullAppPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black" />}>
      <BuildFullAppClient />
    </Suspense>
  );
}
