import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { MessageSquareText, X } from 'lucide-react';

/**
 * TransactionTable — reusable table displaying a list of transactions.
 * Demonstrates: Lists & Keys, Lifting State Up (receives data via props from parent).
 *
 * @param {Object} props
 * @param {Array} props.transactions - array of transaction objects
 * @param {boolean} props.showUser - whether to show the user name column (admin view)
 * @param {boolean} props.loading - loading state
 * @param {Function} props.onApprove - callback for approve action (admin)
 * @param {Function} props.onReject - callback for reject/decline action (admin)
 * @param {boolean} props.isAdmin - whether the viewer is an admin
 */
export default function TransactionTable({
  transactions = [],
  showUser = false,
  loading = false,
  onApprove,
  onReject,
  isAdmin = false,
}) {
  const [viewingNote, setViewingNote] = useState(null); // tx object whose note is being viewed

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-14 w-full" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated">
          <svg
            className="h-8 w-8 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-text-secondary">
          No transactions yet
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Transactions will appear here once created.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-elevated/50">
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-text-secondary">
                Date
              </th>
              {showUser && (
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-text-secondary">
                  Investor
                </th>
              )}
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-text-secondary">
                Type
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-secondary">
                Amount
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-text-secondary">
                Status
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-center font-semibold text-text-secondary">
                Note
              </th>
              {isAdmin && (
                <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-text-secondary">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {/* Lists & Keys: each transaction mapped with unique key */}
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-border/50 transition-colors duration-150 hover:bg-surface-hover"
              >
                <td className="whitespace-nowrap px-4 py-3.5 text-text-primary">
                  {formatDate(tx.date)}
                </td>
                {showUser && (
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-muted text-xs font-bold text-primary">
                        {tx.userName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className="text-text-primary">
                        {tx.userName || 'Unknown'}
                      </span>
                    </div>
                  </td>
                )}
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                      tx.type === 'Withdrawal'
                        ? 'bg-danger-muted text-danger'
                        : 'bg-accent-muted text-accent'
                    )}
                  >
                    {tx.type === 'Withdrawal' ? '↑ Withdrawal' : '↓ Deposit'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold text-text-primary">
                  {formatCurrency(tx.amount)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <StatusBadge status={tx.status} />
                </td>
                {/* Note indicator */}
                <td className="whitespace-nowrap px-4 py-3.5 text-center">
                  {tx.note ? (
                    <button
                      id={`view-note-${tx.id}`}
                      onClick={() => setViewingNote(tx)}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary-muted px-2 py-1 text-xs font-medium text-primary transition-all duration-200 hover:bg-primary/20 hover:shadow-sm"
                      title="View note"
                    >
                      <MessageSquareText className="h-3.5 w-3.5" />
                      View
                    </button>
                  ) : (
                    <span className="text-xs text-text-muted">—</span>
                  )}
                </td>
                {isAdmin && (
                  <td className="whitespace-nowrap px-4 py-3.5 text-right">
                    {tx.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          id={`approve-btn-${tx.id}`}
                          onClick={() => onApprove?.(tx.id, tx.userId, tx.amount, tx.type)}
                          className="rounded-lg bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition-all duration-200 hover:bg-success/20 hover:shadow-sm"
                        >
                          Approve
                        </button>
                        <button
                          id={`decline-btn-${tx.id}`}
                          onClick={() => onReject?.(tx.id)}
                          className="rounded-lg bg-danger-muted px-3 py-1.5 text-xs font-semibold text-danger transition-all duration-200 hover:bg-danger/20 hover:shadow-sm"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    {tx.status === 'APPROVED' && (
                      <span className="text-xs text-success">Completed</span>
                    )}
                    {tx.status === 'REJECTED' && (
                      <span className="text-xs text-text-muted">Declined</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note Viewer Modal */}
      {viewingNote && (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setViewingNote(null)}
        >
          <div className="w-full max-w-sm animate-fade-in rounded-2xl border border-border bg-surface p-5 shadow-2xl shadow-black/40">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-muted">
                  <MessageSquareText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    Transaction Note
                  </h3>
                  <p className="text-xs text-text-muted">
                    From {viewingNote.userName || 'Investor'} · {formatDate(viewingNote.date)}
                  </p>
                </div>
              </div>
              <button
                id="close-note-modal"
                onClick={() => setViewingNote(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Note metadata */}
            <div className="mb-3 flex items-center gap-2 text-xs text-text-muted">
              <span
                className={cn(
                  'inline-flex items-center rounded-md px-2 py-0.5 font-medium',
                  viewingNote.type === 'Withdrawal'
                    ? 'bg-danger-muted text-danger'
                    : 'bg-accent-muted text-accent'
                )}
              >
                {viewingNote.type}
              </span>
              <span>·</span>
              <span className="font-semibold text-text-primary">
                {formatCurrency(viewingNote.amount)}
              </span>
              <span>·</span>
              <StatusBadge status={viewingNote.status} />
            </div>

            {/* Note content */}
            <div className="rounded-xl bg-background p-4 text-sm leading-relaxed text-text-primary">
              {viewingNote.note}
            </div>

            <button
              onClick={() => setViewingNote(null)}
              className="mt-4 w-full rounded-xl bg-surface-elevated py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * StatusBadge — styled status indicator
 */
function StatusBadge({ status }) {
  const styles = {
    PENDING: 'bg-warning-muted text-warning',
    APPROVED: 'bg-success-muted text-success',
    REJECTED: 'bg-danger-muted text-danger',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        styles[status] || 'bg-surface-elevated text-text-muted'
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'PENDING' && 'bg-warning animate-pulse',
          status === 'APPROVED' && 'bg-success',
          status === 'REJECTED' && 'bg-danger'
        )}
      />
      {status}
    </span>
  );
}
