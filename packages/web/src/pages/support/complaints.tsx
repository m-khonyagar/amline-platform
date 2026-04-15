import { useState } from 'react';
import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';

export default function SupportComplaintsPage() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  return (
    <PageShell title="مرکز رسیدگی به شکایات" subtitle="ثبت، پیگیری و طبقه‌بندی شکایات مشتریان، مشاوران و مالکان.">
      <SectionCard title="ثبت شکایت جدید">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setMessage(`شکایت با موضوع "${subject || 'بدون عنوان'}" برای بررسی ثبت شد.`);
          }}
          style={{ display: 'grid', gap: '0.75rem' }}
        >
          <input placeholder="موضوع شکایت" value={subject} onChange={(event) => setSubject(event.target.value)} />
          <textarea
            placeholder="شرح موضوع"
            rows={6}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <button style={{ width: 'fit-content' }} type="submit">ارسال برای بررسی</button>
        </form>
        {message ? <p>{message}</p> : null}
      </SectionCard>
    </PageShell>
  );
}
