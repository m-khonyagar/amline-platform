export type CrmClient = {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
};

const clients: CrmClient[] = [
  { id: 'crm-1', firstName: 'علی', lastName: 'رضایی', mobile: '09121112233' },
];

export const crmService = {
  list(advisorId: string): CrmClient[] {
    void advisorId;
    return clients;
  },

  add(input: { firstName?: string; lastName?: string; mobile?: string }, advisorId: string): { ok: true; client: CrmClient } | { ok: false; error: string } {
    void advisorId;
    if (!input.firstName?.trim() || !input.lastName?.trim() || !input.mobile?.trim()) {
      return { ok: false, error: 'نام، نام‌خانوادگی و موبایل الزامی است' };
    }
    const mobile = input.mobile.replace(/\s/g, '');
    if (clients.some((c) => c.mobile === mobile)) {
      return { ok: false, error: 'این شماره قبلاً به عنوان مشتری شما ثبت شده است' };
    }
    const client: CrmClient = {
      id: `crm-${Date.now()}`,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      mobile,
    };
    clients.push(client);
    return { ok: true, client };
  },

  search(query: string): CrmClient[] {
    const q = query.trim();
    if (!q) {
      return clients;
    }
    return clients.filter(
      (c) => c.mobile.includes(q) || c.firstName.includes(q) || c.lastName.includes(q) || `${c.firstName} ${c.lastName}`.includes(q),
    );
  },

  remove(id: string): { ok: true } | { ok: false; error: string } {
    const idx = clients.findIndex((c) => c.id === id);
    if (idx === -1) {
      return { ok: false, error: 'مشتری یافت نشد' };
    }
    clients.splice(idx, 1);
    return { ok: true };
  },

  fullProfile(id: string): CrmClient & { contracts: string[]; needs: string[] } | null {
    const c = clients.find((x) => x.id === id);
    if (!c) {
      return null;
    }
    return { ...c, contracts: [], needs: [] };
  },
};
