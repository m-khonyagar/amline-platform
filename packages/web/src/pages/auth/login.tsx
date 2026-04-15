import { useState } from 'react';
import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';
import { loginWithMobile } from '../../services/api';

export default function LoginPage() {
  const [mobile, setMobile] = useState('09121234567');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  return (
    <PageShell title="ورود" subtitle="ورود با موبایل به حساب کاربری Amline و دریافت token تستی از API لوکال.">
      <SectionCard title="ورود با موبایل">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            void loginWithMobile(mobile)
              .then((payload) => setResult(`Token: ${payload.token}`))
              .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Login failed'));
          }}
          style={{ display: 'grid', gap: '0.75rem', maxWidth: '420px' }}
        >
          <input value={mobile} onChange={(event) => setMobile(event.target.value)} />
          <button type="submit">ورود</button>
        </form>
        {result ? <p>{result}</p> : null}
        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      </SectionCard>
    </PageShell>
  );
}
