import { useState } from 'react';
import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';
import { submitComplaint } from '../../services/api';

export default function SupportComplaintsPage() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('contract');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <PageShell title="مرکز رسیدگی به شکایات" subtitle="ثبت، پیگیری و دسته‌بندی شکایات مشتریان، مشاوران و مالکان.">
      <SectionCard title="ثبت شکایت جدید">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setLoading(true);
            setError('');
            void submitComplaint({ subject, description, category })
              .then((payload) => {
                setMessage(`کد پیگیری ${payload.trackingCode} ثبت شد. وضعیت: ${payload.status}`);
                setSubject('');
                setDescription('');
              })
              .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Complaint failed'))
              .finally(() => setLoading(false));
          }}
          style={{ display: 'grid', gap: '0.75rem' }}
        >
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="contract">قرارداد</option>
            <option value="payment">پرداخت</option>
            <option value="support">پشتیبانی</option>
          </select>
          <input placeholder="موضوع شکایت" value={subject} onChange={(event) => setSubject(event.target.value)} />
          <textarea
            placeholder="شرح موضوع"
            rows={6}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <button style={{ width: 'fit-content' }} type="submit" disabled={loading}>
            {loading ? 'در حال ارسال...' : 'ارسال برای بررسی'}
          </button>
        </form>
        {message ? <p>{message}</p> : null}
        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      </SectionCard>
    </PageShell>
  );
}
