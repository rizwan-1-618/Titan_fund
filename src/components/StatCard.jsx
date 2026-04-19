import { cn } from '@/lib/utils';

/**
 * StatCard — glassmorphic metric card for the dashboard.
 * Displays a label, value, icon, and optional trend.
 */
export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  variant = 'default',
  className = '',
}) {
  const variantStyles = {
    default: 'border-border bg-surface',
    primary: 'border-primary/20 bg-primary-muted',
    success: 'border-success/20 bg-success-muted',
    warning: 'border-warning/20 bg-warning-muted',
    accent: 'border-accent/20 bg-accent-muted',
  };

  const iconColors = {
    default: 'text-text-secondary',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    accent: 'text-accent',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-5 transition-all duration-300',
        'hover:border-border-hover hover:shadow-lg hover:shadow-black/20',
        'animate-pulse-glow',
        variantStyles[variant],
        className
      )}
    >
      {/* Decorative gradient blob */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-2xl" />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-text-primary">
            {value}
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'text-xs font-semibold',
                  trend >= 0 ? 'text-success' : 'text-danger'
                )}
              >
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
              {trendLabel && (
                <span className="text-xs text-text-muted">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              'bg-surface-elevated',
              iconColors[variant]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
