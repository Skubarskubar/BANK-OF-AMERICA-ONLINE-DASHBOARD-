import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Eye,
  EyeOff,
  HelpCircle,
  Lock,
  ShieldCheck,
  X,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { BofALogo, FdicBar } from './BofALogo';
import { BofAFooter } from './BofAFooter';
import { AUTH_CONFIG } from '../data/bankData';

interface LoginPageProps {
  onSuccess: (savedUserId: string) => void;
  initialNotice?: string | null;
}

const SAVED_USER_KEY = 'bofa_saved_user_id';

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, initialNotice }) => {
  const [userId, setUserId] = useState<string>(() => {
    try {
      return localStorage.getItem(SAVED_USER_KEY) || '';
    } catch {
      return '';
    }
  });
  const [saveUserId, setSaveUserId] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(SAVED_USER_KEY));
    } catch {
      return false;
    }
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSaveTip, setShowSaveTip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalInfo, setModalInfo] = useState<{ title: string; body: string } | null>(null);
  const [spanishToggle, setSpanishToggle] = useState(false);

  useEffect(() => {
    document.title = 'Bank of America | Online Banking | Log In';
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUser = userId.trim();
    if (!trimmedUser && !password) {
      setError('Please enter your User ID and Password to log in.');
      return;
    }
    if (!trimmedUser) {
      setError('Please enter your User ID.');
      return;
    }
    if (!password) {
      setError('Please enter your Password.');
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      const userMatches =
        trimmedUser.toLowerCase() === AUTH_CONFIG.expectedUsername.toLowerCase();
      const passMatches = password === AUTH_CONFIG.expectedPassword;

      if (userMatches && passMatches) {
        try {
          if (saveUserId) {
            localStorage.setItem(SAVED_USER_KEY, trimmedUser);
          } else {
            localStorage.removeItem(SAVED_USER_KEY);
          }
        } catch {
          // ignore storage restrictions
        }
        setIsSubmitting(false);
        onSuccess(trimmedUser);
      } else {
        setIsSubmitting(false);
        setError(
          'The User ID or Password you entered does not match our records. Please review your entry and try again.'
        );
      }
    }, 340);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Subtle Top Utility Strip matching bankofamerica.com */}
      <div className="bg-[#F4F5F7] border-b border-[#E4E7EC]">
        <div className="mx-auto max-w-[1060px] px-5 sm:px-8 flex flex-wrap items-center justify-between gap-2 min-h-[34px] py-1">
          <FdicBar compact />
          <div className="hidden md:flex items-center gap-4 text-[11.5px] text-[#52565C]">
            <button
              type="button"
              onClick={() =>
                setModalInfo({
                  title: 'Contact Bank of America',
                  body: 'Personal Banking Support: 1-800-432-1000 (Mon–Fri 8 a.m.–11 p.m. ET, Sat–Sun 8 a.m.–8 p.m. ET). Preferred Rewards Platinum Honors Priority Line: 1-888-888-7937.',
                })
              }
              className="hover:text-[#012169] hover:underline cursor-pointer"
            >
              Contact Us
            </button>
            <button
              type="button"
              onClick={() => setSpanishToggle((prev) => !prev)}
              className="hover:text-[#012169] hover:underline cursor-pointer"
            >
              {spanishToggle ? 'In English' : 'En español'}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Brand Header with exact official Bank of America SVG Logo */}
      <header className="bg-white">
        <div className="mx-auto max-w-[1060px] px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <a
              href="#top"
              onClick={(e) => e.preventDefault()}
              aria-label="Bank of America Home"
              className="inline-flex items-center focus-visible:outline-[#0065B3]"
            >
              <BofALogo height={29} className="hidden sm:block -mt-1" />
              <BofALogo height={21} className="block sm:hidden -mt-0.5 max-w-[210px]" />
            </a>
            <span
              className="hidden sm:inline-block h-5 w-px bg-[#D4D8DF]"
              aria-hidden="true"
            />
            <span className="hidden sm:inline-block text-[15px] font-normal text-[#595959] tracking-tight">
              {spanishToggle ? 'Entrar' : 'Log In'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[12px] text-[#595959] shrink-0">
            <Lock className="w-3.5 h-3.5 text-[#595959]" strokeWidth={2} />
            <span className="hidden xs:inline sm:inline">
              {spanishToggle ? 'Área Segura' : 'Secure Page'}
            </span>
          </div>
        </div>

        {/* Official Signature Bank of America Crimson Header Strip */}
        <div className="bg-[#E31837] text-white">
          <div className="mx-auto max-w-[1060px] px-5 sm:px-8 py-3.5 sm:py-4">
            <h1 className="text-[20px] sm:text-[23px] font-normal tracking-[-0.01em] leading-tight">
              {spanishToggle
                ? 'Entrar a la Banca en Línea'
                : 'Log In to Online Banking'}
            </h1>
          </div>
        </div>
      </header>

      {/* Primary Sign-In Workspace */}
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-[1060px] px-5 sm:px-8 py-8 sm:py-12 bofa-fade-in">
          {/* Optional Signed-Out Notice */}
          {initialNotice && !error && (
            <div
              role="status"
              className="mb-7 max-w-[780px] flex items-start gap-3 border border-[#C6DBEE] border-l-4 border-l-[#0065B3] bg-[#F3F8FC] px-4 py-3 text-[13.5px] text-[#1C2A39]"
            >
              <ShieldCheck
                className="w-4 h-4 text-[#0065B3] shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <span>{initialNotice}</span>
            </div>
          )}

          {/* Two-column authentic BofA login grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-0">
            {/* Left: Sign-In Form */}
            <div className="lg:col-span-7 lg:pr-12">
              {error && (
                <div
                  role="alert"
                  className="mb-6 max-w-[420px] flex items-start gap-2.5 border border-[#F0C2C8] border-l-4 border-l-[#C41230] bg-[#FDF3F4] px-4 py-3 text-[13.5px] text-[#7F1020] leading-snug"
                >
                  <AlertCircle
                    className="w-4 h-4 text-[#C41230] shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <div>
                    <p className="font-semibold text-[#A31027]">
                      {spanishToggle
                        ? 'No pudimos verificar su información'
                        : "We can't log you in right now"}
                    </p>
                    <p className="mt-0.5 text-[13px] text-[#5C121D]">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="max-w-[380px]">
                {/* User ID */}
                <div className="mb-3">
                  <label
                    htmlFor="bofa-user-id"
                    className="block text-[14px] font-semibold text-[#1C1C1C] mb-1.5"
                  >
                    {spanishToggle ? 'Identificación de Usuario' : 'User ID'}
                  </label>
                  <input
                    id="bofa-user-id"
                    name="userId"
                    type="text"
                    autoComplete="username"
                    autoFocus
                    value={userId}
                    onChange={(e) => {
                      setUserId(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full h-[42px] px-3 text-[15px] text-[#1C1C1C] bg-white border border-[#8A8F99] rounded-[3px] transition-colors hover:border-[#4A5058] focus:border-[#0065B3] focus:outline-none focus:ring-2 focus:ring-[#0065B3]/25"
                    aria-invalid={Boolean(error)}
                  />
                </div>

                {/* Save this User ID */}
                <div className="mb-6 relative">
                  <div className="inline-flex items-center gap-2">
                    <input
                      id="bofa-save-id"
                      type="checkbox"
                      checked={saveUserId}
                      onChange={(e) => setSaveUserId(e.target.checked)}
                      className="h-4 w-4 rounded-[2px] border-[#767B84] accent-[#0065B3] cursor-pointer"
                    />
                    <label
                      htmlFor="bofa-save-id"
                      className="text-[13.5px] text-[#333840] cursor-pointer select-none"
                    >
                      {spanishToggle
                        ? 'Guardar esta Identificación'
                        : 'Save this User ID'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSaveTip((prev) => !prev)}
                      aria-label="Learn more about Save this User ID"
                      className="text-[#0065B3] hover:text-[#004A87] cursor-pointer p-0.5 rounded-full"
                    >
                      <HelpCircle className="w-4 h-4" strokeWidth={1.8} />
                    </button>
                  </div>

                  {showSaveTip && (
                    <div className="mt-2 p-3 text-[12.5px] leading-relaxed text-[#333840] bg-[#F6F8FA] border border-[#D4DCE4] rounded-[3px] flex items-start justify-between gap-2">
                      <span>
                        Saving your User ID stores it safely on this personal
                        device so you won&apos;t have to re-enter it at your
                        next log in. Avoid using this option on shared or
                        public devices.
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSaveTip(false)}
                        aria-label="Close help tooltip"
                        className="text-[#595959] hover:text-[#1C1C1C] cursor-pointer shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="mb-2">
                  <label
                    htmlFor="bofa-password"
                    className="block text-[14px] font-semibold text-[#1C1C1C] mb-1.5"
                  >
                    {spanishToggle ? 'Contraseña' : 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      id="bofa-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full h-[42px] pl-3 pr-11 text-[15px] text-[#1C1C1C] bg-white border border-[#8A8F99] rounded-[3px] transition-colors hover:border-[#4A5058] focus:border-[#0065B3] focus:outline-none focus:ring-2 focus:ring-[#0065B3]/25"
                      aria-invalid={Boolean(error)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#595959] hover:text-[#012169] cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" strokeWidth={1.8} />
                      ) : (
                        <Eye className="w-4 h-4" strokeWidth={1.8} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot password link */}
                <div className="mb-7">
                  <button
                    type="button"
                    onClick={() =>
                      setModalInfo({
                        title: 'Forgot your Password?',
                        body: 'To verify your Online Banking identity and reset your Password, enter your enrolled User ID and contact Customer Support at 1-800-432-1000, or visit your nearest Bank of America financial center with a valid photo ID.',
                      })
                    }
                    className="text-[13px] text-[#0065B3] hover:text-[#004A87] hover:underline cursor-pointer"
                  >
                    {spanishToggle
                      ? '¿Olvidó su Contraseña?'
                      : 'Forgot your Password?'}
                  </button>
                </div>

                {/* Primary Log In Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 min-w-[144px] h-[42px] px-7 bg-[#0065B3] hover:bg-[#004E8C] active:bg-[#003F73] disabled:opacity-70 text-white text-[15px] font-medium rounded-[3px] transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{spanishToggle ? 'Verificando...' : 'Logging In...'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" strokeWidth={2.2} />
                      <span>{spanishToggle ? 'Entrar' : 'Log In'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Authentic Minimal Bank of America Login Help Column */}
            <aside className="lg:col-span-5 lg:border-l lg:border-[#E2E5EA] lg:pl-12 pt-2 lg:pt-0 border-t border-[#E2E5EA] lg:border-t-0">
              <div className="pt-6 lg:pt-0 space-y-7 max-w-[340px]">
                <div>
                  <h2 className="text-[15px] font-semibold text-[#1C1C1C] mb-3">
                    {spanishToggle ? 'Ayuda para entrar' : 'Login help'}
                  </h2>
                  <ul className="space-y-2.5 text-[13.5px]">
                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          setModalInfo({
                            title: 'Forgot User ID or Password?',
                            body: 'Make sure Caps Lock is off when typing your password. If you need assistance confirming your Online Banking access, have your account number ending in 4821 and your registered mobile number ready, then call 1-800-432-1000.',
                          })
                        }
                        className="inline-flex items-center gap-1 text-[#0065B3] hover:text-[#004A87] hover:underline cursor-pointer"
                      >
                        <span>Forgot ID/Password?</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          setModalInfo({
                            title: 'Problem logging in?',
                            body: 'For enhanced protection, Online Banking uses 2-step verification after confirming your User ID and Password. Have your 6-digit temporary Authorization Code ready to finish verifying your identity.',
                          })
                        }
                        className="inline-flex items-center gap-1 text-[#0065B3] hover:text-[#004A87] hover:underline cursor-pointer"
                      >
                        <span>Problem logging in?</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-[#E5E7EB] pt-6">
                  <h2 className="text-[15px] font-semibold text-[#1C1C1C] mb-3">
                    {spanishToggle
                      ? '¿No usa la Banca en Línea?'
                      : 'Not using Online Banking?'}
                  </h2>
                  <ul className="space-y-2.5 text-[13.5px]">
                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          setModalInfo({
                            title: 'Enroll in Online Banking',
                            body: 'To enroll a personal Bank of America checking, savings, or credit card account, you will need the last 6 digits of your card or account number and your Social Security Number (SSN) or Tax ID Number (TIN).',
                          })
                        }
                        className="text-[#0065B3] hover:text-[#004A87] hover:underline cursor-pointer"
                      >
                        Enroll now for Online Banking
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          setModalInfo({
                            title: 'About Bank of America Online Banking',
                            body: 'Check balances and transactions in real time, send money quickly with Zelle®, schedule wire transfers and bill payments, download monthly PDF statements, and lock or manage your debit card 24/7.',
                          })
                        }
                        className="text-[#0065B3] hover:text-[#004A87] hover:underline cursor-pointer"
                      >
                        Learn more about Online Banking
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          setModalInfo({
                            title: 'Online Banking Service Agreement',
                            body: 'By accessing Bank of America Online Banking, you agree to the Online Banking Service Agreement and Electronic Communications Disclosure provided by Bank of America, N.A., Member FDIC.',
                          })
                        }
                        className="text-[#0065B3] hover:text-[#004A87] hover:underline cursor-pointer"
                      >
                        Service Agreement
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-[#E5E7EB] pt-5 flex items-start gap-2.5 text-[12px] leading-relaxed text-[#595959]">
                  <ShieldCheck
                    className="w-4 h-4 text-[#012169] shrink-0 mt-0.5"
                    strokeWidth={1.8}
                  />
                  <p>
                    Protected by our Online Banking Security Guarantee and
                    2-step Authorization Code verification.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Info Modal */}
      {modalInfo && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setModalInfo(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bofa-info-title"
            className="bg-white w-full max-w-[460px] rounded-[4px] border border-[#D4D8DF] shadow-xl overflow-hidden bofa-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] border-t-3 border-t-[#E31837]">
              <h3 id="bofa-info-title" className="text-[16px] font-semibold text-[#012169]">
                {modalInfo.title}
              </h3>
              <button
                type="button"
                onClick={() => setModalInfo(null)}
                aria-label="Close dialog"
                className="text-[#595959] hover:text-[#1C1C1C] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 text-[13.5px] leading-relaxed text-[#333840]">
              {modalInfo.body}
            </div>
            <div className="px-6 py-3.5 bg-[#F6F7F9] border-t border-[#E5E7EB] flex justify-end">
              <button
                type="button"
                onClick={() => setModalInfo(null)}
                className="px-5 py-2 bg-[#0065B3] hover:bg-[#004E8C] text-white text-[13.5px] font-medium rounded-[3px] cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <BofAFooter
        onInfoLink={(title, body) => setModalInfo({ title, body })}
      />
    </div>
  );
};
