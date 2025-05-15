'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../utils/auth';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !user.hasCompletedSetup) {
      router.push('/setup');
    }
  }, [user, loading, router]);
  
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push('/login');
    }
  };
  
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">AI Character Dashboard</h1>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
        
        <Card>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-32 h-32 relative rounded-full overflow-hidden bg-gray-200">
              {/* Placeholder for character image */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-4xl">
                {user.selectedCharacter?.name?.charAt(0) || '?'}
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Welcome, {user.name}!</h2>
                <p className="text-gray-600">
                  You're interacting with {user.selectedCharacter?.name || 'your AI character'}
                </p>
              </div>
              
              {user.selectedCharacter && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Character Details</h3>
                  <p className="mb-2">{user.selectedCharacter.description}</p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Personality:</span> {user.selectedCharacter.personality}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
