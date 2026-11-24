import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileText,
  Lock,
  Printer,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { BofALogo } from './BofALogo';
import {
  AUTH_CONFIG,
  CHECKING_ACCOUNT,
  MONTHLY_STATEMENTS,
  StatementRecord,
  Transaction,
  formatCurrency,
} from '../data/bankData';

interface StatementsProfileViewProps {
  currentBalance: number;
  transactions: Array<Transaction & { runningBalance: number }>;
  verifiedOtpCode: string;
  rememberedDevice: boolean;
}

export const StatementsProfileView: React.FC<StatementsProfileViewProps> = ({
  currentBalance,
  transactions,
  verifiedOtpCode,
  rememberedDevice,
}) => {
  const [activeStatement, setActiveStatement] = useState<StatementRecord | null>(null);
  const [paperless, setPaperless] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const exportCsv = () => {
    const header = ['Date', 'Reference', 'Description', 'Method', 'Amount', 'Running Balance'];
    const rows = transactions.map((t) => [
      t.date,
      t.reference,
      `"${t.description.replace(/"/g, '""')}"`,
      t.method,
      t.amount.toFixed(2),
      t.runningBalance.toFixed(2),
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BofA_AdvPlus_${CHECKING_ACCOUNT.shortMask}_Activity.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 bofa-fade-in">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-medium text-[#1C1C1C] tracking-[-0.01em]">
            Statements &amp; Profile
          </h1>
          <p className="text-[13.5px] text-[#595959] mt-0.5">
            Online statements, transaction exports, and Online Banking security settings.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium bg-white hover:bg-[#F3F8FC] text-[#0065B3] border border-[#0065B3] rounded-[3px] transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Activity (CSV)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Statements */}
        <section className="lg:col-span-7 bg-white border border-[#D9DCE1] rounded-[4px] overflow-hidden shadow-[0_1px_2px_rgba(1,33,105,0.04)]">
          <div className="px-6 py-4 border-b border-[#E5E7EB] border-t-3 border-t-[#012169] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#012169]" />
              <h2 className="text-[15.5px] font-semibold text-[#1C1C1C]">
                {CHECKING_ACCOUNT.name} - {CHECKING_ACCOUNT.shortMask} Statements
              </h2>
            </div>
            <label className="inline-flex items-center gap-2 text-[12.5px] text-[#4A4E54] cursor-pointer">
              <input
                type="checkbox"
                checked={paperless}
                onChange={(e) => setPaperless(e.target.checked)}
                className="accent-[#0065B3] w-3.5 h-3.5 cursor-pointer"
              />
              <span>Paperless</span>
            </label>
          </div>

          <div className="divide-y divide-[#ECEEF2]">
            {MONTHLY_STATEMENTS.map((stmt, idx) => {
              const adjustedEnding = idx === 0 ? currentBalance : stmt.endingBalance;
              return (
                <div
                  key={stmt.id}
                  className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 hover:bg-[#F9FAFB] transition-colors"
                >
                  <div>
                    <p className="text-[14px] font-medium text-[#1C1C1C]">
                      {stmt.statementDate} Statement
                    </p>
                    <p className="text-[12.5px] text-[#595959] mt-0.5">
                      {stmt.period} · {stmt.pages} pages
                    </p>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <span className="block text-[11px] text-[#666B73]">Ending Balance</span>
                      <span className="text-[14px] font-semibold text-[#1C1C1C] tabular-nums">
                        {formatCurrency(adjustedEnding)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveStatement({ ...stmt, endingBalance: adjustedEnding })
                      }
                      className="text-[13px] font-medium text-[#0065B3] hover:text-[#004E8C] hover:underline cursor-pointer"
                    >
                      View PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Account Holder Profile & Security */}
        <div className="lg:col-span-5 space-y-5">
          <section className="bg-white border border-[#D9DCE1] rounded-[4px] p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-[#012169]" />
              <h2 className="text-[15px] font-semibold text-[#1C1C1C]">
                Personal Profile
              </h2>
            </div>

            <dl className="space-y-3 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="text-[#595959]">Account Holder</dt>
                <dd className="font-semibold text-[#1C1C1C] text-right">
                  {AUTH_CONFIG.displayName}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#595959]">User ID</dt>
                <dd className="text-[#1C1C1C] text-right">{AUTH_CONFIG.expectedUsername}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#595959]">Relationship Tier</dt>
                <dd className="text-[#012169] font-medium text-right">{AUTH_CONFIG.tier}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#595959]">Email</dt>
                <dd className="text-[#1C1C1C] text-right">{AUTH_CONFIG.fullEmail}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#595959]">Mobile Phone</dt>
                <dd className="text-[#1C1C1C] tabular-nums text-right">
                  {AUTH_CONFIG.phoneDisplay}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#595959] shrink-0">Mailing Address</dt>
                <dd className="text-[#1C1C1C] text-right">{AUTH_CONFIG.address}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#595959]">Client Since</dt>
                <dd className="text-[#1C1C1C] tabular-nums">{AUTH_CONFIG.memberSince}</dd>
              </div>
            </dl>
          </section>

          <section className="bg-white border border-[#D9DCE1] rounded-[4px] p-6">
            <div className="flex items-center gap-2 mb-3.5">
              <ShieldCheck className="w-4 h-4 text-[#0B6B3A]" />
              <h2 className="text-[15px] font-semibold text-[#1C1C1C]">
                Security &amp; 2-Step Verification
              </h2>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="flex items-center justify-between py-2 px-3 bg-[#F1FAF5] border border-[#C6E5D4] rounded-[3px]">
                <span className="inline-flex items-center gap-1.5 text-[#0B5A31] font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  2-Step Authorization Active
                </span>
                <span className="font-mono-code text-[12px] text-[#0B5A31]">
                  Code •••{verifiedOtpCode.slice(-3)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#4A4E54] pt-1">
                <span>Device status</span>
                <span className="font-medium text-[#1C1C1C]">
                  {rememberedDevice ? 'Recognized device' : 'Temporary session'}
                </span>
              </div>

              <label className="flex items-center justify-between pt-2 border-t border-[#ECEEF2] cursor-pointer">
                <span className="text-[#333840]">Instant security &amp; wire alerts</span>
                <input
                  type="checkbox"
                  checked={loginAlerts}
                  onChange={(e) => setLoginAlerts(e.target.checked)}
                  className="accent-[#0065B3] w-4 h-4 cursor-pointer"
                />
              </label>

              <p className="flex items-center gap-1.5 text-[11.5px] text-[#666B73] pt-1">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>256-bit TLS encrypted Bank of America session</span>
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Printable Official Statement Modal */}
      {activeStatement && (
        <div
          className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
          onClick={() => setActiveStatement(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white w-full max-w-[660px] max-h-[90vh] overflow-y-auto rounded-[4px] border border-[#CFD5DD] shadow-2xl bofa-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <BofALogo height={20} />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium text-[#0065B3] hover:bg-[#F3F8FC] border border-[#CFD5DD] rounded-[3px] cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStatement(null)}
                  aria-label="Close statement preview"
                  className="p-1.5 text-[#595959] hover:text-[#1C1C1C] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 text-[13px]">
              <div className="flex flex-wrap justify-between gap-4 border-b-2 border-[#012169] pb-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#595959] font-semibold">
                    Account Statement
                  </p>
                  <h3 className="text-[18px] font-semibold text-[#012169] mt-0.5">
                    {CHECKING_ACCOUNT.name}
                  </h3>
                  <p className="text-[#4A4E54] mt-1">
                    {AUTH_CONFIG.displayName} · {AUTH_CONFIG.address}
                  </p>
                </div>
                <div className="sm:text-right tabular-nums">
                  <p className="text-[#595959]">Account # •••• •••• {CHECKING_ACCOUNT.shortMask}</p>
                  <p className="text-[#1C1C1C] font-medium mt-0.5">{activeStatement.period}</p>
                  <p className="text-[11.5px] text-[#595959] mt-0.5">
                    Member FDIC · P.O. Box 15284, Wilmington, DE
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-[13px] font-semibold text-[#012169] uppercase tracking-wide mb-3">
                  Account Summary
                </h4>
                <dl className="divide-y divide-[#ECEEF2] border-y border-[#D9DCE1]">
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-[#4A4E54]">Beginning balance</dt>
                    <dd className="tabular-nums font-medium">
                      {formatCurrency(activeStatement.beginningBalance)}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-[#4A4E54]">Deposits and other additions</dt>
                    <dd className="tabular-nums font-medium text-[#0B6B3A]">
                      +{formatCurrency(activeStatement.deposits)}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-[#4A4E54]">ATM and debit card / withdrawals</dt>
                    <dd className="tabular-nums font-medium">
                      -{formatCurrency(activeStatement.withdrawals)}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-[#4A4E54]">Monthly service fee (Preferred Rewards waiver)</dt>
                    <dd className="tabular-nums">$0.00</dd>
                  </div>
                  <div className="py-3 flex justify-between bg-[#F4F6FA] px-2 -mx-2 font-semibold text-[#012169]">
                    <dt>Ending balance on {activeStatement.statementDate}</dt>
                    <dd className="tabular-nums text-[15px]">
                      {formatCurrency(activeStatement.endingBalance)}
                    </dd>
                  </div>
                </dl>
              </div>

              <p className="text-[11.5px] text-[#666B73] leading-relaxed">
                This digital statement matches the official statement provided by Bank of America,
                N.A., Member FDIC. Retain for your permanent records.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
