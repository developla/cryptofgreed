import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerUser } from '@/lib/storage';
import { ArrowRight } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onLoginClick,
}) => {
  const { state, dispatch } = useGame();
  const { registrationError, registrationSuccess } = state;

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Reset form state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setEmail('');
      setPassword('');
      dispatch({ type: 'CLEAR_REGISTRATION_STATUS' });
    }
  }, [isOpen, dispatch]);

  // Close modal if registration is successful after a delay
  useEffect(() => {
    if (registrationSuccess) {
      const timer = setTimeout(() => {
        onLoginClick(); // Redirect to login
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [registrationSuccess, onLoginClick]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!username.trim() || !email.trim() || !password.trim()) {
      console.error('All fields are required');
      return;
    }

    // Register user
    const result = registerUser(username, email, password);

    dispatch({
      type: 'REGISTER',
      payload: result,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border border-amber-900/20 bg-slate-50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-900">
            Create Account
          </DialogTitle>
          <DialogDescription>
            Join the Crypt of Greed and begin your dark adventure
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-amber-900">
              Username
            </Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="border-amber-700/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-amber-900">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-amber-700/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-amber-900">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-amber-700/30"
            />
            <p className="text-xs text-slate-500">
              Password must be at least 6 characters
            </p>
          </div>

          {registrationError && (
            <div className="rounded-md bg-red-100 p-3 text-sm text-red-800">
              {registrationError}
            </div>
          )}

          {registrationSuccess && (
            <div className="rounded-md bg-green-100 p-3 text-sm text-green-800">
              Account created successfully! Redirecting to login...
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-red-800 py-6 text-white hover:bg-red-900"
            disabled={registrationSuccess}
          >
            Create Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onLoginClick}
              className="text-sm font-medium text-amber-800 hover:text-amber-900 hover:underline"
            >
              Already have an account? Log in
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;
