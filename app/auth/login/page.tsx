'use client';

import { Suspense } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import SocialButtons from '@/components/auth/SocialButtons';


function LoginContent() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Enter your details to access your account"
    >
      <SocialButtons />
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginContent />
    </Suspense>
  );
}