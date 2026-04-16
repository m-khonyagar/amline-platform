import { useState } from 'react';
import { PageShell } from '../../components/Common/PageShell';
import { FeedbackBlock } from '../../components/UI/FeedbackBlock';
import { SectionCard } from '../../components/UI/SectionCard';
import { TrustPanel } from '../../components/UI/TrustPanel';
import { submitComplaint } from '../../services/api';

export default function SupportComplaintsPage() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('contract');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const subjectValid = subject.trim().length >= 5;
  const descriptionValid = description.trim().length >= 15;
  const formValid = subjectValid && descriptionValid;

  return (
    <PageShell title="ثبت شکایت رسمی" subtitle="برای پرونده‌های حساس حقوقی، مالی یا پشتیبانی، شکایت خود را ثبت کنید تا با کد رهگیری و مسیر رسیدگی شفاف پیگیری شود.">
      <FeedbackBlock>
        <strong>منطق رسیدگی</strong>
        <div className="amline-footer__meta">پس از ثبت شکایت، کد رهگیری نمایش داده می‌شود و تیم رسیدگی وضعیت پرونده را مرحله‌به‌مرحله بررسی می‌کند.</div>
      </FeedbackBlock>

      <div className="amline-section-gap" />

      <SectionCard title="ثبت شکایت جدید">
        <form
          className="amline-form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            if (!formValid) {
              setError('لطفا موضوع و شرح شکایت را کامل‌تر وارد کنید.');
              return;
            }
            setLoading(true);
            setError('');
            void submitComplaint({ subject, description, category })
              .then((payload) => {
                setMessage(`کد پیگیری ${payload.trackingCode} ثبت شد. وضعیت: ${payload.status}`);
                setSubject('');
                setDescription('');
              })
              .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'ارسال شکایت انجام نشد. دوباره تلاش کنید.'))
              .finally(() => setLoading(false));
          }}
        >
          <label className="amline-field">
            <span>دسته‌بندی</span>
            <select className="amline-select" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="contract">قرارداد</option>
              <option value="payment">پرداخت</option>
              <option value="support">پشتیبانی</option>
            </select>
          </label>
          <label className="amline-field">
            <span>موضوع شکایت</span>
            <input className="amline-input" placeholder="مثال: تاخیر در تایید قرارداد" value={subject} onChange={(event) => setSubject(event.target.value)} />
          </label>
          <label className="amline-field">
            <span>شرح موضوع</span>
            <textarea
              className="amline-textarea"
              placeholder="جزئیات کامل مشکل، زمان وقوع و نتیجه مورد انتظار را بنویسید."
              rows={6}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <p className="amline-form-feedback">برای پیگیری سریع‌تر، اطلاعات را واضح و دقیق بنویسید.</p>
          <button className="amline-button amline-button--primary amline-button--fit" type="submit" disabled={loading || !formValid}>
            {loading ? 'در حال ارسال...' : 'ارسال برای بررسی'}
          </button>
        </form>
        {message ? <p className="amline-form-feedback amline-form-feedback--success">{message}</p> : null}
        {error ? <p className="amline-form-feedback amline-form-feedback--error">{error}</p> : null}
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="اعتماد در فرایند رسیدگی">
        <TrustPanel items={['کد پیگیری رسمی', 'حفظ محرمانگی مدارک', 'پاسخگویی حقوقی و عملیاتی', 'شفافیت در وضعیت بررسی']} />
      </SectionCard>
    </PageShell>
  );
}
