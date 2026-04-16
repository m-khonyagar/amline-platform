import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';
import { DataTable } from '../../components/UI/DataTable';
import { useAsyncData } from '../../hooks/useAsyncData';
import { assignReviewCase, escalateReviewCase, fetchReviewQueue, type ReviewQueueItem } from '../../services/admin';

const stateLabelMap: Record<ReviewQueueItem['state'], string> = {
  unassigned: 'بدون تخصیص',
  assigned_to_me: 'اختصاص‌یافته به من',
  escalated: 'ارجاع‌شده',
  sla_breached: 'نقض SLA',
};

const priorityLabelMap: Record<ReviewQueueItem['priority'], string> = {
  high: 'بالا',
  normal: 'عادی',
  low: 'کم',
};

export default function AdminReviewQueuePage() {
  const router = useRouter();
  const queueQuery = useAsyncData(fetchReviewQueue, []);
  const [rows, setRows] = useState<ReviewQueueItem[]>([]);
  const [filter, setFilter] = useState<'all' | ReviewQueueItem['state']>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setRows(queueQuery.data ?? []);
  }, [queueQuery.data]);

  const viewRows = useMemo(
    () => rows.filter((item) => (filter === 'all' ? true : item.state === filter)),
    [filter, rows],
  );

  async function handleAssign(item: ReviewQueueItem) {
    const previous = rows;
    setFeedback(null);
    setRows((current) =>
      current.map((row) => (row.id === item.id ? { ...row, state: 'assigned_to_me', assignee: 'شما' } : row)),
    );

    const result = await assignReviewCase(item.id);
    if (!result.ok) {
      setRows(previous);
      setFeedback('ثبت تخصیص روی سرور انجام نشد. لطفا دوباره تلاش کنید.');
    }
  }

  async function handleEscalate(item: ReviewQueueItem) {
    const previous = rows;
    setFeedback(null);
    setRows((current) =>
      current.map((row) => (row.id === item.id ? { ...row, state: 'escalated', assignee: 'سرپرست بررسی' } : row)),
    );

    const result = await escalateReviewCase(item.id);
    if (!result.ok) {
      setRows(previous);
      setFeedback('ارجاع پرونده روی سرور ثبت نشد. لطفا دوباره تلاش کنید.');
    }
  }

  return (
    <PageShell
      title="مدیریت صف بررسی"
      subtitle="مطابق سند Enterprise v5: اولویت‌بندی پرونده، تخصیص، کنترل SLA و ارجاع در یک صف عملیاتی."
    >
      {queueQuery.error ? (
        <p className="amline-form-feedback amline-form-feedback--error">
          دریافت صف بررسی با خطا مواجه شد. نسخه پشتیبان نمایش داده می‌شود.
        </p>
      ) : null}
      {feedback ? <p className="amline-form-feedback amline-form-feedback--error">{feedback}</p> : null}
      <SectionCard title="فیلترهای صف بررسی" actions={<span>{viewRows.length} پرونده</span>}>
        <div className="amline-panel-shortcuts">
          {[
            ['all', 'همه'],
            ['unassigned', 'بدون تخصیص'],
            ['assigned_to_me', 'اختصاص‌یافته'],
            ['escalated', 'ارجاع‌شده'],
            ['sla_breached', 'نقض SLA'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`amline-panel-shortcut${filter === key ? ' amline-panel-action--primary' : ''}`}
              onClick={() => setFilter(key as typeof filter)}
            >
              <strong>{label}</strong>
            </button>
          ))}
        </div>
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="Queue پرونده‌های بررسی">
        <DataTable
          columns={['شماره قرارداد', 'اولویت', 'وضعیت', 'تخصیص', 'SLA باقی‌مانده', 'اقدام']}
          rows={viewRows.map((item) => [
            item.contractId.toUpperCase(),
            priorityLabelMap[item.priority],
            stateLabelMap[item.state],
            item.assignee,
            `${item.slaHoursLeft} ساعت`,
            <div key={item.id} className="amline-inline-actions">
              <button type="button" className="amline-button amline-button--ghost" onClick={() => router.push(`/admin/contracts/${item.contractId}`)}>
                باز کردن
              </button>
              <button type="button" className="amline-button amline-button--ghost" onClick={() => void handleAssign(item)}>
                تخصیص به من
              </button>
              <button type="button" className="amline-button amline-button--secondary" onClick={() => void handleEscalate(item)}>
                ارجاع
              </button>
            </div>,
          ])}
        />
      </SectionCard>
    </PageShell>
  );
}
