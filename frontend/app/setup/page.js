'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../utils/auth';
import api from '../utils/api';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  characterId: z.string().min(1, 'Please select a character'),
});

export default function Setup() {
  const { user, completeSetup, loading } = useAuth();
  const router = useRouter();
  const [characters, setCharacters] = useState([]);
  const [serverError, setServerError] = useState('');
  const [loadingCharacters, setLoadingCharacters] = useState(true);
  
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      characterId: '',
    },
  });
  
  const selectedCharacterId = watch('characterId');
  
  useEffect(() => {
    if (!loading && user?.hasCompletedSetup) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const res = await api.get('/characters');
        setCharacters(res.data);
      } catch (err) {
        setServerError('Failed to load characters');
      } finally {
        setLoadingCharacters(false);
      }
    };
    
    fetchCharacters();
  }, []);
  
  useEffect(() => {
    if (user?.name) {
      setValue('name', user.name);
    }
  }, [user, setValue]);
  
  const onSubmit = async (data) => {
    setServerError('');
    
    const result = await completeSetup(data);
    
    if (result.success) {
      router.push('/dashboard');
    } else {
      setServerError(result.error);
    }
  };
  
  if (loading || loadingCharacters) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Setup</h1>
        
        {serverError && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
            {serverError}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Your Name"
            id="name"
            type="text"
            placeholder="Enter your name"
            error={errors.name?.message}
            {...register('name')}
          />
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Select Your AI Character
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {characters.map((character) => (
                <div
                  key={character._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedCharacterId === character._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setValue('characterId', character._id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 relative rounded-full overflow-hidden bg-gray-200">
                      {/* Placeholder for character image */}
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        {character.name.charAt(0)}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">{character.name}</h3>
                      <p className="text-sm text-gray-500">
                        {character.personality}
                      </p>
                    </div>
                  </div>
                  
                  <p className="mt-2 text-sm">{character.description}</p>
                  
                  <input
                    type="radio"
                    id={`character-${character._id}`}
                    value={character._id}
                    className="sr-only"
                    {...register('characterId')}
                  />
                </div>
              ))}
            </div>
            
            {errors.characterId && (
              <p className="mt-1 text-sm text-red-500">
                {errors.characterId.message}
              </p>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Complete Setup'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
