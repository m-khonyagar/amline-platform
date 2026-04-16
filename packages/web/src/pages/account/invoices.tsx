import { PageShell } from '../../components/Common/PageShell';
import { DataTable } from '../../components/UI/DataTable';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchInvoices } from '../../services/api';

export default function InvoicesPage() {
  const { data, loading, error } = useAsyncData(fetchInvoices, []);
  const invoices = data ?? [];

  return (
    <PageShell title="حساب کاربری: فاکتورها" subtitle="نمایش فاکتورهای صادر شده، مبالغ و زمان انتشار هر صورتحساب.">
      <SectionCard title={loading ? 'در حال بارگذاری فاکتورها...' : 'فاکتورهای حساب'}>
        {error ? <p className="amline-form-feedback amline-form-feedback--error">{error}</p> : null}
        <DataTable
          columns={['شماره فاکتور', 'مبلغ', 'وضعیت', 'تاریخ صدور']}
          rows={invoices.map((invoice) => [
            invoice.id,
            invoice.amount.toLocaleString('fa-IR'),
            invoice.status,
            new Date(invoice.issuedAt).toLocaleString('fa-IR'),
          ])}
        />
      </SectionCard>
    </PageShell>
  );
}
