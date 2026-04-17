import { readJsonState, writeJsonState } from '../utils/stateStore';

export type CrmClient = {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
};

type CrmState = {
  version: 1;
  clients: CrmClient[];
};

const stateFile = 'amline-crm-store.json';
const state = readJsonState<CrmState>(stateFile, {
  version: 1,
  clients: [{ id: 'crm-1', firstName: 'Ø¹Ù„ÛŒ', lastName: 'Ø±Ø¶Ø§ÛŒÛŒ', mobile: '09121112233' }],
});

function persist(): void {
  writeJsonState(stateFile, state);
}

export const crmService = {
  list(advisorId: string): CrmClient[] {
    void advisorId;
    return state.clients;
  },

  add(input: { firstName?: string; lastName?: string; mobile?: string }, advisorId: string): { ok: true; client: CrmClient } | { ok: false; error: string } {
    void advisorId;
    if (!input.firstName?.trim() || !input.lastName?.trim() || !input.mobile?.trim()) {
      return { ok: false, error: 'Ù†Ø§Ù…ØŒ Ù†Ø§Ù…â€ŒØ®Ø§Ù†ÙˆØ§Ø¯Ú¯ÛŒ Ùˆ Ù…ÙˆØ¨Ø§ÛŒÙ„ Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª' };
    }
    const mobile = input.mobile.replace(/\s/g, '');
    if (state.clients.some((client) => client.mobile === mobile)) {
      return { ok: false, error: 'Ø§ÛŒÙ† Ø´Ù…Ø§Ø±Ù‡ Ù‚Ø¨Ù„Ø§Ù‹ Ø¨Ù‡ Ø¹Ù†ÙˆØ§Ù† Ù…Ø´ØªØ±ÛŒ Ø´Ù…Ø§ Ø«Ø¨Øª Ø´Ø¯Ù‡ Ø§Ø³Øª' };
    }
    const client: CrmClient = {
      id: `crm-${Date.now()}`,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      mobile,
    };
    state.clients.push(client);
    persist();
    return { ok: true, client };
  },

  search(query: string): CrmClient[] {
    const normalized = query.trim();
    if (!normalized) {
      return state.clients;
    }
    return state.clients.filter(
      (client) =>
        client.mobile.includes(normalized) ||
        client.firstName.includes(normalized) ||
        client.lastName.includes(normalized) ||
        `${client.firstName} ${client.lastName}`.includes(normalized),
    );
  },

  remove(id: string): { ok: true } | { ok: false; error: string } {
    const index = state.clients.findIndex((client) => client.id === id);
    if (index === -1) {
      return { ok: false, error: 'Ù…Ø´ØªØ±ÛŒ ÛŒØ§ÙØª Ù†Ø´Ø¯' };
    }
    state.clients.splice(index, 1);
    persist();
    return { ok: true };
  },

  fullProfile(id: string): (CrmClient & { contracts: string[]; needs: string[] }) | null {
    const client = state.clients.find((item) => item.id === id);
    if (!client) {
      return null;
    }
    return { ...client, contracts: [], needs: [] };
  },
};
