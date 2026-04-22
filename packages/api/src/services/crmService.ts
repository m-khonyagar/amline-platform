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
  clients: [{ id: 'crm-1', firstName: 'علی', lastName: 'رضایی', mobile: '09121112233' }],
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
      return { ok: false, error: 'نام، نام‌خانوادگی و موبایل الزامی است' };
    }
    const mobile = input.mobile.replace(/\s/g, '');
    if (state.clients.some((client) => client.mobile === mobile)) {
      return { ok: false, error: 'این شماره قبلاً به عنوان مشتری شما ثبت شده است' };
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
      return { ok: false, error: 'مشتری یافت نشد' };
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
