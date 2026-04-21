import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

interface SignInForm {
  email: string;
  password: string;
}

interface SignUpForm {
  username: string;
  email: string;
  password: string;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { login } = useAuth();
  const [error, setError] = useState('');

  const signInForm = useForm<SignInForm>();
  const signUpForm = useForm<SignUpForm>();

  const handleSignIn = async (data: SignInForm) => {
    setError('');
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error);
      return;
    }
    login(json);
    onClose();
  };

  const handleSignUp = async (data: SignUpForm) => {
    setError('');
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error);
      return;
    }
    login(json);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-900">Welcome, Treasure Hunter!</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="signin" onValueChange={() => setError('')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  {...signInForm.register('email', { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••"
                  {...signInForm.register('password', { required: true })}
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="signup-username">Username</Label>
                <Input
                  id="signup-username"
                  placeholder="pirateking"
                  {...signUpForm.register('username', { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  {...signUpForm.register('email', { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="At least 6 characters"
                  {...signUpForm.register('password', { required: true, minLength: 6 })}
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-amber-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-amber-600">or</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full mt-3 border-amber-400 text-amber-700 hover:bg-amber-50"
            onClick={onClose}
          >
            Play as Guest
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
