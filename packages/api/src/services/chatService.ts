import { readJsonState, writeJsonState } from '../utils/stateStore';

export type ConversationRecord = {
  id: string;
  title: string;
  subtitle: string;
  preview: string;
  timeLabel: string;
  unread?: number;
  pinned?: boolean;
  kind: 'listing' | 'need' | 'support';
};

export type ChatMessage = {
  id: string;
  sender: 'user' | 'support';
  text: string;
  time: string;
  state?: 'sent' | 'read' | 'failed';
  quoted?: { author: string; text: string };
};

const conversations: ConversationRecord[] = [
  {
    id: 'listing-250',
    title: 'رهن و اجاره - آپارتمان خوش‌نقشه',
    subtitle: 'حسن رئوفی',
    preview: 'برای این فایل چند متقاضی جدی ثبت شده و آماده هماهنگی بازدید هستند.',
    timeLabel: '20:54',
    unread: 1,
    kind: 'listing',
  },
  {
    id: 'need-250',
    title: 'نیازمندی‌ها - فروش آپارتمان خوش‌نقشه',
    subtitle: 'حسن رئوفی',
    preview: 'چند فایل مطابق این نیازمندی پیدا شده و منتظر تایید شماست.',
    timeLabel: 'یکشنبه',
    kind: 'need',
  },
  {
    id: 'support',
    title: 'ارتباط با پشتیبانی',
    subtitle: 'املاین',
    preview: 'پاسخگوی سوالات شما درباره قرارداد، پرداخت و استعلام‌ها هستیم.',
    timeLabel: 'آنلاین',
    unread: 2,
    kind: 'support',
  },
];

const messages: Record<string, ChatMessage[]> = {
  'listing-250': [
    { id: '1', sender: 'user', text: 'برای این فایل زمان بازدید امروز خالی دارید؟', time: '11:20', state: 'read' },
    { id: '2', sender: 'support', text: 'بله، امروز بعدازظهر دو بازه خالی برای بازدید داریم.', time: '11:54' },
    {
      id: '3',
      sender: 'user',
      text: 'اگر مالک تایید کند، قرارداد را امروز شروع می‌کنیم.',
      time: '12:20',
      state: 'read',
      quoted: { author: 'حسن رئوفی', text: 'بله، امروز بعدازظهر دو بازه خالی برای بازدید داریم.' },
    },
    {
      id: '4',
      sender: 'support',
      text: 'به محض تایید مالک، لینک شروع قرارداد برای شما فعال می‌شود.',
      time: '12:54',
      quoted: { author: 'شما', text: 'اگر مالک تایید کند، قرارداد را امروز شروع می‌کنیم.' },
    },
  ],
  'need-250': [
    { id: '1', sender: 'user', text: 'برای این نیازمندی چه فایل‌هایی دارید؟', time: '11:20', state: 'read' },
    { id: '2', sender: 'support', text: 'سه فایل متناسب آماده شده و در حال نهایی‌سازی قیمت هستند.', time: '11:54' },
  ],
  support: [
    { id: '1', sender: 'user', text: 'برای شروع گفتگو لطفا راهنمایی کنید.', time: '11:20', state: 'read' },
    { id: '2', sender: 'support', text: 'تیم پشتیبانی از ساعت ۹ تا ۲۱ پاسخگوست و می‌تواند شما را در همه مراحل همراهی کند.', time: '11:54' },
  ],
};

type ChatStore = {
  version: 1;
  messages: Record<string, ChatMessage[]>;
  conversations: Record<string, Pick<ConversationRecord, 'preview' | 'timeLabel' | 'unread' | 'pinned'>>;
};

function readStore(): ChatStore | null {
  const parsed = readJsonState<Partial<ChatStore> | null>('amline-chat-store.json', null);
  if (!parsed) {
    return null;
  }

  if (parsed.version !== 1 || typeof parsed.messages !== 'object' || typeof parsed.conversations !== 'object') {
    return null;
  }

  return parsed as ChatStore;
}

function writeStore(store: ChatStore): void {
  writeJsonState('amline-chat-store.json', store);
}

function getConversationDefaults(): Record<string, ConversationRecord> {
  return Object.fromEntries(conversations.map((item) => [item.id, item]));
}

function hydrateFromStore(): void {
  const store = readStore();
  if (!store) {
    return;
  }

  // Restore messages
  for (const [conversationId, storedMessages] of Object.entries(store.messages)) {
    if (!Array.isArray(storedMessages)) {
      continue;
    }
    messages[conversationId] = storedMessages;
  }

  // Restore conversation preview/timeLabel/unread/pinned
  const byId = getConversationDefaults();
  for (const [id, patch] of Object.entries(store.conversations)) {
    const convo = byId[id];
    if (!convo) continue;
    if (typeof patch.preview === 'string') convo.preview = patch.preview;
    if (typeof patch.timeLabel === 'string') convo.timeLabel = patch.timeLabel;
    if (typeof patch.unread === 'number') convo.unread = patch.unread;
    if (typeof patch.pinned === 'boolean') convo.pinned = patch.pinned;
  }
}

function persist(): void {
  const store: ChatStore = {
    version: 1,
    messages,
    conversations: Object.fromEntries(
      conversations.map((c) => [
        c.id,
        {
          preview: c.preview,
          timeLabel: c.timeLabel,
          unread: c.unread,
          pinned: c.pinned,
        },
      ]),
    ),
  };

  writeStore(store);
}

hydrateFromStore();

export const chatService = {
  list(): ConversationRecord[] {
    return conversations;
  },
  messages(id: string): ChatMessage[] {
    return messages[id] ?? messages.support;
  },
  appendMessage(id: string, text: string): ChatMessage {
    const collection = messages[id] ?? (messages[id] = []);
    const nextMessage: ChatMessage = {
      id: String(collection.length + 1),
      sender: 'user',
      text,
      time: 'الان',
      state: 'sent',
    };

    collection.push(nextMessage);

    const conversation = conversations.find((item) => item.id === id);
    if (conversation) {
      conversation.preview = text;
      conversation.timeLabel = 'الان';
    }

    persist();
    return nextMessage;
  },
};
