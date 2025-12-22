'use client';

import { Suspense } from 'react';
import HomeClient from './HomeClient';

export default function BuildPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black" />}>
      <HomeClient />
    </Suspense>
  );
}
