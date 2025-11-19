'use client';

import { Suspense } from 'react';
import HomeClient from './home/HomeClient';

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black" />}>
      <HomeClient />
    </Suspense>
  );
}
