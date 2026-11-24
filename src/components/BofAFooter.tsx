import React from 'react';
import { Lock } from 'lucide-react';
import { EqualHousingIcon } from './BofALogo';

interface BofAFooterProps {
  onInfoLink?: (title: string, body: string) => void;
}

export const BofAFooter: React.FC<BofAFooterProps> = ({ onInfoLink }) => {
  const handleLink = (e: React.MouseEvent, title: string, body: string) => {
    e.preventDefault();
    if (onInfoLink) {
      onInfoLink(title, body);
    }
  };

  return (
    <footer className="mt-auto border-t border-[#E1E4E8] bg-[#F4F5F7] text-[#4E535A]">
      <div className="mx-auto max-w-[1060px] px-5 sm:px-8 py-6">
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#333840] mb-3">
          <Lock className="w-3.5 h-3.5 text-[#595959]" strokeWidth={2} />
          <span>Secure Area</span>
        </div>

        <nav
          aria-label="Footer legal links"
          className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[#0065B3] mb-3.5"
        >
          <a
            href="#privacy"
            onClick={(e) =>
              handleLink(
                e,
                'Privacy & Security',
                'Bank of America uses industry-standard 256-bit TLS encryption, continuous fraud monitoring, and two-step authorization codes to protect your Online Banking session and deposit accounts.'
              )
            }
            className="hover:underline"
          >
            Privacy
          </a>
          <span className="text-[#C6CBD2]" aria-hidden="true">|</span>
          <a
            href="#security"
            onClick={(e) =>
              handleLink(
                e,
                'Online Banking Security Guarantee',
                'You are not liable for unauthorized Online Banking transactions when you notify Bank of America promptly upon noticing suspicious activity. Two-step verification protects account sign-in and elevated transfers.'
              )
            }
            className="hover:underline"
          >
            Security
          </a>
          <span className="text-[#C6CBD2]" aria-hidden="true">|</span>
          <a
            href="#your-privacy-choices"
            onClick={(e) =>
              handleLink(
                e,
                'Your Privacy Choices',
                'You can manage your communication and privacy preferences directly inside Profile & Settings once signed into your Online Banking portal.'
              )
            }
            className="hover:underline"
          >
            Your Privacy Choices
          </a>
          <span className="text-[#C6CBD2]" aria-hidden="true">|</span>
          <a
            href="#terms"
            onClick={(e) =>
              handleLink(
                e,
                'Online Banking Service Agreement',
                'Account access, Zelle® person-to-person transfers, domestic wire transactions, and digital monthly statements are covered under the Bank of America Online Banking Service Agreement.'
              )
            }
            className="hover:underline"
          >
            Service Agreement
          </a>
          <span className="text-[#C6CBD2]" aria-hidden="true">|</span>
          <a
            href="#routing"
            onClick={(e) =>
              handleLink(
                e,
                'Bank of America Routing Numbers',
                'Electronic (ACH) / Direct Deposit Routing: 021000322 · Domestic & International Wire Routing: 026009593 · SWIFT Code: BOFAUS3N.'
              )
            }
            className="hover:underline"
          >
            Routing Numbers
          </a>
        </nav>

        <p className="text-[11.5px] leading-relaxed text-[#595959]">
          Bank of America, N.A. Member FDIC.{' '}
          <span className="inline-flex items-center gap-1 text-[#333840]">
            Equal Housing Lender
            <EqualHousingIcon className="w-3.5 h-3.5 text-[#333840] -mt-0.5" />
          </span>
        </p>
        <p className="text-[11.5px] leading-relaxed text-[#666B73] mt-1">
          © 2026 Bank of America Corporation. All rights reserved. Patent: patents.bankofamerica.com
        </p>
      </div>
    </footer>
  );
};
