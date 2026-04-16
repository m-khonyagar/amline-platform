import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';
import { DataTable } from '../../components/UI/DataTable';
import { FeedbackBlock } from '../../components/UI/FeedbackBlock';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchContractAdminDetails } from '../../services/admin';

const machineStates = [
  'پیش نویس',
  'در حال تکمیل',
  'در انتظار طرف مقابل',
  'در انتظار امضا',
  'در انتظار پرداخت',
  'پرداخت جزئی',
  'در حال بررسی',
  'ارجاع شده',
  'تایید شده',
  'صدور کد رهگیری',
  'تکمیل شده',
  'پایان یافته',
  'باطل شده',
];

export default function AdminContractDetailPage() {
  const router = useRouter();
  const contractId = typeof router.query.id === 'string' ? router.query.id : '';
  const detailQuery = useAsyncData(() => fetchContractAdminDetails(contractId), [contractId]);
  const [currentStateIndex, setCurrentStateIndex] = useState(8);
  const [feedback, setFeedback] = useState<string | null>(null);
  const detail = detailQuery.data?.detail ?? null;
  const contract = detail?.contract ?? null;
  const payments = detailQuery.data?.payments ?? [];
  const auditLog = detailQuery.data?.auditLog ?? [];

  const timeline = useMemo(
    () =>
      machineStates.map((state, index) => ({
        state,
        tone: index < currentStateIndex ? 'success' : index === currentStateIndex ? 'info' : 'muted',
      })),
    [currentStateIndex],
  );

  function moveState(step: 'forward' | 'clarify' | 'escalate') {
    setFeedback(null);
    setCurrentStateIndex((current) => {
      if (step === 'clarify') return Math.max(0, current - 1);
      if (step === 'escalate') return Math.min(machineStates.length - 1, Math.max(current, 7));
      return Math.min(machineStates.length - 1, current + 1);
    });
    setFeedback(
      step === 'forward'
        ? 'پرونده به مرحله بعدی منتقل شد.'
        : step === 'clarify'
          ? 'پرونده برای شفاف سازی به مرحله قبلی برگشت.'
          : 'پرونده به سطح ارجاع مدیریتی منتقل شد.',
    );
  }

  return (
    <PageShell
      title={`پرونده قرارداد ${contract?.id ?? contractId ?? '---'}`}
      subtitle="نمای عملیاتی ادمین برای پرونده، دسترسی، لاگ ممیزی و اکشن های کنترلی."
    >
      {detailQuery.error ? <FeedbackBlock tone="error">دریافت جزئیات پرونده با خطا مواجه شد.</FeedbackBlock> : null}
      {feedback ? <FeedbackBlock tone="success">{feedback}</FeedbackBlock> : null}
      {!contract && !detailQuery.loading ? <FeedbackBlock tone="error">قراردادی با این شناسه یافت نشد.</FeedbackBlock> : null}

      <SectionCard title="هدر پرونده" actions={<span>{detail?.viewKind ?? 'ops_view'} / نسخه عملیاتی</span>}>
        <div className="amline-metric-strip">
          <div>
            <strong>ملک</strong>
            <span>{contract?.propertyLabel ?? '---'}</span>
          </div>
          <div>
            <strong>طرف مقابل</strong>
            <span>{contract?.counterpartLabel ?? 'ثبت نشده'}</span>
          </div>
          <div>
            <strong>آخرین به روزرسانی</strong>
            <span>{contract?.date ?? '---'}</span>
          </div>
          <div>
            <strong>دلیل دسترسی</strong>
            <span>{detail?.visibilityReason ?? 'Operational visibility'}</span>
          </div>
        </div>
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="ماشین حالت و تایم لاین">
        <div className="amline-funnel-grid">
          {timeline.map((item, idx) => (
            <article key={item.state} className={`amline-funnel-step amline-funnel-step--${item.tone}`}>
              <span className="amline-funnel-step__index">{idx + 1}</span>
              <strong>{item.state}</strong>
              <small>{idx <= currentStateIndex ? 'ثبت شده' : 'در انتظار'}</small>
            </article>
          ))}
        </div>
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="اکشن های قابل انجام در این نما">
        <div className="amline-panel-actions">
          {(detail?.actions ?? []).map((action) => (
            <article key={action} className="amline-panel-action">
              <strong>{action}</strong>
              <span>این اکشن طبق مدل دسترسی عملیاتی برای این پرونده مجاز است.</span>
            </article>
          ))}
        </div>
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="مالی و تسویه">
        <DataTable
          columns={['آیتم مالی', 'مبلغ', 'وضعیت', 'مرجع']}
          rows={
            payments.length > 0
              ? payments.slice(0, 4).map((payment) => [
                  `پرداخت ${payment.id}`,
                  payment.amount.toLocaleString('fa-IR'),
                  payment.status,
                  payment.gateway,
                ])
              : [['کارمزد سرویس', '۲,۴۰۰,۰۰۰', 'پرداخت شده', 'TX-4421']]
          }
        />
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="Audit Log">
        <DataTable
          columns={['زمان', 'موجودیت', 'اکشن', 'عامل', 'توضیح']}
          rows={
            auditLog.length > 0
              ? auditLog.slice(0, 6).map((entry) => [
                  entry.createdAt,
                  `${entry.entityType}:${entry.entityId}`,
                  entry.action,
                  entry.actor,
                  entry.note,
                ])
              : [['---', '---', '---', '---', 'رویدادی ثبت نشده است.']]
          }
        />
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="اکشن های مدیریتی">
        <div className="amline-panel-actions">
          <button type="button" className="amline-panel-action" onClick={() => moveState('forward')}>
            <strong>تایید و ادامه</strong>
            <span>پرونده را به مرحله بعدی بفرست.</span>
          </button>
          <button type="button" className="amline-panel-action" onClick={() => moveState('clarify')}>
            <strong>درخواست شفاف سازی</strong>
            <span>پرونده را برای تکمیل مدارک یا اصلاح برگردان.</span>
          </button>
          <button type="button" className="amline-panel-action" onClick={() => moveState('escalate')}>
            <strong>ارجاع پرونده</strong>
            <span>پرونده را به سطح بررسی بالاتر منتقل کن.</span>
          </button>
          <Link href="/admin/review-queue" className="amline-panel-action">
            <strong>بازگشت به صف بررسی</strong>
            <span>به فهرست پرونده های در صف بازگرد.</span>
          </Link>
        </div>
      </SectionCard>
    </PageShell>
  );
}
