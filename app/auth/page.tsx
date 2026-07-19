'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const router = useRouter();
  const { user, loginWithGoogle, loginWithEmail, signUpWithEmail, resetPassword, loginAsGuest } = useAuth();
  const { t } = useLanguage();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgot) {
        if (!email) {
          toast.error('Please enter your email.');
          setLoading(false);
          return;
        }
        await resetPassword(email);
        setIsForgot(false);
      } else if (isSignUp) {
        if (!email || !password || !name) {
          toast.error('All fields are required.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, name);
      } else {
        if (!email || !password) {
          toast.error('Email and password are required.');
          setLoading(false);
          return;
        }
        await loginWithEmail(email, password);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-background">
      {/* Decorative Glows */}
      <div className="glow-effect glow-primary -top-10 left-1/3"></div>
      <div className="glow-effect glow-accent bottom-0 right-1/4"></div>

      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md border border-card-border bg-card/60 backdrop-blur-md rounded-2xl shadow-xl p-8 relative overflow-hidden">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-foreground">
              <span className="animate-motion-text">
                {isForgot 
                  ? 'Reset Password' 
                  : isSignUp 
                    ? 'Join CityPulse AI' 
                    : 'Welcome to CityPulse'}
              </span>
            </h2>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              {isForgot 
                ? 'Enter your email to receive a recovery link.' 
                : isSignUp 
                  ? 'Create an account to track complaints and claim rewards.' 
                  : 'Log in to report issues and earn civic reputation.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name field for Sign Up */}
            {isSignUp && !isForgot && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Name
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full h-10 px-3 bg-input border border-card-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.mercer@gmail.com"
                className="w-full h-10 px-3 bg-input border border-card-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>

            {/* Password field */}
            {!isForgot && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> Password
                  </label>
                  {!isSignUp && (
                    <button 
                      type="button" 
                      onClick={() => setIsForgot(true)}
                      className="text-[10px] text-primary hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 bg-input border border-card-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>
            )}

            {/* Action button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm shadow-primary/20 disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
              ) : (
                <>
                  <span>
                    {isForgot 
                      ? 'Send Recovery Link' 
                      : isSignUp 
                        ? 'Create Account' 
                        : 'Sign In'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Forgot Password back to sign in */}
          {isForgot && (
            <button 
              onClick={() => setIsForgot(false)}
              className="w-full mt-4 text-xs text-center text-primary hover:underline cursor-pointer"
            >
              Back to Sign In
            </button>
          )}

          {/* Social Sign-In (Only visible if not in password reset state) */}
          {!isForgot && (
            <>
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-card-border"></div>
                </div>
                <span className="relative bg-card px-3 text-[10px] text-muted uppercase tracking-wider">Or continue with</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="h-10 border border-card-border hover:bg-input rounded-xl text-xs font-semibold text-foreground flex items-center justify-center gap-2 transition-all cursor-pointer bg-card/40"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  onClick={handleGuestLogin}
                  disabled={loading}
                  className="h-10 border border-card-border hover:bg-input rounded-xl text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-card/40"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>{t('guestMode')}</span>
                </button>
              </div>

              {/* Toggle Sign In / Sign Up */}
              <div className="mt-6 text-center text-xs">
                <span className="text-muted">
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                </span>
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary font-semibold hover:underline cursor-pointer ml-1"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
