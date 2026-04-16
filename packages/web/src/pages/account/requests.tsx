import { useRouter } from 'next/router';
import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAccountRequests } from '../../services/api';

export default function AccountRequestsPage() {
  const router = useRouter();
  const requests = useAsyncData(fetchAccountRequests, []);

  return (
    <PageShell title="درخواست‌های من" subtitle="پیگیری درخواست‌های ثبت‌شده‌ی کاربر برای بازدید، استعلام و ارتباط با کارشناسان املاین.">
      <SectionCard title="درخواست‌های فعال">
        <div className="amline-mini-list">
          {(requests.data ?? []).map((item) => (
            <button key={item.id} type="button" className="amline-mini-list__item" onClick={() => router.push('/chat/support')}>
              <div>
                <strong>{item.title}</strong>
                <span>{item.status}</span>
              </div>
              <span>↗</span>
            </button>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}
