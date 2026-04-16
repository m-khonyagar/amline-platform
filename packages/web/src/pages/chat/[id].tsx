import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useAsyncData } from '../../hooks/useAsyncData';
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

  const hasImageBlock = useMemo(() => Boolean(conversation.image), [conversation.image]);
  const messages = localMessages.length > 0 ? localMessages : messagesQuery.data ?? [];

  function handleSend() {
    if (!message.trim() || sending) {
      return;
    }

    setSending(true);
    void sendConversationMessage(conversationId, message.trim())
      .then((savedMessage) => {
        setLocalMessages((current) => [
          ...(current.length > 0 ? current : messagesQuery.data ?? []),
          savedMessage,
        ]);
        setMessage('');
      })
      .finally(() => setSending(false));
  }

  return (
    <div className="amline-chat-thread">
      <header className="amline-chat-page__topbar">
        <button type="button" className="amline-chat-page__back" onClick={() => router.push('/chat')} aria-label="بازگشت">
          ‹
        </button>
        <h1>{conversation.title}</h1>
      </header>

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
        <button type="button" onClick={handleSend} disabled={sending}>
          {sending ? '...' : 'ارسال'}
        </button>
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="پیام خود را بنویسید"
        />
        <button type="button">＋</button>
      </footer>
    </div>
  );
}
