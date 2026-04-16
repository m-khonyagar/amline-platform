import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { AppShellLayout } from '../../components/Common/AppShellLayout';
import { EmptyState } from '../../components/UI/EmptyState';
import { useAsyncData } from '../../hooks/useAsyncData';
import { Icon } from '../../components/UI/Icon';
import { fetchConversations } from '../../services/api';

type ChatTab = 'support' | 'conversations';

export default function ChatIndexPage() {
  const router = useRouter();
  const conversationsQuery = useAsyncData(fetchConversations, []);
  const [activeTab, setActiveTab] = useState<ChatTab>('conversations');
  const [starterName, setStarterName] = useState('');
  const conversations = conversationsQuery.data ?? [];
  const starterNameValid = starterName.trim().length >= 3;

  const unreadCount = useMemo(
    () => (conversationsQuery.data ?? []).reduce((sum, item) => sum + (item.unread ? Math.min(item.unread, 9) : 0), 0),
    [conversationsQuery.data],
  );

  return (
    <AppShellLayout
      title="گفتگو و پشتیبانی"
      subtitle="گفتگوهای خود را پیگیری کنید یا مستقیماً با تیم پشتیبانی املاین در ارتباط باشید."
      activeNavHref="/chat"
      trustItems={['پاسخگویی روزانه', 'پیگیری قابل رهگیری', 'حفظ محرمانگی گفتگوها']}
    >
      <div className="amline-chat-tabs" role="tablist" aria-label="تب‌های گفتگو">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'support'}
          aria-controls="chat-panel-support"
          className={`amline-chat-tabs__tab${activeTab === 'support' ? ' is-active' : ''}`}
          onClick={() => setActiveTab('support')}
        >
          ارتباط با پشتیبانی
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'conversations'}
          aria-controls="chat-panel-conversations"
          className={`amline-chat-tabs__tab${activeTab === 'conversations' ? ' is-active' : ''}`}
          onClick={() => setActiveTab('conversations')}
        >
          <span>گفتگوهای من</span>
          <span className="amline-chat-tabs__badge">{unreadCount}</span>
        </button>
      </div>

      <main className="amline-chat-page__content">
        {activeTab === 'support' ? (
          <section id="chat-panel-support" role="tabpanel" className="amline-chat-support">
            <div className="amline-chat-support__illustration" />
            <h2>به پشتیبانی املاین نیاز دارید؟</h2>
            <p>تیم پشتیبانی از ساعت ۹ تا ۲۱ آماده پاسخگویی درباره قرارداد، پرداخت و مدیریت آگهی‌هاست.</p>

            <div className="amline-chat-support__actions">
              <button type="button" className="amline-button amline-button--primary" onClick={() => setActiveTab('conversations')}>
                چت با پشتیبانی
              </button>
              <button type="button" className="amline-button amline-button--ghost" onClick={() => router.push('/support')}>
                مسیرهای پشتیبانی
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
                  aria-label="نام و نام خانوادگی"
                />
                <button
                  type="button"
                  className="amline-button amline-button--primary"
                  disabled={!starterNameValid}
                  onClick={() => router.push('/chat/support')}
                >
                  شروع گفتگو
                </button>
              </div>
              {!starterNameValid ? <p className="amline-form-feedback">برای شروع، نام کامل خود را وارد کنید.</p> : null}
            </div>
          </section>
        ) : (
          <section id="chat-panel-conversations" role="tabpanel" className="amline-chat-list">
            {conversationsQuery.error ? <p className="amline-form-feedback amline-form-feedback--error">بارگذاری گفتگوها انجام نشد. اتصال را بررسی و دوباره تلاش کنید.</p> : null}
            {!conversationsQuery.loading && conversations.length === 0 ? (
              <EmptyState
                title="هنوز گفتگویی ندارید"
                description="از بخش پشتیبانی یک مکالمه جدید شروع کنید تا پاسخ کارشناسان را مستقیم دریافت کنید."
                actions={
                  <button type="button" className="amline-button amline-button--primary" onClick={() => setActiveTab('support')}>
                    شروع مکالمه جدید
                  </button>
                }
              />
            ) : null}
            {conversations.map((item) => (
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
    </AppShellLayout>
  );
}
