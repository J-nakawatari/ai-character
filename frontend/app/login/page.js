'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../utils/auth';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = async (data) => {
    setServerError('');
    
    const result = await login(data);
    
    if (result.success) {
      if (user?.hasCompletedSetup) {
        router.push('/dashboard');
      } else {
        router.push('/setup');
      }
    } else {
      setServerError(result.error);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        
        {serverError && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
            {serverError}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register('email')}
          />
          
          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password')}
          />
          
          <Button
            type="submit"
            className="w-full mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        
        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}
