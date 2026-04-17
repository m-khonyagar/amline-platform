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
    { id: 'need-1', title: 'Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ÛŒ Ø®Ø±ÛŒØ¯ Ø¢Ù¾Ø§Ø±ØªÙ…Ø§Ù† Û²ÛµÛ° Ù…ØªØ±ÛŒ', city: 'Ù‚Ù…ØŒ Ù†ÛŒØ±ÙˆÚ¯Ø§Ù‡', budget: 'ØªØ§ Û´ Ù…ÛŒÙ„ÛŒØ§Ø±Ø¯', status: 'active', createdAt: '1404/10/01' },
    { id: 'need-2', title: 'Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ÛŒ Ø±Ù‡Ù† Ùˆ Ø§Ø¬Ø§Ø±Ù‡ ÙˆØ§Ø­Ø¯ Û±Û²Û° Ù…ØªØ±ÛŒ', city: 'Ù‚Ù…ØŒ Ø³Ø§Ù„Ø§Ø±ÛŒÙ‡', budget: 'Ø±Ù‡Ù† Ú©Ø§Ù…Ù„', status: 'active', createdAt: '1404/10/05' },
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
      return { ok: false, error: 'Ø¹Ù†ÙˆØ§Ù† Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ÛŒ Ø§Ø¬Ø¨Ø§Ø±ÛŒ Ø§Ø³Øª' };
    }
    if (!input.city?.trim()) {
      return { ok: false, error: 'Ù„Ø·ÙØ§Ù‹ Ù…Ù†Ø·Ù‚Ù‡ Ù…ÙˆØ±Ø¯ Ù†Ø¸Ø± Ø±Ø§ Ø§Ù†ØªØ®Ø§Ø¨ Ú©Ù†ÛŒØ¯' };
    }

    const key = rateLimitKey(actorId);
    const now = Date.now();
    const window = state.createBuckets[key] ?? [];
    const recent = window.filter((time) => now - time < 60_000);
    if (recent.length >= 10) {
      logger.warn('need_rate_limit', { actorId });
      return { ok: false, error: 'Ø´Ù…Ø§ Ø¨ÛŒØ´ Ø§Ø² Ø­Ø¯ Ù…Ø¬Ø§Ø² Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ÛŒ Ø«Ø¨Øª Ú©Ø±Ø¯ÛŒØ¯. Ú†Ù†Ø¯ Ø¯Ù‚ÛŒÙ‚Ù‡ Ø¯ÛŒÚ¯Ø± ØªÙ„Ø§Ø´ Ú©Ù†ÛŒØ¯.' };
    }
    recent.push(now);
    state.createBuckets[key] = recent;

    const need: NeedRecord = {
      id: `need-${Date.now()}`,
      title: input.title.trim(),
      city: input.city.trim(),
      budget: input.budget?.trim() || 'â€”',
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
      return { ok: false, error: 'Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ÛŒ ÛŒØ§ÙØª Ù†Ø´Ø¯' };
    }
    if (need.status !== 'active') {
      return { ok: false, error: 'ÙÙ‚Ø· Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ÛŒ ÙØ¹Ø§Ù„ Ù‚Ø§Ø¨Ù„ ÙˆÛŒØ±Ø§ÛŒØ´ Ø§Ø³Øª' };
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
      return { ok: false, error: 'Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ÛŒ ÛŒØ§ÙØª Ù†Ø´Ø¯' };
    }
    need.status = 'closed';
    persist();
    logger.info('need_closed', { id });
    return { ok: true };
  },

  deleteHard(id: string): { ok: true } | { ok: false; error: string } {
    const index = state.needs.findIndex((item) => item.id === id);
    if (index === -1) {
      return { ok: false, error: 'Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ÛŒ ÛŒØ§ÙØª Ù†Ø´Ø¯' };
    }
    const need = state.needs[index];
    if (need.status !== 'closed') {
      return { ok: false, error: 'ÙÙ‚Ø· Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ÛŒ Ø¨Ø³ØªÙ‡â€ŒØ´Ø¯Ù‡ Ø¨Ø¯ÙˆÙ† Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ ÙØ¹Ø§Ù„ Ù‚Ø§Ø¨Ù„ Ø­Ø°Ù Ø§Ø³Øª' };
    }
    state.needs.splice(index, 1);
    persist();
    logger.info('need_deleted', { id });
    return { ok: true };
  },
};
