import { cn } from '@/lib/utils';

/**
 * Spinner — animated loading indicator.
 * Used as Suspense fallback and inline loading states.
 */
export default function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'rounded-full border-primary/30 border-t-primary animate-spin-slow',
          sizeClasses[size]
        )}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
