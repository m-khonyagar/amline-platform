import { useEffect, useMemo, useState } from 'react';
import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';
import { DataTable } from '../../components/UI/DataTable';
import { useAsyncData } from '../../hooks/useAsyncData';
import { decideFraudCase, fetchFraudCases, type FraudCaseSummary } from '../../services/admin';

const fraudStatusLabel: Record<FraudCaseSummary['status'], string> = {
  open: 'باز',
  monitor: 'مانیتور',
  blocked: 'مسدود',
  resolved: 'حل‌شده',
};

const fraudEntityLabel: Record<FraudCaseSummary['entityType'], string> = {
  contract: 'قرارداد',
  payment: 'پرداخت',
  user: 'کاربر',
};

export default function AdminFraudDeskPage() {
  const fraudQuery = useAsyncData(fetchFraudCases, []);
  const [rows, setRows] = useState<FraudCaseSummary[]>([]);
  const [activeStatus, setActiveStatus] = useState<'all' | FraudCaseSummary['status']>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setRows(fraudQuery.data ?? []);
  }, [fraudQuery.data]);

  const filteredCases = useMemo(
    () => rows.filter((item) => (activeStatus === 'all' ? true : item.status === activeStatus)),
    [activeStatus, rows],
  );

  async function handleDecision(item: FraudCaseSummary, decision: 'allow' | 'monitor' | 'block') {
    const previous = rows;
    setFeedback(null);
    setRows((current) =>
      current.map((row) => {
        if (row.id !== item.id) return row;
        if (decision === 'allow') return { ...row, status: 'resolved' };
        if (decision === 'block') return { ...row, status: 'blocked' };
        return { ...row, status: 'monitor' };
      }),
    );

    const result = await decideFraudCase(item.id, decision);
    if (!result.ok) {
      setRows(previous);
      setFeedback('ثبت تصمیم روی میز تقلب ناموفق بود. لطفا دوباره تلاش کنید.');
    }
  }

  return (
    <PageShell
      title="میز تقلب و امنیت"
      subtitle="مطابق سند Enterprise v5: پایش ریسک، بررسی مورد مشکوک و تصمیم تایید/مانیتور/مسدود با ثبت لاگ."
    >
      {fraudQuery.error ? (
        <p className="amline-form-feedback amline-form-feedback--error">
          دریافت پرونده‌های Fraud با خطا مواجه شد. نسخه پشتیبان نمایش داده می‌شود.
        </p>
      ) : null}
      {feedback ? <p className="amline-form-feedback amline-form-feedback--error">{feedback}</p> : null}
      <SectionCard title="وضعیت پرونده‌های تقلب" actions={<span>{filteredCases.length} مورد</span>}>
        <div className="amline-panel-shortcuts">
          {[
            ['all', 'همه'],
            ['open', 'باز'],
            ['monitor', 'مانیتور'],
            ['blocked', 'مسدود'],
            ['resolved', 'حل‌شده'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`amline-panel-shortcut${activeStatus === key ? ' amline-panel-action--primary' : ''}`}
              onClick={() => setActiveStatus(key as typeof activeStatus)}
            >
              <strong>{label}</strong>
            </button>
          ))}
        </div>
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="لیست Risk Flag ها">
        <DataTable
          columns={['موجودیت', 'امتیاز ریسک', 'دلیل', 'وضعیت', 'تصمیم']}
          rows={filteredCases.map((item) => [
            `${fraudEntityLabel[item.entityType]}:${item.entityId}`,
            item.riskScore,
            item.reason,
            <span key={`${item.id}-status`} className={`amline-status-chip amline-status-chip--${item.status === 'blocked' ? 'danger' : item.status === 'resolved' ? 'success' : 'warning'}`}>
              {fraudStatusLabel[item.status]}
            </span>,
            <div key={item.id} className="amline-inline-actions">
              <button type="button" className="amline-button amline-button--ghost" onClick={() => void handleDecision(item, 'allow')}>تایید</button>
              <button type="button" className="amline-button amline-button--ghost" onClick={() => void handleDecision(item, 'monitor')}>مانیتور</button>
              <button type="button" className="amline-button amline-button--secondary" onClick={() => void handleDecision(item, 'block')}>مسدود</button>
            </div>,
          ])}
        />
      </SectionCard>
    </PageShell>
  );
}
