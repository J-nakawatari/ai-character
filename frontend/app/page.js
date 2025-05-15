'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './utils/auth';
import Button from './components/Button';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.hasCompletedSetup) {
          router.push('/dashboard');
        } else {
          router.push('/setup');
        }
      }
    }
  }, [user, loading, router]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <h1 className="text-4xl font-bold mb-6 text-center">AI Character App</h1>
      <p className="text-xl mb-8 text-center max-w-md">
        Create your account to interact with AI characters
      </p>
      <div className="flex gap-4">
        <Link href="/login">
          <Button>Login</Button>
        </Link>
        <Link href="/register">
          <Button className="bg-blue-600 hover:bg-blue-700">Register</Button>
        </Link>
      </div>
    </div>
  );
}
