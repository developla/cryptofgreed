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
import { LogIn } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onRegisterClick,
}) => {
  const { state, dispatch } = useGame();
  const { loginError } = state;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Reset form and clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      dispatch({ type: 'CLEAR_LOGIN_ERROR' });
    }
  }, [isOpen, dispatch]);

  // Close modal if user logs in
  useEffect(() => {
    if (state.user?.isLoggedIn) {
      onClose();
    }
  }, [state.user, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      console.error('All fields are required');
      return;
    }
    dispatch({
      type: 'LOGIN',
      payload: {
        username: email.split('@')[0],
        email,
        password,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent className="border border-amber-900/20 bg-slate-50 shadow-lg sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Cinzel'] text-2xl font-bold text-amber-900">
            Login
          </DialogTitle>
          <DialogDescription className="font-['MedievalSharp'] text-amber-800/80">
            Enter your credentials to continue your adventure
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
              className="border-amber-700/30 focus:border-amber-800 focus:ring-1 focus:ring-amber-800"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-amber-900">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-amber-700/30 focus:border-amber-800 focus:ring-1 focus:ring-amber-800"
            />
          </div>

          {loginError && (
            <div className="rounded-md border border-red-200 bg-red-100 p-3 text-sm text-red-800">
              {loginError}
            </div>
          )}

          <Button
            type="submit"
            className="no-hover-effect w-full border border-amber-700/30 bg-red-800 py-6 text-white transition-transform active:scale-[0.98]"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-sm font-medium text-amber-800 no-underline transition-transform active:scale-[0.98]"
            >
              Don't have an account? Create one
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
