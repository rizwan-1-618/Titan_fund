import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

/**
 * TransactionModal — modal form for creating a new deposit or withdrawal request.
 * Demonstrates: useRef (auto-focus input on open), Controlled Components.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSubmit - async callback(amount, notes)
 * @param {'deposit'|'withdrawal'} props.mode - the transaction type
 * @param {number} props.availableCapital - current approved capital (for withdrawal validation)
 */
export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  mode = 'deposit',
  availableCapital = 0,
}) {
  const isWithdrawal = mode === 'withdrawal';

  // Controlled component state
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // useRef: reference to the amount input for auto-focus
  const amountInputRef = useRef(null);

  // Auto-focus the amount input when modal opens
  useEffect(() => {
    if (isOpen && amountInputRef.current) {
      // Small delay to ensure the modal is rendered before focusing
      const timer = setTimeout(() => {
        amountInputRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setNotes('');
      setError('');
      setSubmitting(false);
    }
  }, [isOpen]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      amountInputRef.current?.focus();
      return;
    }

    if (numAmount > 100000000) {
      setError('Amount cannot exceed ₹10,00,00,000.');
      return;
    }

    // Withdrawal-specific: check sufficient balance
    if (isWithdrawal && numAmount > availableCapital) {
      setError(
        `Insufficient capital. Your available balance is ${formatCurrency(availableCapital)}.`
      );
      amountInputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(numAmount, notes);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={cn(
          'w-full max-w-md animate-fade-in rounded-2xl border bg-surface p-6 shadow-2xl shadow-black/40',
          isWithdrawal ? 'border-danger/30' : 'border-border'
        )}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              {isWithdrawal ? 'Withdrawal Request' : 'New Deposit Request'}
            </h2>
            <p className="mt-0.5 text-sm text-text-muted">
              {isWithdrawal
                ? 'Request a withdrawal from your capital'
                : 'Submit a capital deposit for approval'}
            </p>
            {isWithdrawal && (
              <p className="mt-1 text-xs font-medium text-primary">
                Available: {formatCurrency(availableCapital)}
              </p>
            )}
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input - Controlled Component with useRef */}
          <div>
            <label
              htmlFor="tx-amount"
              className="mb-1.5 block text-sm font-medium text-text-secondary"
            >
              {isWithdrawal ? 'Withdrawal' : 'Deposit'} Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted">
                ₹
              </span>
              <input
                ref={amountInputRef}
                id="tx-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                step="any"
                required
                className={cn(
                  'w-full rounded-xl border border-border bg-background py-3 pl-8 pr-4',
                  'text-sm text-text-primary placeholder:text-text-muted',
                  'transition-all duration-200',
                  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                  'hover:border-border-hover'
                )}
              />
            </div>
          </div>

          {/* Notes Input - Controlled Component */}
          <div>
            <label
              htmlFor="tx-notes"
              className="mb-1.5 block text-sm font-medium text-text-secondary"
            >
              Notes{' '}
              <span className="font-normal text-text-muted">(optional)</span>
            </label>
            <textarea
              id="tx-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isWithdrawal
                  ? 'Reason for withdrawal...'
                  : 'Add a note for the admin...'
              }
              rows={3}
              className={cn(
                'w-full resize-none rounded-xl border border-border bg-background p-3',
                'text-sm text-text-primary placeholder:text-text-muted',
                'transition-all duration-200',
                'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                'hover:border-border-hover'
              )}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-danger-muted p-3 text-sm text-danger">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              id="cancel-tx-btn"
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              id="submit-tx-btn"
              type="submit"
              disabled={submitting}
              className={cn(
                'rounded-xl px-5 py-2.5 text-sm font-semibold text-background',
                'transition-all duration-200',
                'disabled:cursor-not-allowed disabled:opacity-50',
                isWithdrawal
                  ? 'bg-danger hover:bg-danger/90 hover:shadow-lg hover:shadow-danger/20'
                  : 'bg-primary hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20'
              )}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                  Submitting…
                </span>
              ) : isWithdrawal ? (
                'Submit Withdrawal'
              ) : (
                'Submit Deposit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
