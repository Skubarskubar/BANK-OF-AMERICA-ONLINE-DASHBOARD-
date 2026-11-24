import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeftRight,
  Check,
  ChevronRight,
  Copy,
  CreditCard,
  FileText,
  Lock,
  LogOut,
  PlusCircle,
  Search,
  Send,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { BofALogo, FdicBar } from './BofALogo';
import { BofAFooter } from './BofAFooter';
import { BankCards } from './BankCards';
import { PayTransferView, TransferMode } from './PayTransferView';
import { StatementsProfileView } from './StatementsProfileView';
import {
  AUTH_CONFIG,
  CHECKING_ACCOUNT,
  CREDIT_ACCOUNT,
  INITIAL_TRANSACTIONS,
  Transaction,
  computeTransactionsWithBalances,
  formatCurrency,
} from '../data/bankData';

type PortalTab = 'accounts' | 'transfer' | 'cards' | 'statements';

interface DashboardProps {
  verifiedOtpCode: string;
  rememberedDevice: boolean;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  verifiedOtpCode,
  rememberedDevice,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<PortalTab>('accounts');
  const [transferMode, setTransferMode] = useState<TransferMode>('zelle');
  const [checkingBalance, setCheckingBalance] = useState<number>(
    CHECKING_ACCOUNT.initialBalance
  );
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [txFilter, setTxFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<
    (Transaction & { runningBalance: number }) | null
  >(null);
  const [showAcctModal, setShowAcctModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [debitLocked, setDebitLocked] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(CHECKING_ACCOUNT.dailyPurchaseLimit);
  const [infoModal, setInfoModal] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    const titles: Record<PortalTab, string> = {
      accounts: 'Bank of America | Online Banking | Accounts Overview',
      transfer: 'Bank of America | Online Banking | Pay & Transfer',
      cards: 'Bank of America | Online Banking | Cards & Details',
      statements: 'Bank of America | Online Banking | Statements & Profile',
    };
    document.title = titles[activeTab];
  }, [activeTab]);

  const txWithBalances = useMemo(
    () => computeTransactionsWithBalances(transactions, checkingBalance),
    [transactions, checkingBalance]
  );

  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return txWithBalances.filter((tx) => {
      if (txFilter === 'deposit' && tx.amount <= 0) return false;
      if (txFilter === 'withdrawal' && tx.amount >= 0) return false;
      if (!q) return true;
      return (
        tx.description.toLowerCase().includes(q) ||
        tx.merchant.toLowerCase().includes(q) ||
        tx.method.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.date.includes(q)
      );
    });
  }, [txWithBalances, txFilter, searchQuery]);

  const cashFlowSummary = useMemo(() => {
    let inflows = 0;
    let outflows = 0;
    for (const tx of transactions) {
      if (tx.amount > 0) inflows += tx.amount;
      else outflows += Math.abs(tx.amount);
    }
    const total = inflows + outflows || 1;
    return {
      inflows: Math.round(inflows * 100) / 100,
      outflows: Math.round(outflows * 100) / 100,
      inflowPct: Math.min(100, Math.max(8, Math.round((inflows / total) * 100))),
    };
  }, [transactions]);

  const handleExecuteTransaction = (
    input: Omit<Transaction, 'id' | 'reference' | 'date'>
  ): Transaction => {
    const today = '05/13/2026';
    const refDigits = String(Math.floor(100000 + Math.random() * 900000));
    const created: Transaction = {
      ...input,
      id: `tx-${Date.now()}`,
      reference: `BOA260513${refDigits}`,
      date: today,
    };

    setCheckingBalance((prev) => Math.round((prev + input.amount) * 100) / 100);
    setTransactions((prev) => [created, ...prev]);
    return created;
  };

  const openTransferMode = (mode: TransferMode) => {
    setTransferMode(mode);
    setActiveTab('transfer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyValue = (key: string, value: string) => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1800);
  };

  const navItems: Array<{ id: PortalTab; label: string }> = [
    { id: 'accounts', label: 'Accounts' },
    { id: 'transfer', label: 'Pay & Transfer' },
    { id: 'cards', label: 'Cards & Services' },
    { id: 'statements', label: 'Statements & Profile' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6]">
      {/* Subtle Official FDIC Bar */}
      <div className="bg-[#F6F7F9] border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2 min-h-[32px] py-1">
          <FdicBar compact />
          <div className="hidden md:flex items-center gap-4 text-[11.5px] text-[#52565C]">
            <button
              type="button"
              onClick={() => setActiveTab('statements')}
              className="inline-flex items-center gap-1 hover:text-[#012169] hover:underline cursor-pointer"
            >
              <User className="w-3 h-3" />
              <span>Profile &amp; Settings</span>
            </button>
            <span className="text-[#D0D5DD]" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1 font-medium text-[#C41230] hover:underline cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main White Bank of America Portal Header */}
      <header className="bg-white border-b border-[#D9DCE1] sticky top-0 z-30">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-8">
          {/* Logo Row */}
          <div className="py-3.5 sm:py-4 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('accounts')}
              aria-label="Bank of America Accounts Overview"
              className="inline-flex items-center cursor-pointer"
            >
              <BofALogo height={26} className="hidden sm:block -mt-1" />
              <BofALogo height={20} className="block sm:hidden -mt-0.5 max-w-[205px]" />
            </button>

            <div className="flex items-center gap-3 sm:gap-5">
              <div className="hidden sm:flex items-center gap-1.5 text-[12px] text-[#4A4E54]">
                <Lock className="w-3.5 h-3.5 text-[#0B6B3A]" strokeWidth={2} />
                <span>2-Step Verified</span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium text-[#1C1C1C] hover:text-[#C41230] border border-[#D4D8DF] hover:border-[#C41230]/40 rounded-[3px] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Primary Navigation Bar with Authentic Crimson Active Line */}
          <nav
            aria-label="Online Banking sections"
            className="flex items-center gap-1 sm:gap-7 -mb-px overflow-x-auto border-t border-[#ECEEF2]"
          >
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative py-3 px-2.5 sm:px-0.5 text-[13.5px] sm:text-[14px] whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'font-semibold text-[#012169]'
                      : 'font-normal text-[#4A4E54] hover:text-[#012169]'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E31837]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 mx-auto w-full max-w-[1120px] px-4 sm:px-8 py-7 sm:py-8">
        {activeTab === 'accounts' && (
          <div className="space-y-6 bofa-fade-in">
            {/* Greeting Row */}
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="text-[23px] sm:text-[26px] font-normal text-[#1C1C1C] tracking-[-0.015em]">
                  Hello, <span className="font-medium">{AUTH_CONFIG.displayName}</span>
                </h1>
                <span className="text-[12.5px] font-medium text-[#012169]">
                  {AUTH_CONFIG.tier}
                </span>
              </div>
              <span className="text-[12px] text-[#666B73]">
                Online Banking · Member FDIC
              </span>
            </div>

            {/* Asymmetric Authentic BofA Two-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Primary Left Column (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Personal Accounts Card — Signature Bank of America Crimson Top Stripe */}
                <section
                  aria-label="Personal accounts summary"
                  className="bg-white border border-[#D9DCE1] border-t-[3px] border-t-[#E31837] rounded-[4px] shadow-[0_1px_3px_rgba(1,33,105,0.05)] overflow-hidden"
                >
                  {/* Section Title Bar */}
                  <div className="px-5 sm:px-6 py-3.5 bg-[#FAFBFD] border-b border-[#E5E7EB] flex items-center justify-between gap-3">
                    <h2 className="text-[14.5px] font-semibold text-[#012169]">
                      Personal accounts
                    </h2>
                    <div className="text-[12.5px] text-[#595959] tabular-nums">
                      Total deposit balance:{' '}
                      <span className="font-semibold text-[#1C1C1C]">
                        {formatCurrency(checkingBalance)}
                      </span>
                    </div>
                  </div>

                  {/* Primary Checking Row — Focal $300,000.00 Balance */}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <button
                          type="button"
                          onClick={() => setShowAcctModal(true)}
                          className="text-left text-[17px] font-semibold text-[#0065B3] hover:text-[#004E8C] hover:underline cursor-pointer"
                        >
                          {CHECKING_ACCOUNT.name} - {CHECKING_ACCOUNT.shortMask}
                        </button>
                        <p className="text-[12.5px] text-[#595959] mt-1">
                          Personal Checking · Routing{' '}
                          <span className="font-mono-code text-[12px] text-[#333840]">
                            {CHECKING_ACCOUNT.routingPaper}
                          </span>
                          {debitLocked && (
                            <span className="ml-2 text-[#C41230] font-medium">
                              · Debit Card Locked
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <p
                          data-testid="checking-balance"
                          className="text-[32px] sm:text-[36px] font-semibold leading-none tracking-[-0.02em] text-[#1C1C1C] tabular-nums"
                        >
                          {formatCurrency(checkingBalance)}
                        </p>
                        <p className="text-[12px] text-[#595959] mt-1.5">
                          Available balance
                        </p>
                      </div>
                    </div>

                    {/* Inline Classic BofA Quick Action Links */}
                    <div className="mt-5 pt-4 border-t border-[#ECEEF2] flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-[#0065B3]">
                      <button
                        type="button"
                        onClick={() => openTransferMode('zelle')}
                        className="hover:text-[#004E8C] hover:underline cursor-pointer"
                      >
                        Send with Zelle®
                      </button>
                      <button
                        type="button"
                        onClick={() => openTransferMode('wire')}
                        className="hover:text-[#004E8C] hover:underline cursor-pointer"
                      >
                        Transfer / Wire
                      </button>
                      <button
                        type="button"
                        onClick={() => openTransferMode('bill')}
                        className="hover:text-[#004E8C] hover:underline cursor-pointer"
                      >
                        Pay Bills
                      </button>
                      <button
                        type="button"
                        onClick={() => openTransferMode('deposit')}
                        className="hover:text-[#004E8C] hover:underline cursor-pointer"
                      >
                        Deposit Check
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAcctModal(true)}
                        className="hover:text-[#004E8C] hover:underline cursor-pointer"
                      >
                        Account &amp; Routing #
                      </button>
                    </div>
                  </div>

                  {/* Secondary Linked Credit Card Summary Row ($0.00 balance) */}
                  <div className="px-5 sm:px-6 py-4 bg-[#FAFBFD] border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('cards')}
                        className="text-[14.5px] font-medium text-[#0065B3] hover:text-[#004E8C] hover:underline text-left cursor-pointer"
                      >
                        {CREDIT_ACCOUNT.name} - {CREDIT_ACCOUNT.shortMask}
                      </button>
                      <p className="text-[12px] text-[#595959] mt-0.5 tabular-nums">
                        Credit limit {formatCurrency(CREDIT_ACCOUNT.creditLimit)} · Payment due{' '}
                        {CREDIT_ACCOUNT.nextDueDate}
                      </p>
                    </div>
                    <div className="text-right tabular-nums">
                      <p className="text-[18px] font-semibold text-[#1C1C1C]">
                        {formatCurrency(CREDIT_ACCOUNT.balance)}
                      </p>
                      <p className="text-[11.5px] text-[#595959]">Current balance</p>
                    </div>
                  </div>
                </section>

                {/* Recent Activity / Transaction History Ledger */}
                <section
                  aria-label="Recent transaction activity"
                  className="bg-white border border-[#D9DCE1] rounded-[4px] shadow-[0_1px_3px_rgba(1,33,105,0.04)] overflow-hidden"
                >
                  <div className="px-5 sm:px-6 py-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-[15.5px] font-semibold text-[#1C1C1C]">
                        Activity
                      </h2>
                      <p className="text-[12px] text-[#595959]">
                        {CHECKING_ACCOUNT.name} - {CHECKING_ACCOUNT.shortMask} ·{' '}
                        {filteredTransactions.length}{' '}
                        {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Search input */}
                      <div className="relative flex-1 sm:flex-initial">
                        <Search
                          className="w-3.5 h-3.5 text-[#6E747D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                          strokeWidth={2}
                        />
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search activity"
                          aria-label="Search transactions"
                          className="w-full sm:w-[175px] h-[34px] pl-8 pr-2.5 text-[12.5px] bg-white border border-[#C9CED6] rounded-[3px] focus:border-[#0065B3] focus:outline-none"
                        />
                      </div>

                      {/* Minimal Filter Selector */}
                      <div
                        className="inline-flex border border-[#C9CED6] rounded-[3px] overflow-hidden text-[12px]"
                        role="group"
                        aria-label="Filter transactions"
                      >
                        {(
                          [
                            { id: 'all', label: 'All' },
                            { id: 'deposit', label: 'Deposits' },
                            { id: 'withdrawal', label: 'Withdrawals' },
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setTxFilter(opt.id)}
                            className={`px-2.5 h-[32px] font-medium transition-colors cursor-pointer ${
                              txFilter === opt.id
                                ? 'bg-[#012169] text-white'
                                : 'bg-white text-[#4A4E54] hover:bg-[#F3F5F8]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Table Desktop + Clean Rows Mobile */}
                  {filteredTransactions.length === 0 ? (
                    <div className="px-6 py-10 text-center text-[13.5px] text-[#595959]">
                      No transactions match your current filter.{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setTxFilter('all');
                        }}
                        className="text-[#0065B3] hover:underline font-medium cursor-pointer"
                      >
                        Reset filter
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB] text-[11.5px] font-semibold uppercase tracking-[0.03em] text-[#595959]">
                            <th className="py-2.5 pl-5 sm:pl-6 pr-3 whitespace-nowrap">
                              Posting Date
                            </th>
                            <th className="py-2.5 px-3">Description</th>
                            <th className="py-2.5 px-3 hidden sm:table-cell whitespace-nowrap">
                              Type
                            </th>
                            <th className="py-2.5 px-3 text-right whitespace-nowrap">
                              Amount
                            </th>
                            <th className="py-2.5 pl-3 pr-5 sm:pr-6 text-right hidden md:table-cell whitespace-nowrap">
                              Available Balance
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ECEEF2] text-[13px]">
                          {filteredTransactions.map((tx) => {
                            const isCredit = tx.amount > 0;
                            return (
                              <tr
                                key={tx.id}
                                onClick={() => setSelectedTx(tx)}
                                className="hover:bg-[#F4F8FC] transition-colors cursor-pointer group"
                              >
                                <td className="py-3.5 pl-5 sm:pl-6 pr-3 text-[#4A4E54] tabular-nums whitespace-nowrap align-top">
                                  {tx.date}
                                </td>
                                <td className="py-3.5 px-3 align-top">
                                  <div className="font-medium text-[#1C1C1C] group-hover:text-[#0065B3] leading-snug">
                                    {tx.merchant}
                                  </div>
                                  <div className="text-[11.5px] text-[#666B73] truncate max-w-[240px] sm:max-w-[310px] mt-0.5">
                                    {tx.description}
                                  </div>
                                </td>
                                <td className="py-3.5 px-3 text-[#595959] hidden sm:table-cell whitespace-nowrap align-top text-[12.5px]">
                                  {tx.method}
                                </td>
                                <td
                                  className={`py-3.5 px-3 text-right font-semibold tabular-nums whitespace-nowrap align-top ${
                                    isCredit ? 'text-[#0B6B3A]' : 'text-[#1C1C1C]'
                                  }`}
                                >
                                  {formatCurrency(tx.amount, { signed: true })}
                                </td>
                                <td className="py-3.5 pl-3 pr-5 sm:pr-6 text-right text-[#4A4E54] tabular-nums whitespace-nowrap hidden md:table-cell align-top">
                                  {formatCurrency(tx.runningBalance)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>

              {/* Restrained Secondary Right Rail (4 cols) */}
              <aside className="lg:col-span-4 space-y-5">
                {/* Activity Center / Quick Actions */}
                <section className="bg-white border border-[#D9DCE1] rounded-[4px] shadow-[0_1px_2px_rgba(1,33,105,0.04)] overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-[#E5E7EB] border-t-[3px] border-t-[#012169]">
                    <h2 className="text-[14.5px] font-semibold text-[#012169]">
                      Activity Center
                    </h2>
                  </div>
                  <ul className="divide-y divide-[#ECEEF2] text-[13.5px]">
                    {[
                      {
                        label: 'Send Money with Zelle®',
                        icon: <Send className="w-4 h-4 text-[#012169]" strokeWidth={1.8} />,
                        onClick: () => openTransferMode('zelle'),
                      },
                      {
                        label: 'Transfer & Wire Money',
                        icon: (
                          <ArrowLeftRight
                            className="w-4 h-4 text-[#012169]"
                            strokeWidth={1.8}
                          />
                        ),
                        onClick: () => openTransferMode('wire'),
                      },
                      {
                        label: 'Pay a Bill',
                        icon: <FileText className="w-4 h-4 text-[#012169]" strokeWidth={1.8} />,
                        onClick: () => openTransferMode('bill'),
                      },
                      {
                        label: 'Deposit Funds',
                        icon: <PlusCircle className="w-4 h-4 text-[#012169]" strokeWidth={1.8} />,
                        onClick: () => openTransferMode('deposit'),
                      },
                      {
                        label: 'Manage Cards & Lock',
                        icon: <CreditCard className="w-4 h-4 text-[#012169]" strokeWidth={1.8} />,
                        onClick: () => setActiveTab('cards'),
                      },
                    ].map((action) => (
                      <li key={action.label}>
                        <button
                          type="button"
                          onClick={action.onClick}
                          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-[#F5F8FC] transition-colors cursor-pointer group"
                        >
                          <span className="inline-flex items-center gap-3 text-[#1C1C1C] font-medium group-hover:text-[#0065B3]">
                            {action.icon}
                            <span>{action.label}</span>
                          </span>
                          <ChevronRight className="w-4 h-4 text-[#8C939E] group-hover:text-[#0065B3]" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Cash Flow Summary Card */}
                <section className="bg-white border border-[#D9DCE1] rounded-[4px] p-5 shadow-[0_1px_2px_rgba(1,33,105,0.04)]">
                  <div className="flex items-center justify-between mb-3.5">
                    <h2 className="text-[14px] font-semibold text-[#1C1C1C]">
                      Statement Cycle Cash Flow
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('statements')}
                      className="text-[12px] text-[#0065B3] hover:underline cursor-pointer"
                    >
                      Statements
                    </button>
                  </div>

                  <div className="space-y-2.5 text-[13px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#595959]">Deposits &amp; credits</span>
                      <span className="font-semibold text-[#0B6B3A] tabular-nums">
                        +{formatCurrency(cashFlowSummary.inflows)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#595959]">Withdrawals &amp; payments</span>
                      <span className="font-semibold text-[#1C1C1C] tabular-nums">
                        -{formatCurrency(cashFlowSummary.outflows)}
                      </span>
                    </div>
                  </div>

                  {/* Clean institutional horizontal bar */}
                  <div className="mt-3.5 h-[6px] w-full bg-[#E5E7EB] rounded-[2px] overflow-hidden flex">
                    <div
                      className="bg-[#0B6B3A] h-full"
                      style={{ width: `${cashFlowSummary.inflowPct}%` }}
                    />
                    <div className="bg-[#012169] h-full flex-1" />
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-[#ECEEF2] flex items-center justify-between text-[12px]">
                    <span className="text-[#595959]">Wire Routing</span>
                    <button
                      type="button"
                      onClick={() => copyValue('wire', CHECKING_ACCOUNT.routingWire)}
                      className="inline-flex items-center gap-1.5 font-mono-code font-medium text-[#0065B3] hover:underline cursor-pointer"
                    >
                      <span>{CHECKING_ACCOUNT.routingWire}</span>
                      {copiedKey === 'wire' ? (
                        <Check className="w-3.5 h-3.5 text-[#0B6B3A]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </section>

                {/* Quiet Security Trust Note */}
                <div className="px-1 flex items-start gap-2 text-[11.5px] leading-relaxed text-[#595959]">
                  <ShieldCheck className="w-4 h-4 text-[#012169] shrink-0 mt-0.5" />
                  <p>
                    Session protected by 2-step Authorization Code verification
                    and FDIC deposit coverage through Bank of America, N.A.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        )}

        {activeTab === 'transfer' && (
          <PayTransferView
            key={transferMode}
            initialMode={transferMode}
            balance={checkingBalance}
            onExecuteTransaction={handleExecuteTransaction}
            onReturnToAccounts={() => setActiveTab('accounts')}
          />
        )}

        {activeTab === 'cards' && (
          <BankCards
            checkingBalance={checkingBalance}
            debitLocked={debitLocked}
            onToggleDebitLock={() => setDebitLocked((v) => !v)}
            dailyLimit={dailyLimit}
            onChangeDailyLimit={setDailyLimit}
            onNavigateTransfer={() => openTransferMode('bill')}
          />
        )}

        {activeTab === 'statements' && (
          <StatementsProfileView
            currentBalance={checkingBalance}
            transactions={txWithBalances}
            verifiedOtpCode={verifiedOtpCode}
            rememberedDevice={rememberedDevice}
          />
        )}
      </main>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelectedTx(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tx-detail-title"
            className="bg-white w-full max-w-[480px] rounded-[4px] border border-[#D4D8DF] shadow-xl overflow-hidden bofa-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] border-t-[3px] border-t-[#E31837]">
              <h3 id="tx-detail-title" className="text-[15.5px] font-semibold text-[#012169]">
                Transaction Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                aria-label="Close transaction details"
                className="text-[#595959] hover:text-[#1C1C1C] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="pb-4 border-b border-[#ECEEF2]">
                <p className="text-[12px] text-[#595959]">{selectedTx.date} · {selectedTx.status}</p>
                <p className="text-[16px] font-semibold text-[#1C1C1C] mt-0.5">
                  {selectedTx.merchant}
                </p>
                <p
                  className={`text-[26px] font-semibold tabular-nums mt-2 ${
                    selectedTx.amount > 0 ? 'text-[#0B6B3A]' : 'text-[#1C1C1C]'
                  }`}
                >
                  {formatCurrency(selectedTx.amount, { signed: true })}
                </p>
              </div>

              <dl className="space-y-2.5 text-[13px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-[#595959]">Account</dt>
                  <dd className="text-[#1C1C1C] font-medium">
                    {CHECKING_ACCOUNT.name} - {CHECKING_ACCOUNT.shortMask}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#595959]">Type</dt>
                  <dd className="text-[#1C1C1C]">{selectedTx.method}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#595959]">Reference #</dt>
                  <dd className="font-mono-code text-[12.5px] text-[#1C1C1C]">
                    {selectedTx.reference}
                  </dd>
                </div>
                {selectedTx.location && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#595959]">Location</dt>
                    <dd className="text-[#1C1C1C]">{selectedTx.location}</dd>
                  </div>
                )}
                {selectedTx.note && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#595959]">Note</dt>
                    <dd className="text-[#1C1C1C] text-right">{selectedTx.note}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 pt-2 border-t border-[#ECEEF2]">
                  <dt className="text-[#595959]">Balance after transaction</dt>
                  <dd className="font-semibold text-[#012169] tabular-nums">
                    {formatCurrency(selectedTx.runningBalance)}
                  </dd>
                </div>
              </dl>

              <p className="text-[11.5px] text-[#666B73] bg-[#F7F8FA] p-3 rounded-[3px] border border-[#ECEEF2] break-words">
                <strong className="font-medium text-[#4A4E54]">Statement description:</strong>{' '}
                {selectedTx.description}
              </p>
            </div>

            <div className="px-6 py-3.5 bg-[#F6F7F9] border-t border-[#E5E7EB] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2 bg-[#0065B3] hover:bg-[#004E8C] text-white text-[13px] font-medium rounded-[3px] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account & Routing Numbers Modal */}
      {showAcctModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setShowAcctModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="acct-modal-title"
            className="bg-white w-full max-w-[480px] rounded-[4px] border border-[#D4D8DF] shadow-xl overflow-hidden bofa-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] border-t-[3px] border-t-[#012169]">
              <h3 id="acct-modal-title" className="text-[15.5px] font-semibold text-[#012169]">
                {CHECKING_ACCOUNT.name} — Account Details
              </h3>
              <button
                type="button"
                onClick={() => setShowAcctModal(false)}
                aria-label="Close account details"
                className="text-[#595959] hover:text-[#1C1C1C] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5">
              <dl className="divide-y divide-[#ECEEF2] text-[13.5px]">
                {[
                  { label: 'Account Holder', value: AUTH_CONFIG.displayName, copy: false },
                  {
                    label: 'Available Balance',
                    value: formatCurrency(checkingBalance),
                    copy: false,
                  },
                  {
                    label: 'Account Number',
                    value: CHECKING_ACCOUNT.fullAccountNumber,
                    raw: CHECKING_ACCOUNT.fullAccountNumber.replace(/\s/g, ''),
                    copy: true,
                  },
                  {
                    label: 'Paper & Electronic (ACH) Routing',
                    value: CHECKING_ACCOUNT.routingPaper,
                    raw: CHECKING_ACCOUNT.routingPaper,
                    copy: true,
                  },
                  {
                    label: 'Wire Transfer Routing',
                    value: CHECKING_ACCOUNT.routingWire,
                    raw: CHECKING_ACCOUNT.routingWire,
                    copy: true,
                  },
                  {
                    label: 'SWIFT Code',
                    value: CHECKING_ACCOUNT.swiftCode,
                    raw: CHECKING_ACCOUNT.swiftCode,
                    copy: true,
                  },
                ].map((row) => (
                  <div key={row.label} className="py-3 flex items-center justify-between gap-3">
                    <dt className="text-[#595959]">{row.label}</dt>
                    <dd className="flex items-center gap-2 font-medium text-[#1C1C1C] tabular-nums">
                      <span className={row.copy ? 'font-mono-code text-[13px]' : ''}>
                        {row.value}
                      </span>
                      {row.copy && row.raw && (
                        <button
                          type="button"
                          onClick={() => copyValue(row.label, row.raw!)}
                          aria-label={`Copy ${row.label}`}
                          className="p-1 text-[#0065B3] hover:text-[#004E8C] cursor-pointer"
                        >
                          {copiedKey === row.label ? (
                            <Check className="w-3.5 h-3.5 text-[#0B6B3A]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="px-6 py-3.5 bg-[#F6F7F9] border-t border-[#E5E7EB] flex justify-end">
              <button
                type="button"
                onClick={() => setShowAcctModal(false)}
                className="px-5 py-2 bg-[#0065B3] hover:bg-[#004E8C] text-white text-[13px] font-medium rounded-[3px] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info Modal */}
      {infoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setInfoModal(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white w-full max-w-[460px] rounded-[4px] border border-[#D4D8DF] shadow-xl overflow-hidden bofa-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] border-t-[3px] border-t-[#E31837]">
              <h3 className="text-[15.5px] font-semibold text-[#012169]">{infoModal.title}</h3>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                aria-label="Close dialog"
                className="p-1 text-[#595959] hover:text-[#1C1C1C] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 text-[13.5px] leading-relaxed text-[#333840]">
              {infoModal.body}
            </div>
            <div className="px-6 py-3.5 bg-[#F6F7F9] border-t border-[#E5E7EB] flex justify-end">
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="px-5 py-2 bg-[#0065B3] hover:bg-[#004E8C] text-white text-[13px] font-medium rounded-[3px] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <BofAFooter onInfoLink={(title, body) => setInfoModal({ title, body })} />
    </div>
  );
};
