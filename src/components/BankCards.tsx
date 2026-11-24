import React, { useState } from 'react';
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Shield,
  SlidersHorizontal,
  Unlock,
  Wifi,
} from 'lucide-react';
import { BofALogo, BofAFlagscape } from './BofALogo';
import {
  AUTH_CONFIG,
  CHECKING_ACCOUNT,
  CREDIT_ACCOUNT,
  formatCurrency,
} from '../data/bankData';

interface BankCardsProps {
  checkingBalance: number;
  debitLocked: boolean;
  onToggleDebitLock: () => void;
  dailyLimit: number;
  onChangeDailyLimit: (limit: number) => void;
  onNavigateTransfer: () => void;
}

export const BankCards: React.FC<BankCardsProps> = ({
  checkingBalance,
  debitLocked,
  onToggleDebitLock,
  dailyLimit,
  onChangeDailyLimit,
  onNavigateTransfer,
}) => {
  const [revealNumbers, setRevealNumbers] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [limitSaved, setLimitSaved] = useState(false);
  const [draftLimit, setDraftLimit] = useState(dailyLimit);

  const handleCopy = (label: string, val: string) => {
    navigator.clipboard?.writeText(val).catch(() => {});
    setCopiedField(label);
    window.setTimeout(() => setCopiedField(null), 1800);
  };

  const handleSaveLimit = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeDailyLimit(draftLimit);
    setLimitSaved(true);
    window.setTimeout(() => setLimitSaved(false), 2400);
  };

  return (
    <div className="space-y-6 bofa-fade-in">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-medium text-[#1C1C1C] tracking-[-0.01em]">
            Cards &amp; Account Details
          </h1>
          <p className="text-[13.5px] text-[#595959] mt-0.5">
            Manage debit card controls, limits, routing numbers, and linked credit cards.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRevealNumbers((v) => !v)}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0065B3] hover:text-[#004E8C] hover:underline cursor-pointer"
        >
          {revealNumbers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{revealNumbers ? 'Hide card numbers' : 'Reveal card details'}</span>
        </button>
      </div>

      {/* Cards Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Debit Card */}
        <section className="bg-white border border-[#D9DCE1] rounded-[4px] p-6 shadow-[0_1px_2px_rgba(1,33,105,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-[15.5px] font-semibold text-[#1C1C1C]">
                  Bank of America Visa® Debit Card
                </h2>
                <p className="text-[12.5px] text-[#595959]">
                  Linked to {CHECKING_ACCOUNT.name} - {CHECKING_ACCOUNT.shortMask}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11.5px] font-semibold rounded-[3px] border ${
                  debitLocked
                    ? 'bg-[#FDF3F4] text-[#A31027] border-[#F0C2C8]'
                    : 'bg-[#F1FAF5] text-[#0B6B3A] border-[#C0E2CF]'
                }`}
              >
                {debitLocked ? (
                  <>
                    <Lock className="w-3 h-3" /> Locked
                  </>
                ) : (
                  'Active'
                )}
              </span>
            </div>

            {/* Authentic Navy BofA Debit Card */}
            <div
              className={`relative overflow-hidden rounded-[10px] p-5 sm:p-6 text-white aspect-[1.586/1] max-w-[380px] flex flex-col justify-between transition-opacity shadow-md ${
                debitLocked ? 'opacity-65' : ''
              }`}
              style={{
                background:
                  'linear-gradient(135deg, #012169 0%, #06307E 55%, #00184D 100%)',
              }}
            >
              {/* Subtle architectural red/blue corner stripe echoing Bank of America physical card */}
              <div
                aria-hidden="true"
                className="absolute right-[-22px] top-[24%] opacity-[0.14] pointer-events-none"
              >
                <BofAFlagscape size={200} monochrome="#FFFFFF" />
              </div>
              <div
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#E31837]"
              />

              <div className="relative flex items-start justify-between">
                <BofALogo height={15} variant="white" />
                <span className="text-[10px] tracking-[0.14em] uppercase text-white/75 font-medium">
                  Debit
                </span>
              </div>

              <div className="relative flex items-center gap-3 my-1">
                {/* Metallic Gold Chip */}
                <div className="w-[40px] h-[30px] rounded-[5px] bg-gradient-to-br from-[#F0DB9E] via-[#D8BC71] to-[#B79647] border border-[#F7E9BC]/50 relative overflow-hidden">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-[#8A6D27]/45" />
                  <div className="absolute inset-y-0 left-1/3 w-px bg-[#8A6D27]/45" />
                  <div className="absolute inset-y-0 right-1/3 w-px bg-[#8A6D27]/45" />
                </div>
                <Wifi className="w-4 h-4 rotate-90 text-white/75" strokeWidth={2} />
              </div>

              <div className="relative space-y-2">
                <p className="font-mono-code text-[15px] sm:text-[16px] tracking-[0.14em] text-white/95">
                  {revealNumbers
                    ? `4400 6628 1904 ${CHECKING_ACCOUNT.cardLast4}`
                    : `••••  ••••  ••••  ${CHECKING_ACCOUNT.cardLast4}`}
                </p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.12em] text-white/60">
                      Cardholder
                    </p>
                    <p className="text-[12px] tracking-[0.08em] font-medium uppercase">
                      {AUTH_CONFIG.displayName}
                    </p>
                  </div>
                  <div className="flex items-end gap-4">
                    <div className="text-right">
                      <p className="text-[8.5px] uppercase tracking-[0.1em] text-white/60">
                        Valid Thru
                      </p>
                      <p className="font-mono-code text-[11.5px]">
                        {CHECKING_ACCOUNT.cardExpiry}
                      </p>
                    </div>
                    <span className="text-[16px] font-bold italic tracking-tight leading-none text-white">
                      VISA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Controls */}
          <div className="mt-5 pt-4 border-t border-[#E6E9EE] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="block text-[11.5px] text-[#595959]">Available Balance</span>
              <span className="text-[16px] font-semibold text-[#1C1C1C] tabular-nums">
                {formatCurrency(checkingBalance)}
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleDebitLock}
              className={`inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-[3px] border transition-colors cursor-pointer ${
                debitLocked
                  ? 'bg-[#0065B3] border-[#0065B3] text-white hover:bg-[#004E8C]'
                  : 'bg-white border-[#B9C0CA] text-[#1C1C1C] hover:bg-[#F4F5F7]'
              }`}
            >
              {debitLocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock Card</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Card Temporarily</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Credit Card */}
        <section className="bg-white border border-[#D9DCE1] rounded-[4px] p-6 shadow-[0_1px_2px_rgba(1,33,105,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-[15.5px] font-semibold text-[#1C1C1C]">
                  {CREDIT_ACCOUNT.name}
                </h2>
                <p className="text-[12.5px] text-[#595959]">
                  3% cash back category: Online Shopping · Rewards: {formatCurrency(CREDIT_ACCOUNT.cashBackBalance)}
                </p>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 text-[11.5px] font-semibold rounded-[3px] border bg-[#F1FAF5] text-[#0B6B3A] border-[#C0E2CF]">
                Paid in Full
              </span>
            </div>

            {/* Iconic Bank of America Crimson Visa Card */}
            <div
              className="relative overflow-hidden rounded-[10px] p-5 sm:p-6 text-white aspect-[1.586/1] max-w-[380px] flex flex-col justify-between shadow-md"
              style={{
                background:
                  'linear-gradient(135deg, #D91634 0%, #B4102A 58%, #820B1F 100%)',
              }}
            >
              <div
                aria-hidden="true"
                className="absolute right-[-20px] top-[20%] opacity-[0.16] pointer-events-none"
              >
                <BofAFlagscape size={205} monochrome="#FFFFFF" />
              </div>

              <div className="relative flex items-start justify-between">
                <BofALogo height={15} variant="white" />
                <span className="text-[9.5px] tracking-[0.1em] uppercase text-white/80 font-medium">
                  Cash Rewards
                </span>
              </div>

              <div className="relative flex items-center gap-3 my-1">
                <div className="w-[40px] h-[30px] rounded-[5px] bg-gradient-to-br from-[#F1F3F5] via-[#CFD5DC] to-[#A6AEB8] border border-white/50 relative overflow-hidden">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-[#626A75]/45" />
                  <div className="absolute inset-y-0 left-1/3 w-px bg-[#626A75]/45" />
                  <div className="absolute inset-y-0 right-1/3 w-px bg-[#626A75]/45" />
                </div>
                <Wifi className="w-4 h-4 rotate-90 text-white/80" strokeWidth={2} />
              </div>

              <div className="relative space-y-2">
                <p className="font-mono-code text-[15px] sm:text-[16px] tracking-[0.14em] text-white/95">
                  {revealNumbers
                    ? `4147 2029 8831 ${CREDIT_ACCOUNT.shortMask}`
                    : `••••  ••••  ••••  ${CREDIT_ACCOUNT.shortMask}`}
                </p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.12em] text-white/70">
                      Cardholder
                    </p>
                    <p className="text-[12px] tracking-[0.08em] font-medium uppercase">
                      {AUTH_CONFIG.displayName}
                    </p>
                  </div>
                  <div className="flex items-end gap-4">
                    <div className="text-right">
                      <p className="text-[8.5px] uppercase tracking-[0.1em] text-white/70">
                        Valid Thru
                      </p>
                      <p className="font-mono-code text-[11.5px]">
                        {CREDIT_ACCOUNT.cardExpiry}
                      </p>
                    </div>
                    <div className="text-right leading-none">
                      <span className="block text-[15px] font-bold italic tracking-tight text-white">
                        VISA
                      </span>
                      <span className="block text-[7.5px] tracking-[0.12em] uppercase text-white/80">
                        Signature
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#E6E9EE] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-6">
              <div>
                <span className="block text-[11.5px] text-[#595959]">Current Balance</span>
                <span className="text-[16px] font-semibold text-[#1C1C1C] tabular-nums">
                  {formatCurrency(CREDIT_ACCOUNT.balance)}
                </span>
              </div>
              <div>
                <span className="block text-[11.5px] text-[#595959]">Available Credit</span>
                <span className="text-[16px] font-semibold text-[#0B6B3A] tabular-nums">
                  {formatCurrency(CREDIT_ACCOUNT.availableCredit)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onNavigateTransfer}
              className="px-4 py-2 text-[13px] font-medium text-[#0065B3] hover:text-[#004E8C] border border-[#0065B3] rounded-[3px] hover:bg-[#F3F8FC] transition-colors cursor-pointer"
            >
              Make Payment
            </button>
          </div>
        </section>
      </div>

      {/* Bottom Row: Account / Routing Info & Daily Purchase Limit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-[#D9DCE1] rounded-[4px] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-[#012169]" strokeWidth={1.9} />
            <h2 className="text-[15.5px] font-semibold text-[#1C1C1C]">
              Direct Deposit &amp; Routing Numbers
            </h2>
          </div>

          <dl className="divide-y divide-[#ECEEF2] text-[13.5px]">
            {[
              {
                label: 'Account Number (Adv Plus)',
                value: revealNumbers
                  ? CHECKING_ACCOUNT.fullAccountNumber
                  : `•••• •••• ${CHECKING_ACCOUNT.shortMask}`,
                raw: CHECKING_ACCOUNT.fullAccountNumber.replace(/\s/g, ''),
              },
              {
                label: 'Paper & Electronic (ACH) Routing',
                value: CHECKING_ACCOUNT.routingPaper,
                raw: CHECKING_ACCOUNT.routingPaper,
              },
              {
                label: 'Domestic Wire Routing',
                value: CHECKING_ACCOUNT.routingWire,
                raw: CHECKING_ACCOUNT.routingWire,
              },
              {
                label: 'International SWIFT / BIC',
                value: CHECKING_ACCOUNT.swiftCode,
                raw: CHECKING_ACCOUNT.swiftCode,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="py-3 flex items-center justify-between gap-3"
              >
                <dt className="text-[#595959]">{row.label}</dt>
                <dd className="flex items-center gap-2 font-mono-code text-[13px] font-medium text-[#1C1C1C]">
                  <span>{row.value}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(row.label, row.raw)}
                    aria-label={`Copy ${row.label}`}
                    className="p-1 text-[#0065B3] hover:text-[#004E8C] rounded cursor-pointer"
                  >
                    {copiedField === row.label ? (
                      <Check className="w-3.5 h-3.5 text-[#0B6B3A]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="bg-white border border-[#D9DCE1] rounded-[4px] p-6">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="w-4 h-4 text-[#012169]" strokeWidth={1.9} />
            <h2 className="text-[15.5px] font-semibold text-[#1C1C1C]">
              Debit Card Spending Controls
            </h2>
          </div>

          <form onSubmit={handleSaveLimit} className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label
                  htmlFor="daily-limit-range"
                  className="text-[13.5px] text-[#333840] font-medium"
                >
                  Daily Purchase Limit
                </label>
                <span className="text-[16px] font-semibold text-[#012169] tabular-nums">
                  {formatCurrency(draftLimit)}
                </span>
              </div>
              <input
                id="daily-limit-range"
                type="range"
                min={1000}
                max={25000}
                step={500}
                value={draftLimit}
                onChange={(e) => setDraftLimit(Number(e.target.value))}
                className="w-full accent-[#0065B3] cursor-pointer"
              />
              <div className="flex justify-between text-[11.5px] text-[#666B73] tabular-nums mt-1">
                <span>$1,000</span>
                <span>$25,000 (Platinum Honors max)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#ECEEF2] flex items-center justify-between text-[13px] text-[#595959]">
              <span>Daily ATM Withdrawal Limit</span>
              <span className="font-semibold text-[#1C1C1C] tabular-nums">
                {formatCurrency(CHECKING_ACCOUNT.dailyAtmLimit)}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                className="px-5 py-2 bg-[#0065B3] hover:bg-[#004E8C] text-white text-[13.5px] font-medium rounded-[3px] transition-colors cursor-pointer"
              >
                Save Limit
              </button>
              {limitSaved && (
                <span className="inline-flex items-center gap-1 text-[13px] text-[#0B6B3A] font-medium">
                  <Check className="w-4 h-4" /> Limit updated
                </span>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
