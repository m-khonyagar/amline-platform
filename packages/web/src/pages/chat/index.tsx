import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchConversations } from '../../services/api';

type ChatTab = 'support' | 'conversations';

export default function ChatIndexPage() {
  const router = useRouter();
  const conversationsQuery = useAsyncData(fetchConversations, []);
  const [activeTab, setActiveTab] = useState<ChatTab>('conversations');
  const [starterName, setStarterName] = useState('');

  const unreadCount = useMemo(
    () => (conversationsQuery.data ?? []).reduce((sum, item) => sum + (item.unread ? Math.min(item.unread, 9) : 0), 0),
    [conversationsQuery.data],
  );

  return (
    <div className="amline-chat-page">
      <header className="amline-chat-page__topbar">
        <button type="button" className="amline-chat-page__back" onClick={() => router.back()} aria-label="بازگشت">
          ‹
        </button>
        <h1>{activeTab === 'support' ? 'گفتگوها' : 'گفتگوهای من'}</h1>
      </header>

      <div className="amline-chat-tabs" role="tablist" aria-label="تب‌های گفتگو">
        <button
          type="button"
          className={`amline-chat-tabs__tab${activeTab === 'support' ? ' is-active' : ''}`}
          onClick={() => setActiveTab('support')}
        >
          ارتباط با پشتیبانی
        </button>
        <button
          type="button"
          className={`amline-chat-tabs__tab${activeTab === 'conversations' ? ' is-active' : ''}`}
          onClick={() => setActiveTab('conversations')}
        >
          <span>گفتگوهای من</span>
          <span className="amline-chat-tabs__badge">{unreadCount}</span>
        </button>
      </div>

      <main className="amline-chat-page__content">
        {activeTab === 'support' ? (
          <section className="amline-chat-support">
            <div className="amline-chat-support__illustration" />
            <h2>به پشتیبانی املاین نیاز دارید؟</h2>
            <p>تیم پشتیبانی از ساعت ۹ الی ۲۱ آماده پاسخگویی به سوالات شما درباره قرارداد، پرداخت و آگهی‌هاست.</p>

            <div className="amline-chat-support__actions">
              <button type="button" className="amline-button amline-button--primary" onClick={() => setActiveTab('conversations')}>
                چت با پشتیبانی
              </button>
              <button type="button" className="amline-button amline-button--ghost">
                تماس با پشتیبانی
              </button>
            </div>

            <div className="amline-chat-starter">
              <h3>شروع گفتگو با املاین</h3>
              <p>برای شروع گفتگو لطفا نام و نام خانوادگی خود را وارد کنید:</p>
              <div className="amline-chat-starter__form">
                <input
                  value={starterName}
                  onChange={(event) => setStarterName(event.target.value)}
                  placeholder="نام و نام خانوادگی"
                />
                <button
                  type="button"
                  className="amline-button amline-button--primary"
                  onClick={() => router.push('/chat/support')}
                >
                  شروع گفتگو
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="amline-chat-list">
            {(conversationsQuery.data ?? []).map((item) => (
              <button
                key={item.id}
                type="button"
                className="amline-chat-list__item"
                onClick={() => router.push(`/chat/${item.id}`)}
              >
                <div className="amline-chat-list__avatar">{item.subtitle.slice(0, 1)}</div>
                <div className="amline-chat-list__body">
                  <div className="amline-chat-list__header">
                    <strong>{item.title}</strong>
                    <span>{item.timeLabel}</span>
                  </div>
                  <div className="amline-chat-list__meta">
                    <span>{item.subtitle}</span>
                    <span className={`amline-chat-list__kind amline-chat-list__kind--${item.kind}`}>
                      {item.kind === 'listing' ? 'آگهی' : item.kind === 'need' ? 'نیازمندی' : 'پشتیبانی'}
                    </span>
                  </div>
                  <p>{item.preview}</p>
                </div>
                <div className="amline-chat-list__status">
                  {item.unread ? <span className="amline-chat-list__unread">{item.unread > 99 ? '99+' : item.unread}</span> : <span>✓✓</span>}
                  {item.pinned ? <span className="amline-chat-list__alert">!</span> : null}
                </div>
              </button>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
