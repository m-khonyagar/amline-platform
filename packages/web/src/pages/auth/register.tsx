import { useState } from 'react';
import { useRouter } from 'next/router';
import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');

  return (
    <PageShell title="ثبت نام" subtitle="ساخت حساب کاربری اولیه برای شروع فلوهای قرارداد، گفتگو و پنل شخصی.">
      <SectionCard title="ایجاد حساب">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            register({
              id: 'acct_local',
              fullName: fullName || 'کاربر جدید',
              mobile: mobile || '09120000000',
              city: city || 'تهران',
              role: 'buyer',
              membership: 'Amline Starter',
            });
            setMessage(`حساب ${fullName || 'کاربر جدید'} ایجاد شد و می‌توانید وارد پنل شوید.`);
            void router.push('/account/profile');
          }}
          style={{ display: 'grid', gap: '0.75rem', maxWidth: '480px' }}
        >
          <input placeholder="نام و نام خانوادگی" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          <input placeholder="شماره موبایل" value={mobile} onChange={(event) => setMobile(event.target.value)} />
          <input placeholder="شهر" value={city} onChange={(event) => setCity(event.target.value)} />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit">ایجاد حساب</button>
            <button type="button" onClick={() => router.push('/auth/login')}>رفتن به ورود</button>
          </div>
        </form>
        {message ? <p>{message}</p> : null}
      </SectionCard>
    </PageShell>
  );
}
