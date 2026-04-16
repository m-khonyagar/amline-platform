import { useState } from 'react';
import { useRouter } from 'next/router';
import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAuth } from '../../hooks/useAuth';
import { loginWithMobile } from '../../services/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [mobile, setMobile] = useState('09121234567');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  return (
    <PageShell title="ورود" subtitle="ورود با موبایل به حساب کاربری املاین و ساخت نشست محلی برای ادامه‌ی فلوها.">
      <SectionCard title="ورود با موبایل">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            setLoading(true);
            void loginWithMobile(mobile)
              .then((payload) => {
                login({
                  id: 'acct_1',
                  fullName: 'آراد صالحی',
                  mobile,
                  city: 'تهران',
                  role: 'seller',
                  membership: 'Amline Plus',
                });
                setResult(`نشست با موفقیت ایجاد شد. Token: ${payload.token}`);
                void router.push('/account/profile');
              })
              .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Login failed'))
              .finally(() => setLoading(false));
          }}
          style={{ display: 'grid', gap: '0.75rem', maxWidth: '420px' }}
        >
          <input value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="شماره موبایل" />
          <button type="submit" disabled={loading}>
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
          <button type="button" onClick={() => router.push('/auth/register')}>
            ساخت حساب جدید
          </button>
        </form>
        {result ? <p>{result}</p> : null}
        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      </SectionCard>
    </PageShell>
  );
}
