import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePortfolio } from '@/context/PortfolioContext';
import { useFirestoreDoc } from '@/hooks/useFirestore';
import { formatCurrency } from '@/utils/formatters';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import TransactionTable from '@/components/TransactionTable';
import TransactionModal from '@/components/TransactionModal';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  Plus,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Dashboard Page — Investor view.
 *
 * Demonstrates:
 *  - Lifting State Up: transactions state is kept here and passed to <TransactionTable /> via props
 *  - useMemo: memoized calculation of total approved capital
 *  - useCallback: stabilized handleSubmitTransaction to prevent re-renders
 *  - useEffect + cleanup: via PortfolioContext subscription (see PortfolioContext.jsx)
 */
export default function Dashboard() {
  const { user, userData } = useAuth();
  const { transactions, loading, submitTransaction } = usePortfolio();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('deposit'); // 'deposit' | 'withdrawal'

  // Realtime user doc for live totalApprovedCapital updates
  const { data: liveUserData } = useFirestoreDoc('users', user?.uid);
  const displayUserData = liveUserData || userData;
  const currentCapital = displayUserData?.totalApprovedCapital || 0;

  // ─── useMemo: Calculate approved capital sum ────────────────────
  // Only recalculates when transactions array changes, not on every render
  const approvedCapitalSum = useMemo(() => {
    return transactions
      .filter((tx) => tx.status === 'APPROVED')
      .reduce((sum, tx) => {
        if (tx.type === 'Withdrawal') return sum - (tx.amount || 0);
        return sum + (tx.amount || 0);
      }, 0);
  }, [transactions]);

  // ─── useMemo: Calculate stats ───────────────────────────────────
  const { pendingCount, pendingAmount, approvedCount } = useMemo(() => {
    let pCount = 0;
    let pAmount = 0;
    let aCount = 0;

    transactions.forEach((tx) => {
      if (tx.status === 'PENDING') {
        pCount++;
        pAmount += tx.amount || 0;
      } else if (tx.status === 'APPROVED') {
        aCount++;
      }
    });

    return {
      pendingCount: pCount,
      pendingAmount: pAmount,
      approvedCount: aCount,
    };
  }, [transactions]);

  // ─── useCallback: Stabilized submit handler ─────────────────────
  // Prevents unnecessary re-renders of TransactionModal's submit button
  const handleSubmitDeposit = useCallback(
    async (amount, note) => {
      await submitTransaction(amount, 'Deposit', note);
    },
    [submitTransaction]
  );

  const handleSubmitWithdrawal = useCallback(
    async (amount, note) => {
      await submitTransaction(amount, 'Withdrawal', note);
    },
    [submitTransaction]
  );

  function openDeposit() {
    setModalMode('deposit');
    setModalOpen(true);
  }

  function openWithdrawal() {
    setModalMode('withdrawal');
    setModalOpen(true);
  }

  return (
    <Layout>
      <div className="animate-fade-in space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Welcome back, {displayUserData?.name?.split(' ')[0] || 'Investor'} 👋
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Here's an overview of your investment portfolio.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="new-withdrawal-btn"
              onClick={openWithdrawal}
              className={cn(
                'flex items-center gap-2 rounded-xl border border-danger/30 bg-danger-muted px-4 py-2.5',
                'text-sm font-semibold text-danger',
                'transition-all duration-200 hover:bg-danger/20 hover:shadow-sm',
                'active:scale-[0.97]'
              )}
            >
              <ArrowUpRight className="h-4 w-4" />
              Withdraw
            </button>
            <button
              id="new-deposit-btn"
              onClick={openDeposit}
              className={cn(
                'flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover px-5 py-2.5',
                'text-sm font-semibold text-background shadow-lg shadow-primary/20',
                'transition-all duration-200 hover:shadow-xl hover:shadow-primary/30',
                'active:scale-[0.97]'
              )}
            >
              <Plus className="h-4 w-4" />
              Deposit
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Approved Capital"
            value={formatCurrency(currentCapital)}
            icon={DollarSign}
            variant="primary"
          />
          <StatCard
            label="Net from Transactions"
            value={formatCurrency(approvedCapitalSum)}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            label="Pending Requests"
            value={`${pendingCount} (${formatCurrency(pendingAmount)})`}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            label="Completed Transactions"
            value={approvedCount.toString()}
            icon={CheckCircle2}
            variant="accent"
          />
        </div>

        {/* Transactions List */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Transaction History
              </h2>
              <p className="mt-0.5 text-sm text-text-muted">
                {transactions.length} total transaction{transactions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Lifting State Up: transactions owned by this parent, passed as prop to TransactionTable */}
          <TransactionTable
            transactions={transactions}
            loading={loading}
            showUser={false}
            isAdmin={false}
          />
        </div>
      </div>

      {/* Deposit / Withdrawal Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={modalMode === 'withdrawal' ? handleSubmitWithdrawal : handleSubmitDeposit}
        mode={modalMode}
        availableCapital={currentCapital}
      />
    </Layout>
  );
}
