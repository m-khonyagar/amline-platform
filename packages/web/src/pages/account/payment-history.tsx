import { PageShell } from '../../components/Common/PageShell';
import { Badge } from '../../components/UI/Badge';
import { EmptyState } from '../../components/UI/EmptyState';
import { DataTable } from '../../components/UI/DataTable';
import { SectionCard } from '../../components/UI/SectionCard';
import { TrustPanel } from '../../components/UI/TrustPanel';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getPaymentStatusMeta } from '../../lib/status';
import { fetchPayments } from '../../services/api';

export default function PaymentHistoryPage() {
  const { data, loading, error } = useAsyncData(fetchPayments, []);
  const payments = data ?? [];

  return (
    <PageShell title="حساب کاربری: سابقه پرداخت" subtitle="ریز تراکنش‌ها و وضعیت پرداخت‌های شما برای پیگیری ساده‌تر در یک نمای یکپارچه.">
      <SectionCard title="اعتماد مالی و تسویه">
        <TrustPanel items={['نمایش شفاف وضعیت پرداخت', 'پیگیری سوابق تراکنش', 'راهنمای حقوقی و کمیسیون']} compact />
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title={loading ? 'در حال بارگذاری تراکنش‌ها...' : 'تاریخچه پرداخت'}>
        {error ? <p className="amline-form-feedback amline-form-feedback--error">{error}</p> : null}
        {!loading && payments.length === 0 ? (
          <EmptyState
            title="هنوز پرداختی ثبت نشده است"
            description="بعد از ثبت قرارداد یا رزرو، تراکنش‌ها در این بخش نمایش داده می‌شوند."
          />
        ) : (
          <DataTable
            columns={['شناسه ملک', 'مبلغ', 'درگاه', 'وضعیت']}
            rows={payments.map((item) => {
              const meta = getPaymentStatusMeta(item.status);
              return [item.propertyId, item.amount.toLocaleString('fa-IR'), item.gateway, <Badge key={item.id} tone={meta.tone}>{meta.label}</Badge>];
            })}
          />
        )}
      </SectionCard>
    </PageShell>
  );
}
