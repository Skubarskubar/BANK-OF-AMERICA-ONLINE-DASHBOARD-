import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { OtpVerificationPage } from './components/OtpVerificationPage';
import { Dashboard } from './components/Dashboard';

type AuthStage = 'login' | 'otp' | 'dashboard';

export function App() {
  const [stage, setStage] = useState<AuthStage>('login');
  const [verifiedOtpCode, setVerifiedOtpCode] = useState<string>('');
  const [rememberedDevice, setRememberedDevice] = useState<boolean>(true);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);

  const handleLoginSuccess = () => {
    setLoginNotice(null);
    setStage('otp');
    window.scrollTo({ top: 0 });
  };

  const handleOtpVerified = (code: string, remember: boolean) => {
    setVerifiedOtpCode(code);
    setRememberedDevice(remember);
    setStage('dashboard');
    window.scrollTo({ top: 0 });
  };

  const handleOtpCancel = () => {
    setLoginNotice(null);
    setStage('login');
    window.scrollTo({ top: 0 });
  };

  const handleLogout = () => {
    setVerifiedOtpCode('');
    setLoginNotice('You have securely logged out of Bank of America Online Banking.');
    setStage('login');
    window.scrollTo({ top: 0 });
  };

  if (stage === 'otp') {
    return (
      <OtpVerificationPage
        onVerified={handleOtpVerified}
        onCancel={handleOtpCancel}
      />
    );
  }

  if (stage === 'dashboard') {
    return (
      <Dashboard
        verifiedOtpCode={verifiedOtpCode}
        rememberedDevice={rememberedDevice}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <LoginPage onSuccess={handleLoginSuccess} initialNotice={loginNotice} />
  );
}

export default App;
