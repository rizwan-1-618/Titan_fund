import { Link } from 'react-router-dom';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * NotFound — 404 page with a link back to the dashboard.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-danger/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-elevated">
          <TrendingUp className="h-10 w-10 text-text-muted" />
        </div>

        {/* 404 */}
        <h1 className="mb-2 bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-7xl font-black tracking-tighter text-transparent">
          404
        </h1>
        <h2 className="mb-2 text-xl font-bold text-text-primary">
          Page Not Found
        </h2>
        <p className="mb-8 max-w-sm text-sm text-text-muted">
          The page you're looking for doesn't exist or you may not have access to it.
        </p>

        {/* Back to Dashboard */}
        <Link
          to="/dashboard"
          className={cn(
            'inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover px-6 py-3',
            'text-sm font-semibold text-background shadow-lg shadow-primary/20',
            'transition-all duration-200 hover:shadow-xl hover:shadow-primary/30',
            'active:scale-[0.97]'
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
