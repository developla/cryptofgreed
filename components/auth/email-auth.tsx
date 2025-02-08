'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Mail, Lock } from 'lucide-react';
import { useGameStore } from '@/lib/store/game';
import { toast } from 'sonner';

interface EmailAuthProps {
  onSuccess?: () => void;
}

export function EmailAuth({ onSuccess }: EmailAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithEmail, registerWithEmail } = useGameStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const success = await loginWithEmail(email, password);
        if (success) {
          toast.success('Logged in successfully!');
          onSuccess?.();
        } else {
          toast.error('Invalid credentials');
        }
      } else {
        const success = await registerWithEmail(email, password);
        if (success) {
          toast.success('Registration successful! Please log in.');
          setIsLogin(true);
        } else {
          toast.error('Registration failed');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(isLogin ? 'Login failed' : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center">
          <Mail className="mx-auto mb-2 h-8 w-8" />
          <h2 className="text-2xl font-bold">
            {isLogin ? 'Login' : 'Create Account'}
          </h2>
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {isLogin ? 'Logging in...' : 'Creating account...'}
            </div>
          ) : isLogin ? (
            'Login'
          ) : (
            'Create Account'
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Log in'}
          </button>
        </div>
      </form>
    </Card>
  );
}
