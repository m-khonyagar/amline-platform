import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { AppShellLayout } from '../../components/Common/AppShellLayout';
import { useAsyncData } from '../../hooks/useAsyncData';
import { Icon } from '../../components/UI/Icon';
import { fetchConversationMessages, sendConversationMessage, type ChatMessageSummary } from '../../services/api';

const conversationMap: Record<string, { title: string; subtitle: string; listingAge: string; banner?: string; image?: boolean }> = {
  'listing-250': { title: 'فروش - آپارتمان خوش نقشه ۲۵۰ متری', subtitle: '۱۰ روز پیش', listingAge: 'آگهی', image: true },
  'need-250': { title: 'نیازمندی خرید - آپارتمان ۲۵۰ متری', subtitle: '۱۰ روز پیش', listingAge: 'نیازمندی', image: true },
  support: { title: 'کارشناس شماره ۱۰۵۵', subtitle: 'علیرضا احمدی', listingAge: 'پشتیبانی' },
};

export default function ChatDetailPage() {
  const router = useRouter();
  const conversationId = typeof router.query.id === 'string' ? router.query.id : 'support';
  const conversation = conversationMap[conversationId] ?? conversationMap.support;
  const messagesQuery = useAsyncData(() => fetchConversationMessages(conversationId), [conversationId]);
  const [message, setMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatMessageSummary[]>([]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const hasImageBlock = useMemo(() => Boolean(conversation.image), [conversation.image]);
  const messages = localMessages.length > 0 ? localMessages : messagesQuery.data ?? [];
  const canSend = message.trim().length > 0 && !sending;
  const latestUserMessage = [...messages].reverse().find((item) => item.sender === 'user');

  function handleSend() {
    if (!message.trim() || sending) {
      return;
    }

    setSendError('');
    setSending(true);
    void sendConversationMessage(conversationId, message.trim())
      .then((savedMessage) => {
        setLocalMessages((current) => [
          ...(current.length > 0 ? current : messagesQuery.data ?? []),
          savedMessage,
        ]);
        setMessage('');
      })
      .catch(() => setSendError('ارسال پیام انجام نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.'))
      .finally(() => setSending(false));
  }

  return (
    <AppShellLayout
      title={conversation.title}
      subtitle="وضعیت پیام‌ها، زمان پاسخ و تاریخچه گفتگو در این نما قابل پیگیری است."
      activeNavHref="/chat"
      trustItems={['پاسخگویی شفاف', 'ذخیره تاریخچه گفتگو', 'پشتیبانی قابل رهگیری']}
    >
      <section className="amline-chat-thread__listing">
        <div className="amline-chat-thread__listing-meta">
          <strong>{conversation.title}</strong>
          <span>{conversation.subtitle}</span>
        </div>
        <div className="amline-chat-thread__listing-chip">{conversation.listingAge}</div>
      </section>

      <section className="amline-chat-thread__panel">
        <div className="amline-chat-thread__participant">
          <div className="amline-chat-thread__avatar">{conversation.subtitle.slice(0, 1)}</div>
          <div>
            <strong>کاربر املاین</strong>
            <span>{conversation.subtitle}</span>
          </div>
        </div>

        <div className="amline-chat-thread__messages">
          {messagesQuery.error ? <p className="amline-form-feedback amline-form-feedback--error">دریافت پیام‌ها انجام نشد. لطفا دوباره تلاش کنید.</p> : null}
          {!messagesQuery.loading && messages.length === 0 ? (
            <p className="amline-form-feedback">هنوز پیامی ثبت نشده است. اولین پیام را شما ارسال کنید.</p>
          ) : null}
          {messages.map((item) => (
            <article
              key={item.id}
              className={`amline-chat-bubble amline-chat-bubble--${item.sender}${item.state === 'failed' ? ' is-failed' : ''}`}
            >
              {item.quoted ? (
                <div className="amline-chat-bubble__quote">
                  <strong>{item.quoted.author}</strong>
                  <span>{item.quoted.text}</span>
                </div>
              ) : null}
              <p>{item.text}</p>
              <div className="amline-chat-bubble__meta">
                <span>{item.time}</span>
                {item.sender === 'user' ? (
                  <span>
                    {item.state === 'failed' ? '!' : item.state === 'read' ? '✓✓' : '✓'}
                  </span>
                ) : null}
              </div>
            </article>
          ))}

          {isTyping ? <div className="amline-form-feedback">کارشناس در حال تایپ پاسخ است...</div> : null}

          {hasImageBlock ? (
            <div className="amline-chat-thread__image-block">
              <img src="/assets/amline/slider-03.jpeg" alt="تصویر آگهی" />
              <div className="amline-chat-thread__image-actions">
                <button type="button">پاسخ</button>
                <button type="button">کپی</button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <footer className="amline-chat-thread__composer">
        <button type="button" onClick={handleSend} disabled={!canSend}>
          <Icon name="send" className="amline-icon amline-icon--sm" />
          {sending ? 'در حال ارسال...' : 'ارسال'}
        </button>
        <input
          value={message}
          onChange={(event) => {
            const nextValue = event.target.value;
            setMessage(nextValue);
            setIsTyping(nextValue.trim().length > 0);
          }}
          onBlur={() => setIsTyping(false)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              if (canSend) {
                handleSend();
              }
            }
          }}
          placeholder="پیام خود را بنویسید"
          aria-label="متن پیام"
        />
        <button type="button" aria-label="پیوست">
          <Icon name="attachment" className="amline-icon amline-icon--sm" />
        </button>
      </footer>
      {latestUserMessage ? (
        <p className="amline-form-feedback amline-chat-thread__feedback">
          وضعیت آخرین پیام شما:{' '}
          {latestUserMessage.state === 'read'
            ? 'خوانده شده'
            : latestUserMessage.state === 'sent'
              ? 'ارسال شده'
              : latestUserMessage.state === 'failed'
                ? 'ناموفق'
                : 'در صف ارسال'}
        </p>
      ) : null}
      {sendError ? <p className="amline-form-feedback amline-form-feedback--error amline-chat-thread__feedback amline-chat-thread__feedback--error">{sendError}</p> : null}
    </AppShellLayout>
  );
}
