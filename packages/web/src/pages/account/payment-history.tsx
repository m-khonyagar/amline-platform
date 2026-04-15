import { PageShell } from '../../components/Common/PageShell';
import { DataTable } from '../../components/UI/DataTable';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchPayments } from '../../services/api';

export default function PaymentHistoryPage() {
  const { data, loading, error } = useAsyncData(fetchPayments, []);
  const payments = data ?? [];

  return (
    <PageShell title="حساب کاربری: سابقه پرداخت" subtitle="پیگیری تراکنش‌های کیف پول، پرداخت‌های رزرو و وضعیت gateway.">
      <SectionCard title={loading ? 'در حال بارگذاری تراکنش‌ها...' : 'تاریخچه پرداخت'}>
        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
        <DataTable
          columns={['شناسه ملک', 'مبلغ', 'درگاه', 'وضعیت']}
          rows={payments.map((item) => [item.propertyId, item.amount.toLocaleString('fa-IR'), item.gateway, item.status])}
        />
      </SectionCard>
    </PageShell>
  );
}
