import { logger } from '../utils/logger';

export type NeedRecord = {
  id: string;
  title: string;
  city: string;
  budget: string;
  status: 'active' | 'closed';
  createdAt: string;
};

const needs: NeedRecord[] = [
  { id: 'need-1', title: 'نیازمندی خرید آپارتمان ۲۵۰ متری', city: 'قم، نیروگاه', budget: 'تا ۴ میلیارد', status: 'active', createdAt: '1404/10/01' },
  { id: 'need-2', title: 'نیازمندی رهن و اجاره واحد ۱۲۰ متری', city: 'قم، سالاریه', budget: 'رهن کامل', status: 'active', createdAt: '1404/10/05' },
];

const createBuckets = new Map<string, number[]>();

function rateLimitKey(actorId: string): string {
  return actorId || 'anon';
}

export const needsService = {
  list(): NeedRecord[] {
    return needs.filter((n) => n.status === 'active');
  },

  create(
    input: { title?: string; city?: string; budget?: string },
    actorId: string,
  ): { ok: true; need: NeedRecord } | { ok: false; error: string } {
    if (!input.title?.trim()) {
      return { ok: false, error: 'عنوان نیازمندی اجباری است' };
    }
    if (!input.city?.trim()) {
      return { ok: false, error: 'لطفاً منطقه مورد نظر را انتخاب کنید' };
    }

    const key = rateLimitKey(actorId);
    const now = Date.now();
    const window = createBuckets.get(key) ?? [];
    const recent = window.filter((t) => now - t < 60_000);
    if (recent.length >= 10) {
      logger.warn('need_rate_limit', { actorId });
      return { ok: false, error: 'شما بیش از حد مجاز نیازمندی ثبت کردید. چند دقیقه دیگر تلاش کنید.' };
    }
    recent.push(now);
    createBuckets.set(key, recent);

    const need: NeedRecord = {
      id: `need-${Date.now()}`,
      title: input.title.trim(),
      city: input.city.trim(),
      budget: input.budget?.trim() || '—',
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    needs.unshift(need);
    logger.info('need_created', { id: need.id, actorId });
    return { ok: true, need };
  },

  update(id: string, input: Partial<Pick<NeedRecord, 'title' | 'city' | 'budget'>>): { ok: true; need: NeedRecord } | { ok: false; error: string } {
    const need = needs.find((n) => n.id === id);
    if (!need) {
      return { ok: false, error: 'نیازمندی یافت نشد' };
    }
    if (need.status !== 'active') {
      return { ok: false, error: 'فقط نیازمندی فعال قابل ویرایش است' };
    }
    if (typeof input.title === 'string') need.title = input.title.trim();
    if (typeof input.city === 'string') need.city = input.city.trim();
    if (typeof input.budget === 'string') need.budget = input.budget.trim();
    return { ok: true, need };
  },

  close(id: string): { ok: true } | { ok: false; error: string } {
    const need = needs.find((n) => n.id === id);
    if (!need) {
      return { ok: false, error: 'نیازمندی یافت نشد' };
    }
    need.status = 'closed';
    logger.info('need_closed', { id });
    return { ok: true };
  },

  deleteHard(id: string): { ok: true } | { ok: false; error: string } {
    const idx = needs.findIndex((n) => n.id === id);
    if (idx === -1) {
      return { ok: false, error: 'نیازمندی یافت نشد' };
    }
    const need = needs[idx];
    if (need.status !== 'closed') {
      return { ok: false, error: 'فقط نیازمندی بسته‌شده بدون پیشنهاد فعال قابل حذف است' };
    }
    needs.splice(idx, 1);
    logger.info('need_deleted', { id });
    return { ok: true };
  },
};
