import { useMemo } from 'react';
import { PageShell } from '../../components/Common/PageShell';
import { MetricCard } from '../../components/UI/MetricCard';
import { SectionCard } from '../../components/UI/SectionCard';
import { DataTable } from '../../components/UI/DataTable';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchContracts, fetchFunnelMetrics, fetchPayments, fetchProperties } from '../../services/api';
import { buildMarketplaceFunnel, buildOperationsFunnel } from '../../utils/funnel';

export default function AdminReportsKpiPage() {
  const propertiesQuery = useAsyncData(fetchProperties, []);
  const contractsQuery = useAsyncData(fetchContracts, []);
  const paymentsQuery = useAsyncData(fetchPayments, []);
  const marketplaceFunnelQuery = useAsyncData(() => fetchFunnelMetrics('marketplace'), []);
  const operationsFunnelQuery = useAsyncData(() => fetchFunnelMetrics('operations'), []);

  const properties = propertiesQuery.data ?? [];
  const contracts = contractsQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];

  const marketplaceFunnel = useMemo(() => {
    if ((marketplaceFunnelQuery.data ?? []).length > 0) {
      const stages = marketplaceFunnelQuery.data ?? [];
      return stages.map((item, index) => {
        const previous = index === 0 ? item.value : stages[index - 1]?.value ?? item.value;
        const rateFromPrevious = previous > 0 ? Math.round((item.value / previous) * 100) : 0;
        return { ...item, rateFromPrevious };
      });
    }
    return buildMarketplaceFunnel(properties, payments);
  }, [marketplaceFunnelQuery.data, payments, properties]);
  const operationsFunnel = useMemo(() => {
    if ((operationsFunnelQuery.data ?? []).length > 0) {
      const stages = operationsFunnelQuery.data ?? [];
      return stages.map((item, index) => {
        const previous = index === 0 ? item.value : stages[index - 1]?.value ?? item.value;
        const rateFromPrevious = previous > 0 ? Math.round((item.value / previous) * 100) : 0;
        return { ...item, rateFromPrevious };
      });
    }
    return buildOperationsFunnel(properties, payments);
  }, [operationsFunnelQuery.data, payments, properties]);

  const completionRate = useMemo(() => {
    if (contracts.length === 0) return 0;
    const completed = contracts.filter((item) => item.tab === 'completed').length;
    return Math.round((completed / contracts.length) * 100);
  }, [contracts]);

  const paymentSuccessRate = useMemo(() => {
    if (payments.length === 0) return 0;
    const success = payments.filter((item) => item.status.toLowerCase().includes('success')).length;
    return Math.round((success / payments.length) * 100);
  }, [payments]);

  const hasError = Boolean(
    propertiesQuery.error || contractsQuery.error || paymentsQuery.error || marketplaceFunnelQuery.error || operationsFunnelQuery.error,
  );
  const dailyCallTarget = 1500;
  const callsByDay = useMemo(
    () => [
      { day: 'شنبه', calls: 1180 },
      { day: 'یکشنبه', calls: 1325 },
      { day: 'دوشنبه', calls: 1440 },
      { day: 'سه‌شنبه', calls: 1560 },
      { day: 'چهارشنبه', calls: 1490 },
    ],
    [],
  );

  return (
    <PageShell
      title="داشبورد گزارش و شاخص‌های کلیدی"
      subtitle="مرکز گزارش‌دهی مدیران: funnel growth، عملیات، وضعیت قراردادها، SLA و شاخص‌های مالی یکپارچه."
    >
      {hasError ? (
        <p className="amline-form-feedback amline-form-feedback--error">
          بارگذاری بخشی از KPIها با خطا مواجه شد. داده محاسباتی پشتیبان نمایش داده می‌شود.
        </p>
      ) : null}

      <div className="amline-home-metrics">
        <MetricCard label="نرخ تکمیل قرارداد" value={`${completionRate}%`} />
        <MetricCard label="موفقیت پرداخت" value={`${paymentSuccessRate}%`} />
        <MetricCard label="تعداد پرداخت" value={String(payments.length)} />
        <MetricCard label="تعداد فایل/نیاز بازار" value={String(properties.length)} />
      </div>

      <div className="amline-section-gap" />

      <SectionCard title="قیف بازار">
        <DataTable
          columns={['مرحله', 'حجم', 'نرخ از مرحله قبل']}
          rows={marketplaceFunnel.map((item) => [item.label, item.value, `${item.rateFromPrevious}%`])}
        />
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="قیف عملیات">
        <DataTable
          columns={['مرحله', 'حجم', 'نرخ از مرحله قبل']}
          rows={operationsFunnel.map((item) => [item.label, item.value, `${item.rateFromPrevious}%`])}
        />
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="سلامت عملیات">
        <div className="amline-metric-strip">
          <div>
            <strong>پرونده‌های فعال</strong>
            <span>{contracts.filter((item) => item.tab === 'active').length}</span>
          </div>
          <div>
            <strong>پرونده‌های تکمیل‌شده</strong>
            <span>{contracts.filter((item) => item.tab === 'completed').length}</span>
          </div>
          <div>
            <strong>پرونده‌های لغوشده</strong>
            <span>{contracts.filter((item) => item.tab === 'cancelled').length}</span>
          </div>
          <div>
            <strong>ارزش ناخالص</strong>
            <span>{payments.reduce((sum, item) => sum + item.amount, 0).toLocaleString('fa-IR')}</span>
          </div>
        </div>
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="گزارش تماس بر اساس روز" actions={<span>تارگت روزانه: {dailyCallTarget.toLocaleString('fa-IR')} تماس</span>}>
        <DataTable
          columns={['روز', 'تعداد تماس', 'درصد تحقق تارگت']}
          rows={callsByDay.map((item) => [
            item.day,
            item.calls.toLocaleString('fa-IR'),
            `${Math.round((item.calls / dailyCallTarget) * 100)}%`,
          ])}
        />
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="روند قرارداد و فایل">
        <DataTable
          columns={['شاخص', 'مقدار']}
          rows={[
            ['فایل‌های منتشرشده', properties.length.toLocaleString('fa-IR')],
            ['قراردادهای جاری', contracts.filter((item) => item.tab === 'active').length.toLocaleString('fa-IR')],
            ['قراردادهای نهایی', contracts.filter((item) => item.tab === 'completed').length.toLocaleString('fa-IR')],
            ['پرداخت‌های موفق', payments.filter((item) => item.status.toLowerCase().includes('paid')).length.toLocaleString('fa-IR')],
          ]}
        />
      </SectionCard>
    </PageShell>
  );
}
