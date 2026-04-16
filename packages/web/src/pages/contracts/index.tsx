import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useAsyncData } from '../../hooks/useAsyncData';
import { AppShellLayout } from '../../components/Common/AppShellLayout';
import { Badge } from '../../components/UI/Badge';
import { EmptyState } from '../../components/UI/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { deleteDraftContract, fetchContracts } from '../../services/api';
import { getContractStatusMeta } from '../../lib/status';

type ContractTab = 'active' | 'completed' | 'cancelled';
type ContractItem = Awaited<ReturnType<typeof fetchContracts>>[number];

const tabConfig: Array<{ key: ContractTab; label: string }> = [
  { key: 'cancelled', label: 'لغو شده' },
  { key: 'completed', label: 'تکمیل شده' },
  { key: 'active', label: 'جاری' },
];

export default function ContractsIndexPage() {
  const router = useRouter();
  const { user } = useAuth();
  const contractsQuery = useAsyncData(
    () => fetchContracts({ client: 'people', actorId: user?.id ?? 'acct_1', teamId: 'team_north' }),
    [user?.id],
  );
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [activeTab, setActiveTab] = useState<ContractTab>('active');
  const [query, setQuery] = useState('');

  useEffect(() => {
    setContracts(contractsQuery.data ?? []);
  }, [contractsQuery.data]);

  const filteredContracts = useMemo(() => {
    return contracts.filter((item) => {
      if (item.tab !== activeTab) {
        return false;
      }

      if (!query.trim()) {
        return true;
      }

      const haystack = `${item.title} ${item.counterpartLabel ?? ''} ${item.message} ${item.propertyLabel ?? ''}`;
      return haystack.includes(query.trim());
    });
  }, [activeTab, contracts, query]);

  const counts = useMemo(() => {
    const sourceContracts = contractsQuery.data ?? [];
    return {
      active: sourceContracts.filter((item) => item.tab === 'active').length,
      completed: sourceContracts.filter((item) => item.tab === 'completed').length,
      cancelled: sourceContracts.filter((item) => item.tab === 'cancelled').length,
    };
  }, [contractsQuery.data]);

  function handleDeleteDraft(id: string) {
    void deleteDraftContract(id).then(() => {
      setContracts((current) => current.filter((item) => item.id !== id));
    });
  }

  return (
    <AppShellLayout
      title="قراردادهای من"
      subtitle="قراردادها را بر اساس وضعیت، اقدام بعدی و میزان فوریت پیگیری کنید."
      activeNavHref="/contracts"
      topbarAction={
        <button type="button" className="amline-button amline-button--primary" onClick={() => router.push('/contracts/new')}>
          ایجاد قرارداد
        </button>
      }
      trustItems={['رهگیری رسمی', 'اقدام بعدی شفاف', 'پشتیبانی حقوقی']}
    >
      <div className="amline-contracts-page__search">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="جست‌وجو در عنوان قرارداد، طرف مقابل یا وضعیت"
          aria-label="جست‌وجو در قراردادها"
        />
      </div>

      <div className="amline-contract-tabs" role="tablist" aria-label="وضعیت قراردادها">
        {tabConfig.map((tab) => {
          const count = counts[tab.key];
          const isActive = tab.key === activeTab;

          return (
            <button
              key={tab.key}
              type="button"
              className={`amline-contract-tabs__tab${isActive ? ' is-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {count > 0 ? <span className={`amline-contract-tabs__badge${isActive ? ' is-active' : ''}`}>{count}</span> : null}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <section className="amline-contracts-page__content">
        {contractsQuery.error ? <p className="amline-form-feedback amline-form-feedback--error">دریافت قراردادها با خطا مواجه شد. لطفا دوباره تلاش کنید.</p> : null}
        {filteredContracts.length === 0 ? (
          <EmptyState
            title={query.trim() ? 'نتیجه‌ای پیدا نشد' : activeTab === 'active' ? 'هنوز قرارداد جاری ندارید' : activeTab === 'completed' ? 'قرارداد نهایی‌شده‌ای ندارید' : 'قرارداد لغوشده‌ای ثبت نشده است'}
            description={
              query.trim()
                ? 'عبارت جست‌وجو را تغییر دهید یا تب وضعیت را عوض کنید.'
                : activeTab === 'active'
                  ? 'با ایجاد قرارداد جدید می‌توانید روند امضا و پیگیری را شروع کنید.'
                  : activeTab === 'completed'
                    ? 'پس از نهایی‌سازی قراردادها، بایگانی کامل آن‌ها در این بخش نمایش داده می‌شود.'
                    : 'در حال حاضر هیچ پرونده لغوشده‌ای برای شما ثبت نشده است.'
            }
            actions={
              <>
                <button type="button" className="amline-button amline-button--primary" onClick={() => router.push('/contracts/new')}>
                  ایجاد قرارداد
                </button>
                {query.trim() ? (
                  <button type="button" className="amline-button amline-button--ghost" onClick={() => setQuery('')}>
                    پاک کردن جست‌وجو
                  </button>
                ) : null}
              </>
            }
          />
        ) : (
          <div className="amline-contract-list-mobile">
            {filteredContracts.map((item) => {
              const status = getContractStatusMeta(item.status);

              return (
                <article key={item.id} className="amline-contract-mobile-card">
                  <div className="amline-contract-mobile-card__header">
                    <div className="amline-contract-mobile-card__meta">
                      <Badge tone={status.tone}>{status.label}</Badge>
                      <span className="amline-contract-mobile-card__date">{item.date}</span>
                    </div>
                    <div className="amline-contract-mobile-card__title-group">
                      <h2>{item.title}</h2>
                      {item.counterpartLabel ? <span>{item.counterpartLabel}</span> : null}
                    </div>
                  </div>

                  <div className="amline-contract-mobile-card__message">
                    <p>{status.nextAction}</p>
                  </div>

                  <div className="amline-contract-mobile-card__actions">
                    <button type="button" className="amline-contract-mobile-card__primary" onClick={() => router.push(`/contracts/${item.id}`)}>
                      مشاهده قرارداد
                    </button>

                    {item.draft ? (
                      <button
                        type="button"
                        className="amline-contract-mobile-card__delete"
                        onClick={() => handleDeleteDraft(item.id)}
                      >
                        حذف پیش‌نویس
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </AppShellLayout>
  );
}
