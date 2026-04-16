import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useAsyncData } from '../../hooks/useAsyncData';
import { deleteDraftContract, fetchContracts } from '../../services/api';

type ContractTab = 'active' | 'completed' | 'cancelled';
type ContractStatus =
  | 'awaiting_you'
  | 'awaiting_owner'
  | 'awaiting_tenant'
  | 'awaiting_legal'
  | 'awaiting_tracking'
  | 'finalized'
  | 'cancelled';

type ContractItem = Awaited<ReturnType<typeof fetchContracts>>[number];

const tabConfig: Array<{ key: ContractTab; label: string }> = [
  { key: 'cancelled', label: 'لغو شده' },
  { key: 'completed', label: 'تکمیل شده' },
  { key: 'active', label: 'جاری' },
];

const statusMap: Record<ContractStatus, { label: string; tone: 'danger' | 'warning' | 'info' | 'success' }> = {
  awaiting_you: { label: 'در انتظار شما', tone: 'danger' },
  awaiting_owner: { label: 'در انتظار مالک', tone: 'warning' },
  awaiting_tenant: { label: 'در انتظار مستاجر', tone: 'warning' },
  awaiting_legal: { label: 'در انتظار کارشناس', tone: 'info' },
  awaiting_tracking: { label: 'در انتظار کد رهگیری', tone: 'info' },
  finalized: { label: 'قرارداد نهایی', tone: 'success' },
  cancelled: { label: 'لغو شده', tone: 'danger' },
};

export default function ContractsIndexPage() {
  const router = useRouter();
  const contractsQuery = useAsyncData(fetchContracts, []);
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

      const haystack = `${item.title} ${item.counterpartLabel ?? ''} ${item.message}`;
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
    <div className="amline-contracts-page">
      <header className="amline-contracts-page__topbar">
        <button type="button" className="amline-contracts-page__icon-button" onClick={() => router.back()} aria-label="بازگشت">
          ‹
        </button>
        <h1>قراردادهای من</h1>
        <button type="button" className="amline-contracts-page__icon-button" aria-label="جست‌وجو">
          ⌕
        </button>
      </header>

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

      <main className="amline-contracts-page__content">
        {filteredContracts.length === 0 ? (
          <section className="amline-contracts-empty">
            <div className="amline-contracts-empty__illustration">
              <div className="amline-contracts-empty__folder" />
              <div className="amline-contracts-empty__magnifier" />
            </div>
            <p>
              {activeTab === 'active' && 'هنوز هیچ قرارداد جاری نداری!'}
              {activeTab === 'completed' && 'هیچ قرارداد تکمیل‌شده‌ای نداری!'}
              {activeTab === 'cancelled' && 'هیچ قرارداد لغو‌شده‌ای نداری!'}
            </p>
            <button type="button" className="amline-button amline-button--primary" onClick={() => router.push('/contracts/new')}>
              ایجاد قرارداد
            </button>
          </section>
        ) : (
          <div className="amline-contract-list-mobile">
            {filteredContracts.map((item) => {
              const status = statusMap[item.status];

              return (
                <article key={item.id} className="amline-contract-mobile-card">
                  <div className="amline-contract-mobile-card__header">
                    <div className="amline-contract-mobile-card__meta">
                      <span className={`amline-contract-mobile-card__status amline-contract-mobile-card__status--${status.tone}`}>
                        {status.label}
                      </span>
                      <span className="amline-contract-mobile-card__date">{item.date}</span>
                    </div>
                    <div className="amline-contract-mobile-card__title-group">
                      <h2>{item.title}</h2>
                      {item.counterpartLabel ? <span>{item.counterpartLabel}</span> : null}
                    </div>
                  </div>

                  <div className="amline-contract-mobile-card__message">
                    <span aria-hidden="true">i</span>
                    <p>{item.message}</p>
                  </div>

                  <div className="amline-contract-mobile-card__actions">
                    <button type="button" className="amline-contract-mobile-card__primary" onClick={() => router.push('/contracts/new')}>
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
      </main>

      <nav className="amline-contracts-bottom-nav" aria-label="پیمایش اصلی">
        <button type="button" onClick={() => router.push('/account/profile')}>
          <span>◉</span>
          <span>حساب من</span>
        </button>
        <button type="button" onClick={() => router.push('/chat')}>
          <span>◌</span>
          <span>گفتگو</span>
        </button>
        <button type="button" className="is-plus" onClick={() => router.push('/contracts/new')} aria-label="ایجاد قرارداد">
          +
        </button>
        <button type="button" className="is-active" onClick={() => router.push('/contracts')}>
          <span>▣</span>
          <span>قراردادهای من</span>
        </button>
        <button type="button" onClick={() => router.push('/')}>
          <span>⌂</span>
          <span>خانه</span>
        </button>
      </nav>
    </div>
  );
}
