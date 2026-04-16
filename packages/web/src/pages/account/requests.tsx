import { useRouter } from 'next/router';
import { PageShell } from '../../components/Common/PageShell';
import { EmptyState } from '../../components/UI/EmptyState';
import { Icon } from '../../components/UI/Icon';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAccountRequests } from '../../services/api';

export default function AccountRequestsPage() {
  const router = useRouter();
  const requests = useAsyncData(fetchAccountRequests, []);
  const requestItems = requests.data ?? [];

  return (
    <PageShell title="درخواست‌های من" subtitle="درخواست‌های ثبت‌شده را پیگیری کنید و برای هر مورد مستقیم با پشتیبانی یا کارشناس گفتگو کنید.">
      <SectionCard title="درخواست‌های فعال">
        {requests.error ? <p className="amline-form-feedback amline-form-feedback--error">دریافت درخواست‌ها انجام نشد. لطفا دوباره تلاش کنید.</p> : null}
        {requests.loading ? (
          <p className="amline-form-feedback">در حال بارگذاری درخواست‌های شما...</p>
        ) : requestItems.length === 0 ? (
          <EmptyState
            title="درخواست فعالی ندارید"
            description="از طریق مرکز پشتیبانی یا بخش قراردادها می‌توانید درخواست جدید ثبت کنید."
            actions={
              <>
                <button type="button" className="amline-button amline-button--primary" onClick={() => router.push('/support')}>
                  مسیرهای پشتیبانی
                </button>
                <button type="button" className="amline-button amline-button--ghost" onClick={() => router.push('/contracts/new')}>
                  شروع قرارداد جدید
                </button>
              </>
            }
          />
        ) : (
          <div className="amline-mini-list">
            {requestItems.map((item) => (
              <button key={item.id} type="button" className="amline-mini-list__item" onClick={() => router.push('/chat/support')}>
                <div>
                  <strong>{item.title}</strong>
                  <span><span className="amline-status-chip amline-status-chip--warning">{item.status}</span></span>
                </div>
                <span><Icon name="externalLink" className="amline-icon amline-icon--xs" /></span>
              </button>
            ))}
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
