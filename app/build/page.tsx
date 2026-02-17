'use client';

import { Suspense } from 'react';
import HomeClient from './HomeClient';

export default function BuildPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <HomeClient />
    </Suspense>
  );
}
