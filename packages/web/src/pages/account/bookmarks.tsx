import { useRouter } from 'next/router';
import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAccountBookmarks } from '../../services/api';

export default function AccountBookmarksPage() {
  const router = useRouter();
  const bookmarks = useAsyncData(fetchAccountBookmarks, []);

  return (
    <PageShell title="نشان شده‌ها" subtitle="آگهی‌ها و نیازمندی‌هایی که برای پیگیری بعدی ذخیره کرده‌اید.">
      <SectionCard title="لیست ذخیره‌شده">
        <div className="amline-mini-list">
          {(bookmarks.data ?? []).map((item) => (
            <button key={item.id} type="button" className="amline-mini-list__item" onClick={() => router.push('/')}>
              <div>
                <strong>{item.title}</strong>
                <span>{item.city}</span>
              </div>
              <span>⌂</span>
            </button>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}
