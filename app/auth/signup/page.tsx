'use client';

import { Suspense } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import SocialButtons from '@/components/auth/SocialButtons';
import SignupForm from '@/components/auth/SignupForm';

function SignupContent() {
  return (
    <AuthLayout 
      title="Get Started" 
      subtitle="Sign up to start building your ideas"
    >
      <SignupForm />
      <SocialButtons />
    </AuthLayout>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SignupContent />
    </Suspense>
  );
}