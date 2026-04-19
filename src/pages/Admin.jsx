import { useState, useMemo, useCallback, useEffect } from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { subscribeToAllUsers } from '@/services/firestore';
import { formatCurrency } from '@/utils/formatters';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import TransactionTable from '@/components/TransactionTable';
import { cn } from '@/lib/utils';
import {
  ShieldCheck,
  Users,
  Clock,
  CheckCircle2,
  DollarSign,
  Filter,
} from 'lucide-react';

/**
 * Admin Page — admin-only panel showing all transactions across all users.
 *
 * Demonstrates:
 *  - useCallback: wraps handleApprove and handleReject to prevent re-renders
 *  - useMemo: memoized stats calculations
 *  - Error handling with try/catch and user feedback
 */
export default function Admin() {
  const {
    transactions,
    loading,
    handleApproveTransaction,
    handleRejectTransaction,
  } = usePortfolio();

  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  // ─── useEffect: Subscribe to all user docs for Global AUM ──────
  useEffect(() => {
    const unsubscribe = subscribeToAllUsers((users) => {
      setAllUsers(users);
    });
    return () => unsubscribe();
  }, []);

  // ─── useMemo: Global AUM from user docs (source of truth) ──────
  const globalAUM = useMemo(() => {
    return allUsers.reduce((sum, u) => sum + (u.totalApprovedCapital || 0), 0);
  }, [allUsers]);

  // ─── useMemo: Compute admin stats from transactions ────────────
  const stats = useMemo(() => {
    const uniqueUsers = new Set(transactions.map((tx) => tx.userId));
    const pending = transactions.filter((tx) => tx.status === 'PENDING');
    const approved = transactions.filter((tx) => tx.status === 'APPROVED');
    const rejected = transactions.filter((tx) => tx.status === 'REJECTED');
    const totalVolume = transactions.reduce((s, tx) => s + (tx.amount || 0), 0);
    const pendingVolume = pending.reduce((s, tx) => s + (tx.amount || 0), 0);

    return {
      totalUsers: uniqueUsers.size,
      pendingCount: pending.length,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
      totalVolume,
      pendingVolume,
    };
  }, [transactions]);

  // ─── useMemo: Filtered transactions ────────────────────────────
  const filteredTransactions = useMemo(() => {
    if (filter === 'ALL') return transactions;
    return transactions.filter((tx) => tx.status === filter);
  }, [transactions, filter]);

  // ─── useCallback: Stabilized approve handler ───────────────────
  const handleApprove = useCallback(
    async (txId, userId, amount, type = 'Deposit') => {
      setActionError('');
      setActionSuccess('');
      setActionLoading(txId);
      try {
        await handleApproveTransaction(txId, userId, amount, type);
        const action = type === 'Withdrawal' ? 'deducted from' : 'added to';
        setActionSuccess(`${type} approved — ${formatCurrency(amount)} ${action} investor's capital.`);
        // Auto-dismiss success message
        setTimeout(() => setActionSuccess(''), 4000);
      } catch (err) {
        setActionError(`Failed to approve: ${err.message}`);
      } finally {
        setActionLoading(null);
      }
    },
    [handleApproveTransaction]
  );

  // ─── useCallback: Stabilized reject handler ───────────────────
  const handleReject = useCallback(
    async (txId) => {
      setActionError('');
      setActionSuccess('');
      setActionLoading(txId);
      try {
        await handleRejectTransaction(txId);
        setActionSuccess('Transaction declined successfully. It will remain in records for audit.');
        setTimeout(() => setActionSuccess(''), 4000);
      } catch (err) {
        setActionError(`Failed to decline: ${err.message}`);
      } finally {
        setActionLoading(null);
      }
    },
    [handleRejectTransaction]
  );

  const filterOptions = [
    { value: 'ALL', label: 'All', count: transactions.length },
    { value: 'PENDING', label: 'Pending', count: stats.pendingCount },
    { value: 'APPROVED', label: 'Approved', count: stats.approvedCount },
    { value: 'REJECTED', label: 'Rejected', count: stats.rejectedCount },
  ];

  return (
    <Layout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                Admin Panel
              </h1>
              <p className="text-sm text-text-muted">
                Manage all investor transactions and capital approvals.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Global AUM"
            value={formatCurrency(globalAUM)}
            icon={DollarSign}
            variant="primary"
          />
          <StatCard
            label="Total Investors"
            value={stats.totalUsers.toString()}
            icon={Users}
            variant="accent"
          />
          <StatCard
            label="Pending Approvals"
            value={`${stats.pendingCount}`}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            label="Approved Deposits"
            value={stats.approvedCount.toString()}
            icon={CheckCircle2}
            variant="success"
          />
        </div>

        {/* Feedback Messages */}
        {actionError && (
          <div className="animate-fade-in rounded-xl bg-danger-muted p-4 text-sm font-medium text-danger">
            {actionError}
          </div>
        )}
        {actionSuccess && (
          <div className="animate-fade-in rounded-xl bg-success-muted p-4 text-sm font-medium text-success">
            {actionSuccess}
          </div>
        )}

        {/* Transactions Card */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                All Transactions
              </h2>
              <p className="mt-0.5 text-sm text-text-muted">
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} 
                {filter !== 'ALL' ? ` (${filter.toLowerCase()})` : ''}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-background p-1">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  id={`filter-${opt.value.toLowerCase()}-btn`}
                  onClick={() => setFilter(opt.value)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                    filter === opt.value
                      ? 'bg-surface-elevated text-text-primary shadow-sm'
                      : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  {opt.label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      filter === opt.value
                        ? 'bg-primary-muted text-primary'
                        : 'bg-surface-hover text-text-muted'
                    )}
                  >
                    {opt.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Table with admin actions */}
          <TransactionTable
            transactions={filteredTransactions}
            loading={loading}
            showUser={true}
            isAdmin={true}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </div>
    </Layout>
  );
}
