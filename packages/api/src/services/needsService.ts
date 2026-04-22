import { logger } from '../utils/logger';
import { readJsonState, writeJsonState } from '../utils/stateStore';

export type NeedRecord = {
  id: string;
  title: string;
  city: string;
  budget: string;
  status: 'active' | 'closed';
  createdAt: string;
};

type NeedsState = {
  version: 1;
  needs: NeedRecord[];
  createBuckets: Record<string, number[]>;
};

const stateFile = 'amline-needs-store.json';
const state = readJsonState<NeedsState>(stateFile, {
  version: 1,
  needs: [
    { id: 'need-1', title: 'نیازمندی خرید آپارتمان ۲۵۰ متری', city: 'قم، نیروگاه', budget: 'تا ۴ میلیارد', status: 'active', createdAt: '1404/10/01' },
    { id: 'need-2', title: 'نیازمندی رهن و اجاره واحد ۱۲۰ متری', city: 'قم، سالاریه', budget: 'رهن کامل', status: 'active', createdAt: '1404/10/05' },
  ],
  createBuckets: {},
});

function persist(): void {
  writeJsonState(stateFile, state);
}

function rateLimitKey(actorId: string): string {
  return actorId || 'anon';
}

export const needsService = {
  list(): NeedRecord[] {
    return state.needs.filter((need) => need.status === 'active');
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
    const window = state.createBuckets[key] ?? [];
    const recent = window.filter((time) => now - time < 60_000);
    if (recent.length >= 10) {
      logger.warn('need_rate_limit', { actorId });
      return { ok: false, error: 'شما بیش از حد مجاز نیازمندی ثبت کردید. چند دقیقه دیگر تلاش کنید.' };
    }
    recent.push(now);
    state.createBuckets[key] = recent;

    const need: NeedRecord = {
      id: `need-${Date.now()}`,
      title: input.title.trim(),
      city: input.city.trim(),
      budget: input.budget?.trim() || '—',
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    state.needs.unshift(need);
    persist();
    logger.info('need_created', { id: need.id, actorId });
    return { ok: true, need };
  },

  update(id: string, input: Partial<Pick<NeedRecord, 'title' | 'city' | 'budget'>>): { ok: true; need: NeedRecord } | { ok: false; error: string } {
    const need = state.needs.find((item) => item.id === id);
    if (!need) {
      return { ok: false, error: 'نیازمندی یافت نشد' };
    }
    if (need.status !== 'active') {
      return { ok: false, error: 'فقط نیازمندی فعال قابل ویرایش است' };
    }
    if (typeof input.title === 'string') need.title = input.title.trim();
    if (typeof input.city === 'string') need.city = input.city.trim();
    if (typeof input.budget === 'string') need.budget = input.budget.trim();
    persist();
    return { ok: true, need };
  },

  close(id: string): { ok: true } | { ok: false; error: string } {
    const need = state.needs.find((item) => item.id === id);
    if (!need) {
      return { ok: false, error: 'نیازمندی یافت نشد' };
    }
    need.status = 'closed';
    persist();
    logger.info('need_closed', { id });
    return { ok: true };
  },

  deleteHard(id: string): { ok: true } | { ok: false; error: string } {
    const index = state.needs.findIndex((item) => item.id === id);
    if (index === -1) {
      return { ok: false, error: 'نیازمندی یافت نشد' };
    }
    const need = state.needs[index];
    if (need.status !== 'closed') {
      return { ok: false, error: 'فقط نیازمندی بسته‌شده بدون پیشنهاد فعال قابل حذف است' };
    }
    state.needs.splice(index, 1);
    persist();
    logger.info('need_deleted', { id });
    return { ok: true };
  },
};
