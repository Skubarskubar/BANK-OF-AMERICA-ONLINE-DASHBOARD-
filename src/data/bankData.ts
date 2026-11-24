export const AUTH_CONFIG = {
  expectedUsername: 'Christiana shawn',
  displayName: 'Christiana Shawn',
  expectedPassword: 'Pass2235',
  acceptedOtpCodes: [
    '426779',
    '925371',
    '368923',
    '257925',
    '489213',
    '123456',
  ] as const,
  maskedPhone: '(•••) •••-4819',
  maskedEmail: 'c••••••n@outlook.com',
  fullEmail: 'christiana.shawn@outlook.com',
  phoneDisplay: '(212) 555-4819',
  address: '420 Lexington Ave, Apt 18B, New York, NY 10170',
  memberSince: '2017',
  tier: 'Preferred Rewards Platinum Honors',
};

export const CHECKING_ACCOUNT = {
  id: 'adv-plus-4821',
  name: 'Adv Plus Banking',
  shortMask: '4821',
  fullAccountNumber: '4830 7194 4821',
  routingPaper: '021000322',
  routingWire: '026009593',
  swiftCode: 'BOFAUS3N',
  initialBalance: 300000.0,
  apy: '0.04%',
  status: 'Active',
  cardLast4: '6412',
  cardExpiry: '08/29',
  dailyPurchaseLimit: 10000,
  dailyAtmLimit: 2500,
};

export const CREDIT_ACCOUNT = {
  id: 'cash-rewards-9034',
  name: 'Customized Cash Rewards Visa Signature®',
  shortMask: '9034',
  balance: 0.0,
  creditLimit: 25000.0,
  availableCredit: 25000.0,
  cashBackBalance: 482.65,
  nextDueDate: 'June 18, 2026',
  cardExpiry: '11/28',
};

export type TransactionType = 'deposit' | 'withdrawal';

export type TransactionMethod =
  | 'Wire Credit'
  | 'Direct Deposit'
  | 'ACH Deposit'
  | 'Debit Card'
  | 'Zelle®'
  | 'Bill Pay'
  | 'Wire Transfer'
  | 'Internal Transfer'
  | 'Mobile Deposit';

export interface Transaction {
  id: string;
  reference: string;
  date: string;
  description: string;
  merchant: string;
  category: string;
  method: TransactionMethod;
  amount: number; // positive = credit, negative = debit
  status: 'Posted' | 'Processing';
  note?: string;
  location?: string;
}

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    reference: 'BOA26051290418',
    date: '05/12/2026',
    description: 'WIRE TYPE:WIRE IN DATE:260512 TRN:0094812 PRIVATE CLIENT DISTR',
    merchant: 'Private Client Trust Distribution',
    category: 'Wire Transfer',
    method: 'Wire Credit',
    amount: 42500.0,
    status: 'Posted',
    location: 'Charlotte, NC',
    note: 'Quarterly capital distribution cleared',
  },
  {
    id: 'tx-102',
    reference: 'BOA26050944102',
    date: '05/09/2026',
    description: 'WHOLE FOODS MARKET #10248 05/09 PURCHASE NEW YORK NY',
    merchant: 'Whole Foods Market',
    category: 'Groceries',
    method: 'Debit Card',
    amount: -246.82,
    status: 'Posted',
    location: 'New York, NY',
  },
  {
    id: 'tx-103',
    reference: 'BOA26050731884',
    date: '05/07/2026',
    description: 'DELTA AIR LINES 0062391042 ATLANTA GA',
    merchant: 'Delta Air Lines',
    category: 'Travel',
    method: 'Debit Card',
    amount: -1184.5,
    status: 'Posted',
    location: 'Atlanta, GA',
  },
  {
    id: 'tx-104',
    reference: 'BOA26050520911',
    date: '05/05/2026',
    description: 'CON EDISON OF NY DES:BILL PAY ID:88412009 INDN:CHRISTIANA SHAWN',
    merchant: 'Con Edison of New York',
    category: 'Utilities',
    method: 'Bill Pay',
    amount: -198.4,
    status: 'Posted',
    location: 'New York, NY',
  },
  {
    id: 'tx-105',
    reference: 'BOA26050188730',
    date: '05/01/2026',
    description: 'MERIDIAN PARTNERS LLC DES:PAYROLL ID:40192 PPD',
    merchant: 'Meridian Partners LLC',
    category: 'Direct Deposit',
    method: 'Direct Deposit',
    amount: 14850.0,
    status: 'Posted',
    location: 'New York, NY',
  },
  {
    id: 'tx-106',
    reference: 'BOA26042861209',
    date: '04/28/2026',
    description: 'EQUINOX FITNESS CLUB DES:MONTHLY MBR NEW YORK NY',
    merchant: 'Equinox Fitness Club',
    category: 'Health & Wellness',
    method: 'Debit Card',
    amount: -315.0,
    status: 'Posted',
    location: 'New York, NY',
  },
  {
    id: 'tx-107',
    reference: 'BOA26042450317',
    date: '04/24/2026',
    description: 'Zelle payment to Elena Vance Conf# j8k4p92m1',
    merchant: 'Elena Vance (Zelle®)',
    category: 'Transfers',
    method: 'Zelle®',
    amount: -1450.0,
    status: 'Posted',
    note: 'Interior architecture deposit',
  },
  {
    id: 'tx-108',
    reference: 'BOA26042139874',
    date: '04/21/2026',
    description: 'VERIZON WIRELESS DES:PAYMENTS ID:940281 WEB',
    merchant: 'Verizon Wireless',
    category: 'Telecom',
    method: 'Bill Pay',
    amount: -134.28,
    status: 'Posted',
  },
  {
    id: 'tx-109',
    reference: 'BOA26041775210',
    date: '04/17/2026',
    description: 'MERRILL EDGE DES:DIVIDEND ACH ID:33019488 PPD',
    merchant: 'Merrill Dividend Payout',
    category: 'Investments',
    method: 'ACH Deposit',
    amount: 6179.0,
    status: 'Posted',
    location: 'New York, NY',
  },
  {
    id: 'tx-110',
    reference: 'BOA26041512904',
    date: '04/15/2026',
    description: 'MERIDIAN PARTNERS LLC DES:PAYROLL ID:40191 PPD',
    merchant: 'Meridian Partners LLC',
    category: 'Direct Deposit',
    method: 'Direct Deposit',
    amount: 14850.0,
    status: 'Posted',
    location: 'New York, NY',
  },
];

export interface SavedRecipient {
  id: string;
  name: string;
  handle: string;
  bank: string;
  type: 'zelle' | 'wire' | 'bill';
  accountMask?: string;
}

export const SAVED_RECIPIENTS: SavedRecipient[] = [
  {
    id: 'r1',
    name: 'Elena Vance',
    handle: 'elena.vance@gmail.com',
    bank: 'Bank of America',
    type: 'zelle',
  },
  {
    id: 'r2',
    name: 'Marcus Sterling',
    handle: '(917) 555-0184',
    bank: 'JPMorgan Chase',
    type: 'zelle',
  },
  {
    id: 'r3',
    name: 'David Shawn',
    handle: 'd.shawn@me.com',
    bank: 'Bank of America',
    type: 'zelle',
  },
  {
    id: 'r4',
    name: 'Merrill Edge Investment Account',
    handle: 'Account ending in 7740',
    bank: 'Merrill Lynch',
    type: 'wire',
    accountMask: '7740',
  },
  {
    id: 'r5',
    name: 'Vanguard Private Brokerage',
    handle: 'Account ending in 3319',
    bank: 'Vanguard Group',
    type: 'wire',
    accountMask: '3319',
  },
  {
    id: 'r6',
    name: 'Con Edison of New York',
    handle: 'Acct •••• 8841',
    bank: 'Utility AutoPay',
    type: 'bill',
  },
  {
    id: 'r7',
    name: 'Lexington Plaza Residences',
    handle: 'Acct •••• 1820',
    bank: 'Monthly HOA / Housing',
    type: 'bill',
  },
  {
    id: 'r8',
    name: 'Verizon Wireless',
    handle: 'Acct •••• 9402',
    bank: 'Telecom Services',
    type: 'bill',
  },
];

export interface StatementRecord {
  id: string;
  period: string;
  statementDate: string;
  beginningBalance: number;
  deposits: number;
  withdrawals: number;
  endingBalance: number;
  pages: number;
}

export const MONTHLY_STATEMENTS: StatementRecord[] = [
  {
    id: 'stmt-2026-05',
    period: 'April 13, 2026 – May 12, 2026',
    statementDate: 'May 12, 2026',
    beginningBalance: 225150.0,
    deposits: 78379.0,
    withdrawals: 3529.0,
    endingBalance: 300000.0,
    pages: 4,
  },
  {
    id: 'stmt-2026-04',
    period: 'March 13, 2026 – April 12, 2026',
    statementDate: 'April 12, 2026',
    beginningBalance: 201840.5,
    deposits: 29700.0,
    withdrawals: 6390.5,
    endingBalance: 225150.0,
    pages: 5,
  },
  {
    id: 'stmt-2026-03',
    period: 'February 13, 2026 – March 12, 2026',
    statementDate: 'March 12, 2026',
    beginningBalance: 179410.22,
    deposits: 29700.0,
    withdrawals: 7269.72,
    endingBalance: 201840.5,
    pages: 4,
  },
  {
    id: 'stmt-2026-02',
    period: 'January 13, 2026 – February 12, 2026',
    statementDate: 'February 12, 2026',
    beginningBalance: 158125.0,
    deposits: 31200.0,
    withdrawals: 9914.78,
    endingBalance: 179410.22,
    pages: 4,
  },
];

export function formatCurrency(amount: number, options?: { signed?: boolean }): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (options?.signed) {
    if (amount > 0) return `+${formatted}`;
    if (amount < 0) return `-${formatted}`;
  } else if (amount < 0) {
    return `-${formatted}`;
  }
  return formatted;
}

export function isValidOtpCode(code: string): boolean {
  const cleaned = code.trim();
  return (AUTH_CONFIG.acceptedOtpCodes as readonly string[]).includes(cleaned);
}

export function computeTransactionsWithBalances(
  transactions: Transaction[],
  currentBalance: number
): Array<Transaction & { runningBalance: number }> {
  let cursor = currentBalance;
  return transactions.map((tx) => {
    const runningBalance = Math.round(cursor * 100) / 100;
    cursor = cursor - tx.amount;
    return { ...tx, runningBalance };
  });
}
