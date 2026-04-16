import { useState } from 'react';
import { useRouter } from 'next/router';
import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';
import { requestPasswordReset } from '../../services/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [identity, setIdentity] = useState('');
  const [message, setMessage] = useState('');

  return (
    <PageShell title="بازیابی دسترسی" subtitle="ارسال لینک یا کد بازیابی برای ورود دوباره به حساب کاربری.">
      <SectionCard title="درخواست بازیابی">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void requestPasswordReset(identity || 'کاربر')
              .then((payload) => setMessage(payload.message));
          }}
          style={{ display: 'grid', gap: '0.75rem', maxWidth: '420px' }}
        >
          <input
            placeholder="شماره موبایل یا ایمیل"
            value={identity}
            onChange={(event) => setIdentity(event.target.value)}
          />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit">ارسال لینک بازیابی</button>
            <button type="button" onClick={() => router.push('/auth/login')}>بازگشت به ورود</button>
          </div>
        </form>
        {message ? <p>{message}</p> : null}
      </SectionCard>
    </PageShell>
  );
}
