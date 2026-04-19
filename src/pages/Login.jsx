import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { TrendingUp, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import Spinner from '@/components/Spinner';

/**
 * Login Page — handles both sign-in and sign-up flows.
 * Demonstrates: Controlled Components, error handling, loading states.
 */
export default function Login() {
  const { login, signup, isAuthenticated, loading: authLoading, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();

  // Controlled form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function getErrorMessage(code) {
    const messages = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/configuration-error': 'Firebase is not configured. Please add your credentials to the .env file.',
    };
    return messages[code] || 'An unexpected error occurred. Please try again.';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        await signup(email, password, name.trim());
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover shadow-xl shadow-primary/25">
            <TrendingUp className="h-7 w-7 text-background" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Titan Fund
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Investment LLP Tracking Portal
          </p>
        </div>

        {/* Firebase config warning */}
        {!isFirebaseConfigured && (
          <div className="mb-4 animate-fade-in rounded-xl border border-warning/30 bg-warning-muted p-4 text-sm">
            <p className="font-semibold text-warning">⚠️ Firebase Not Configured</p>
            <p className="mt-1 text-text-secondary">
              Create a <code className="rounded bg-surface-elevated px-1.5 py-0.5 text-xs font-mono text-warning">.env</code> file in the project root with your Firebase credentials. See <code className="rounded bg-surface-elevated px-1.5 py-0.5 text-xs font-mono text-warning">.env.example</code> for required variables.
            </p>
          </div>
        )}

        {/* Card */}
        <div className="animate-fade-in rounded-2xl border border-border bg-surface p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-text-primary">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              {isSignUp
                ? 'Register to start tracking your investments'
                : 'Sign in to access your portfolio'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (signup only) */}
            {isSignUp && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="mb-1.5 block text-sm font-medium text-text-secondary"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required={isSignUp}
                    className={cn(
                      'w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4',
                      'text-sm text-text-primary placeholder:text-text-muted',
                      'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                      'hover:border-border-hover transition-all duration-200'
                    )}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="auth-email"
                className="mb-1.5 block text-sm font-medium text-text-secondary"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={cn(
                    'w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4',
                    'text-sm text-text-primary placeholder:text-text-muted',
                    'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                    'hover:border-border-hover transition-all duration-200'
                  )}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="auth-password"
                className="mb-1.5 block text-sm font-medium text-text-secondary"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className={cn(
                    'w-full rounded-xl border border-border bg-background py-3 pl-10 pr-11',
                    'text-sm text-text-primary placeholder:text-text-muted',
                    'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                    'hover:border-border-hover transition-all duration-200'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-danger-muted p-3 text-sm text-danger">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className={cn(
                'w-full rounded-xl bg-gradient-to-r from-primary to-primary-hover py-3 text-sm font-semibold text-background',
                'transition-all duration-200',
                'hover:shadow-lg hover:shadow-primary/25',
                'active:scale-[0.98]',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                  {isSignUp ? 'Creating Account…' : 'Signing In…'}
                </span>
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-6 text-center text-sm text-text-muted">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              id="auth-toggle-btn"
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="font-semibold text-primary transition-colors hover:text-primary-hover"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-text-muted">
          © 2026 Titan Fund LLP. All rights reserved.
        </p>
      </div>
    </div>
  );
}
