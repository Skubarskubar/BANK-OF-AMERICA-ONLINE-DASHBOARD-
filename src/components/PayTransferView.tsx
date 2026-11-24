import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeftRight,
  CheckCircle2,
  FileText,
  Landmark,
  Send,
  ShieldCheck,
  Loader2,
  PlusCircle,
} from 'lucide-react';
import {
  AUTH_CONFIG,
  CHECKING_ACCOUNT,
  SAVED_RECIPIENTS,
  Transaction,
  TransactionMethod,
  formatCurrency,
  isValidOtpCode,
} from '../data/bankData';

export type TransferMode = 'zelle' | 'wire' | 'bill' | 'deposit';

interface PayTransferViewProps {
  initialMode?: TransferMode;
  balance: number;
  onExecuteTransaction: (tx: Omit<Transaction, 'id' | 'reference' | 'date'>) => Transaction;
  onReturnToAccounts: () => void;
}

export const PayTransferView: React.FC<PayTransferViewProps> = ({
  initialMode = 'zelle',
  balance,
  onExecuteTransaction,
  onReturnToAccounts,
}) => {
  const [mode, setMode] = useState<TransferMode>(initialMode);
  const [recipientName, setRecipientName] = useState('');
  const [recipientDetail, setRecipientDetail] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Flow steps: compose -> otp (for wire or transfers >= $2,500) -> receipt
  const [step, setStep] = useState<'compose' | 'otp' | 'receipt'>('compose');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{
    tx: Transaction;
    newBalance: number;
    recipientInfo: string;
  } | null>(null);

  const parsedAmount = parseFloat(amountInput.replace(/,/g, ''));
  const isDeposit = mode === 'deposit';
  const filteredRecipients = SAVED_RECIPIENTS.filter((r) => r.type === mode);

  const resetForm = (nextMode: TransferMode) => {
    setMode(nextMode);
    setRecipientName('');
    setRecipientDetail('');
    setAmountInput('');
    setMemo('');
    setError(null);
    setOtpInput('');
    setOtpError(null);
    setStep('compose');
    setReceipt(null);
  };

  const commitTransaction = () => {
    const cleanAmount = Math.round(parsedAmount * 100) / 100;
    const signedAmount = isDeposit ? cleanAmount : -cleanAmount;

    let method: TransactionMethod = 'Zelle®';
    let category = 'Transfers';
    let description = '';
    const cleanRecipient = recipientName.trim();

    if (mode === 'zelle') {
      method = 'Zelle®';
      category = 'Transfers';
      const conf = Math.random().toString(36).slice(2, 10);
      description = `Zelle payment to ${cleanRecipient} Conf# ${conf}`;
    } else if (mode === 'wire') {
      method = 'Wire Transfer';
      category = 'Wire Transfer';
      description = `WIRE TYPE:WIRE OUT TO ${cleanRecipient.toUpperCase()}${
        recipientDetail ? ` (${recipientDetail})` : ''
      }`;
    } else if (mode === 'bill') {
      method = 'Bill Pay';
      category = 'Bill Pay';
      description = `${cleanRecipient.toUpperCase()} DES:BILL PAY ONLINE`;
    } else {
      method = 'Mobile Deposit';
      category = 'Deposits';
      description = `MOBILE CHECK DEPOSIT — ${cleanRecipient.toUpperCase()}`;
    }

    const created = onExecuteTransaction({
      description,
      merchant: mode === 'zelle' ? `${cleanRecipient} (Zelle®)` : cleanRecipient,
      category,
      method,
      amount: signedAmount,
      status: 'Posted',
      note: memo.trim() || undefined,
      location: 'Online Banking',
    });

    setReceipt({
      tx: created,
      newBalance: Math.round((balance + signedAmount) * 100) / 100,
      recipientInfo: recipientDetail.trim() || 'Instant Electronic Settlement',
    });
    setStep('receipt');
  };

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recipientName.trim()) {
      setError(
        isDeposit
          ? 'Please enter the payer or check issuer name.'
          : 'Please select or enter a recipient name.'
      );
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid dollar amount greater than $0.00.');
      return;
    }

    if (!isDeposit && parsedAmount > balance) {
      setError(
        `The transfer amount exceeds your available Adv Plus Banking balance of ${formatCurrency(
          balance
        )}.`
      );
      return;
    }

    if (isDeposit && parsedAmount > 250000) {
      setError('Single mobile check deposits are limited to $250,000.00.');
      return;
    }

    // Require 2-Step Authorization Code for wires or large outbound payments >= $5,000
    const needsOtp = !isDeposit && (mode === 'wire' || parsedAmount >= 5000);
    if (needsOtp) {
      setOtpInput('');
      setOtpError(null);
      setStep('otp');
      return;
    }

    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      commitTransaction();
    }, 340);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = otpInput.replace(/\D/g, '');
    if (cleaned.length !== 6) {
      setOtpError('Please enter your 6-digit Authorization Code.');
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      if (isValidOtpCode(cleaned)) {
        commitTransaction();
      } else {
        setOtpError(
          'Invalid Authorization Code. Please enter a valid 6-digit verification code to authorize this transfer.'
        );
      }
    }, 340);
  };

  const tabs: Array<{ id: TransferMode; label: string; icon: React.ReactNode }> = [
    { id: 'zelle', label: 'Send with Zelle®', icon: <Send className="w-4 h-4" /> },
    { id: 'wire', label: 'Transfer / Wire', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'bill', label: 'Pay Bills', icon: <FileText className="w-4 h-4" /> },
    { id: 'deposit', label: 'Deposit Funds', icon: <PlusCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 bofa-fade-in">
      <div>
        <h1 className="text-[22px] font-medium text-[#1C1C1C] tracking-[-0.01em]">
          Pay &amp; Transfer
        </h1>
        <p className="text-[13.5px] text-[#595959] mt-0.5">
          Available balance in {CHECKING_ACCOUNT.name} - {CHECKING_ACCOUNT.shortMask}:{' '}
          <strong className="font-semibold text-[#1C1C1C] tabular-nums">
            {formatCurrency(balance)}
          </strong>
        </p>
      </div>

      {/* Mode Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-white border border-[#D9DCE1] rounded-[4px] overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-[#E4E7EC]">
        {tabs.map((tab) => {
          const active = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => resetForm(tab.id)}
              className={`flex items-center justify-center gap-2 px-4 py-3.5 text-[13.5px] font-medium transition-colors cursor-pointer relative ${
                active
                  ? 'text-[#012169] bg-[#F4F8FC] font-semibold'
                  : 'text-[#4A4E54] hover:bg-[#F8F9FB] hover:text-[#1C1C1C]'
              }`}
            >
              <span className={active ? 'text-[#E31837]' : 'text-[#666B73]'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {active && (
                <span className="absolute bottom-0 inset-x-0 h-[3px] bg-[#E31837]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-8 bg-white border border-[#D9DCE1] rounded-[4px] p-6 sm:p-7 shadow-[0_1px_2px_rgba(1,33,105,0.04)]">
          {step === 'compose' && (
            <form onSubmit={handleComposeSubmit} noValidate className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#ECEEF2] pb-3.5">
                <h2 className="text-[16.5px] font-semibold text-[#012169]">
                  {mode === 'zelle' && 'Send Money with Zelle®'}
                  {mode === 'wire' && 'Domestic Wire & External Transfer'}
                  {mode === 'bill' && 'Pay a Bill'}
                  {mode === 'deposit' && 'Deposit Check / Add Funds'}
                </h2>
                <span className="text-[12px] text-[#595959]">
                  {mode === 'wire' ? 'Fee: $0.00 (Platinum Honors)' : 'No fee'}
                </span>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 border border-[#F0C2C8] border-l-4 border-l-[#C41230] bg-[#FDF3F4] px-3.5 py-3 text-[13px] text-[#7F1020]"
                >
                  <AlertCircle className="w-4 h-4 text-[#C41230] shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Source Account */}
              <div>
                <label className="block text-[13px] font-semibold text-[#333840] mb-1.5">
                  {isDeposit ? 'Deposit To' : 'From Account'}
                </label>
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#F6F8FA] border border-[#D4D8DF] rounded-[3px] text-[14px]">
                  <span className="font-medium text-[#1C1C1C]">
                    {CHECKING_ACCOUNT.name} - {CHECKING_ACCOUNT.shortMask}
                  </span>
                  <span className="font-semibold text-[#1C1C1C] tabular-nums">
                    {formatCurrency(balance)}
                  </span>
                </div>
              </div>

              {/* Recipient / Payer */}
              <div>
                <label
                  htmlFor="tx-recipient"
                  className="block text-[13px] font-semibold text-[#333840] mb-1.5"
                >
                  {mode === 'zelle' && 'Recipient Name'}
                  {mode === 'wire' && 'Recipient / Destination Account'}
                  {mode === 'bill' && 'Payee Name'}
                  {mode === 'deposit' && 'Check Issuer / Source'}
                </label>
                <input
                  id="tx-recipient"
                  type="text"
                  value={recipientName}
                  onChange={(e) => {
                    setRecipientName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={
                    mode === 'zelle'
                      ? 'e.g., Elena Vance'
                      : mode === 'wire'
                      ? 'e.g., Merrill Edge Investment Account'
                      : mode === 'bill'
                      ? 'e.g., Con Edison of New York'
                      : 'e.g., Meridian Partners LLC'
                  }
                  className="w-full h-[42px] px-3 text-[14.5px] border border-[#8A8F99] rounded-[3px] focus:border-[#0065B3] focus:outline-none focus:ring-2 focus:ring-[#0065B3]/20"
                />
              </div>

              {mode !== 'deposit' && (
                <div>
                  <label
                    htmlFor="tx-detail"
                    className="block text-[13px] font-semibold text-[#333840] mb-1.5"
                  >
                    {mode === 'zelle' && 'Email or U.S. Mobile Number (optional)'}
                    {mode === 'wire' && 'Destination Routing / Account # (optional)'}
                    {mode === 'bill' && 'Biller Account Reference (optional)'}
                  </label>
                  <input
                    id="tx-detail"
                    type="text"
                    value={recipientDetail}
                    onChange={(e) => setRecipientDetail(e.target.value)}
                    placeholder={
                      mode === 'zelle'
                        ? 'name@email.com or (555) 123-4567'
                        : mode === 'wire'
                        ? 'Account ending in 7740'
                        : 'Acct •••• 8841'
                    }
                    className="w-full h-[42px] px-3 text-[14.5px] border border-[#B2B7C0] rounded-[3px] focus:border-[#0065B3] focus:outline-none focus:ring-2 focus:ring-[#0065B3]/20"
                  />
                </div>
              )}

              {/* Amount */}
              <div>
                <label
                  htmlFor="tx-amount"
                  className="block text-[13px] font-semibold text-[#333840] mb-1.5"
                >
                  Amount (USD)
                </label>
                <div className="relative max-w-[280px]">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] font-medium text-[#595959]">
                    $
                  </span>
                  <input
                    id="tx-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amountInput}
                    onChange={(e) => {
                      setAmountInput(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="0.00"
                    className="w-full h-[44px] pl-8 pr-3 text-[17px] font-medium tabular-nums border border-[#8A8F99] rounded-[3px] focus:border-[#0065B3] focus:outline-none focus:ring-2 focus:ring-[#0065B3]/20"
                  />
                </div>
                {!isDeposit && (mode === 'wire' || parsedAmount >= 5000) && (
                  <p className="mt-1.5 text-[12px] text-[#012169] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0065B3] shrink-0" />
                    <span>
                      Requires 6-digit 2-step Authorization Code verification to complete.
                    </span>
                  </p>
                )}
              </div>

              {/* Memo */}
              <div>
                <label
                  htmlFor="tx-memo"
                  className="block text-[13px] font-semibold text-[#333840] mb-1.5"
                >
                  Memo / Note (optional)
                </label>
                <input
                  id="tx-memo"
                  type="text"
                  maxLength={90}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Add an optional description for your records"
                  className="w-full h-[40px] px-3 text-[14px] border border-[#B2B7C0] rounded-[3px] focus:border-[#0065B3] focus:outline-none focus:ring-2 focus:ring-[#0065B3]/20"
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 min-w-[168px] h-[42px] px-6 bg-[#0065B3] hover:bg-[#004E8C] text-white text-[14px] font-medium rounded-[3px] transition-colors cursor-pointer disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : mode === 'wire' || (!isDeposit && parsedAmount >= 5000) ? (
                    <span>Continue to Verify</span>
                  ) : isDeposit ? (
                    <span>Submit Deposit</span>
                  ) : mode === 'bill' ? (
                    <span>Send Payment</span>
                  ) : (
                    <span>Send Money</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onReturnToAccounts}
                  className="h-[42px] px-5 text-[14px] font-medium text-[#0065B3] hover:bg-[#F3F8FC] border border-[#D4D8DF] rounded-[3px] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* OTP Verification Step for Outbound Wire / High-Value Transfers */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-5 bofa-fade-in">
              <div className="flex items-center gap-2 border-b border-[#ECEEF2] pb-3.5">
                <ShieldCheck className="w-5 h-5 text-[#E31837]" />
                <h2 className="text-[16.5px] font-semibold text-[#012169]">
                  Authorize Transfer — 2-Step Verification
                </h2>
              </div>

              <div className="bg-[#F6F8FA] border border-[#DDE2E9] rounded-[3px] p-4 text-[13.5px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#595959]">From Account</span>
                  <span className="font-medium text-[#1C1C1C]">
                    {CHECKING_ACCOUNT.name} - {CHECKING_ACCOUNT.shortMask}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#595959]">Recipient</span>
                  <span className="font-medium text-[#1C1C1C]">{recipientName}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-[#E2E6EC]">
                  <span className="text-[#595959]">Amount</span>
                  <span className="text-[16px] font-semibold text-[#012169] tabular-nums">
                    {formatCurrency(parsedAmount)}
                  </span>
                </div>
              </div>

              <p className="text-[13.5px] text-[#4A4E54] leading-relaxed">
                Enter your 6-digit Bank of America Authorization Code sent to{' '}
                <strong className="text-[#1C1C1C] tabular-nums">
                  {AUTH_CONFIG.maskedPhone}
                </strong>{' '}
                to authorize and send this transfer.
              </p>

              {otpError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 border border-[#F0C2C8] border-l-4 border-l-[#C41230] bg-[#FDF3F4] px-3.5 py-2.5 text-[13px] text-[#7F1020]"
                >
                  <AlertCircle className="w-4 h-4 text-[#C41230] shrink-0 mt-0.5" />
                  <span>{otpError}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="transfer-otp"
                  className="block text-[13px] font-semibold text-[#1C1C1C] mb-1.5"
                >
                  6-Digit Authorization Code
                </label>
                <input
                  id="transfer-otp"
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                    if (otpError) setOtpError(null);
                  }}
                  placeholder="••••••"
                  className="w-[210px] h-[46px] px-4 text-center font-mono-code text-[20px] tracking-[0.25em] font-semibold text-[#012169] border border-[#8A8F99] rounded-[3px] focus:border-[#0065B3] focus:outline-none focus:ring-2 focus:ring-[#0065B3]/25"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 min-w-[168px] h-[42px] px-6 bg-[#0065B3] hover:bg-[#004E8C] text-white text-[14px] font-medium rounded-[3px] cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authorizing...</span>
                    </>
                  ) : (
                    <span>Verify &amp; Transfer</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('compose')}
                  className="h-[42px] px-5 text-[14px] font-medium text-[#0065B3] border border-[#D4D8DF] hover:bg-[#F4F5F7] rounded-[3px] cursor-pointer"
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {/* Confirmation Receipt */}
          {step === 'receipt' && receipt && (
            <div className="space-y-5 bofa-fade-in">
              <div className="flex items-start gap-3 pb-4 border-b border-[#ECEEF2]">
                <CheckCircle2 className="w-6 h-6 text-[#0B6B3A] shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-[18px] font-semibold text-[#1C1C1C]">
                    {isDeposit ? 'Deposit Posted' : 'Transfer Completed'}
                  </h2>
                  <p className="text-[13px] text-[#595959] mt-0.5">
                    Confirmation #{receipt.tx.reference} · {receipt.tx.date}
                  </p>
                </div>
              </div>

              <dl className="divide-y divide-[#ECEEF2] text-[13.5px]">
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#595959]">{isDeposit ? 'Source' : 'Recipient'}</dt>
                  <dd className="font-medium text-[#1C1C1C] text-right">
                    {receipt.tx.merchant}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#595959]">Method</dt>
                  <dd className="text-[#1C1C1C]">{receipt.tx.method}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#595959]">Amount</dt>
                  <dd
                    className={`font-semibold text-[15px] tabular-nums ${
                      receipt.tx.amount > 0 ? 'text-[#0B6B3A]' : 'text-[#1C1C1C]'
                    }`}
                  >
                    {formatCurrency(receipt.tx.amount, { signed: true })}
                  </dd>
                </div>
                {receipt.tx.note && (
                  <div className="py-2.5 flex justify-between gap-4">
                    <dt className="text-[#595959]">Memo</dt>
                    <dd className="text-[#333840]">{receipt.tx.note}</dd>
                  </div>
                )}
                <div className="py-3 flex justify-between gap-4 bg-[#F6F8FA] px-3 -mx-3 rounded-[2px]">
                  <dt className="font-medium text-[#333840]">Updated Available Balance</dt>
                  <dd className="font-semibold text-[#012169] text-[15px] tabular-nums">
                    {formatCurrency(receipt.newBalance)}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onReturnToAccounts}
                  className="h-[40px] px-5 bg-[#0065B3] hover:bg-[#004E8C] text-white text-[13.5px] font-medium rounded-[3px] cursor-pointer"
                >
                  Return to Accounts
                </button>
                <button
                  type="button"
                  onClick={() => resetForm(mode)}
                  className="h-[40px] px-5 border border-[#0065B3] text-[#0065B3] hover:bg-[#F3F8FC] text-[13.5px] font-medium rounded-[3px] cursor-pointer"
                >
                  Make Another {isDeposit ? 'Deposit' : 'Transfer'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Saved Recipients / Contacts Slim Rail */}
        <aside className="lg:col-span-4 space-y-5">
          {filteredRecipients.length > 0 ? (
            <div className="bg-white border border-[#D9DCE1] rounded-[4px] p-5">
              <h3 className="text-[14px] font-semibold text-[#1C1C1C] mb-3">
                {mode === 'zelle' && 'Saved Zelle® Contacts'}
                {mode === 'wire' && 'Linked Transfer Accounts'}
                {mode === 'bill' && 'Saved Payees'}
              </h3>
              <ul className="divide-y divide-[#ECEEF2]">
                {filteredRecipients.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('compose');
                        setReceipt(null);
                        setError(null);
                        setRecipientName(item.name);
                        setRecipientDetail(item.handle);
                      }}
                      className="w-full py-2.5 text-left hover:bg-[#F6F8FA] -mx-2 px-2 rounded-[3px] transition-colors cursor-pointer"
                    >
                      <div className="text-[13.5px] font-medium text-[#0065B3]">
                        {item.name}
                      </div>
                      <div className="text-[12px] text-[#595959]">
                        {item.handle} · {item.bank}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white border border-[#D9DCE1] rounded-[4px] p-5">
              <div className="flex items-center gap-2 mb-2.5">
                <Landmark className="w-4 h-4 text-[#012169]" />
                <h3 className="text-[14px] font-semibold text-[#1C1C1C]">
                  Mobile Deposit Guidelines
                </h3>
              </div>
              <p className="text-[12.5px] leading-relaxed text-[#595959]">
                Endorse the back of your paper check and include &ldquo;For Mobile
                Deposit Only at Bank of America.&rdquo; Deposits credit directly to
                Adv Plus Banking - {CHECKING_ACCOUNT.shortMask}.
              </p>
            </div>
          )}

          <div className="bg-white border border-[#D9DCE1] rounded-[4px] p-5">
            <h3 className="text-[13.5px] font-semibold text-[#012169] mb-1.5">
              Platinum Honors Transfer Benefits
            </h3>
            <p className="text-[12.5px] leading-relaxed text-[#595959]">
              $0 incoming and outgoing domestic wire transfers, waived monthly
              maintenance fees, and expedited ACH clearing protected by 2-step
              Authorization Code security.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
