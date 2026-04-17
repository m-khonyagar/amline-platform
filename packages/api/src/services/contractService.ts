import { logger } from '../utils/logger';
import { readJsonState, writeJsonState } from '../utils/stateStore';

export type ClientContext = 'people' | 'advisor' | 'ops';
export type VisibilityScope = 'people_only' | 'shared' | 'advisor_managed' | 'team';

export type ContractRecord = {
  id: string;
  title: string;
  counterpartLabel?: string;
  date: string;
  tab: 'active' | 'completed' | 'cancelled';
  status:
    | 'awaiting_you'
    | 'awaiting_owner'
    | 'awaiting_tenant'
    | 'awaiting_legal'
    | 'awaiting_tracking'
    | 'finalized'
    | 'cancelled';
  message: string;
  draft?: boolean;
  visibilityScope: VisibilityScope;
  createdByClient: 'people' | 'advisor';
  ownerUserIds: string[];
  advisorId?: string;
  teamId?: string;
  propertyLabel: string;
  peopleNextStep: string;
  advisorNextStep: string;
  opsNextStep: string;
  /** VIS-008 */
  deleted?: boolean;
  /** VIS-009 — بسته شده؛ امضای مجدد غیرفعال */
  lifecycleClosed?: boolean;
  /** CON-001 optimistic locking */
  version: number;
  /** SIGN — طرفین امضا کرده‌اند */
  signedByUserIds: string[];
};

export type ContractDetailView = {
  contract: ContractRecord;
  client: ClientContext;
  viewKind: 'people_view' | 'advisor_view' | 'ops_view';
  timeline: Array<{ label: string; status: 'done' | 'current' | 'next' }>;
  actions: string[];
  visibilityReason: string;
};

export type ContractAccessResult =
  | { kind: 'ok'; detail: ContractDetailView }
  | { kind: 'not_found' }
  | { kind: 'forbidden'; scenarioId: string; message: string };

type ContractState = {
  version: 1;
  contracts: ContractRecord[];
};

const defaultContracts: ContractRecord[] = [
  {
    id: 'ct-1001',
    title: 'قرارداد رهن و اجاره جدید',
    date: '۱۴۰۴/۱۰/۱۹',
    tab: 'active',
    status: 'awaiting_you',
    message: 'هنوز هیچ اطلاعاتی ثبت نشده است',
    draft: true,
    visibilityScope: 'people_only',
    createdByClient: 'people',
    ownerUserIds: ['acct_1', 'acct_2'],
    propertyLabel: 'آپارتمان ۱۵۰ متری در پردیسان',
    peopleNextStep: 'اطلاعات طرفین و ملک را تکمیل کنید.',
    advisorNextStep: 'این قرارداد در اپ مشاور نباید نمایش داده شود.',
    opsNextStep: 'پروسه هنوز وارد صف عملیات نشده است.',
    version: 1,
    signedByUserIds: [],
  },
  {
    id: 'ct-1002',
    title: 'قرارداد مشترک مردم و مشاور',
    counterpartLabel: 'مستاجر: علی احمدی',
    date: '۱۴۰۴/۱۰/۱۹',
    tab: 'active',
    status: 'awaiting_you',
    message: 'اطلاعات خود را تکمیل کنید و قرارداد را امضا کنید',
    visibilityScope: 'shared',
    createdByClient: 'advisor',
    ownerUserIds: ['acct_1', 'acct_5'],
    advisorId: 'adv_21',
    teamId: 'team_north',
    propertyLabel: 'آپارتمان ۱۸۰ متری در سعادت‌آباد',
    peopleNextStep: 'نسخه people view همین قرارداد برای شما نمایش داده می‌شود.',
    advisorNextStep: 'مشاور باید احراز طرفین و مسیر امضا را پیگیری کند.',
    opsNextStep: 'هنوز نیازی به مداخله عملیات نیست.',
    version: 2,
    signedByUserIds: [],
  },
  {
    id: 'ct-1003',
    title: 'قرارداد ساخته‌شده توسط مشاور',
    counterpartLabel: 'مالک: علی احمدی',
    date: '۱۴۰۴/۱۰/۱۹',
    tab: 'active',
    status: 'awaiting_owner',
    message: 'منتظر تکمیل اطلاعات و امضای مالک باشید',
    visibilityScope: 'advisor_managed',
    createdByClient: 'advisor',
    ownerUserIds: ['acct_3', 'acct_4'],
    advisorId: 'adv_21',
    teamId: 'team_north',
    propertyLabel: 'واحد ۱۲۰ متری در سالاریه',
    peopleNextStep: 'طرفین قرارداد می‌توانند نسخه شخصی را مشاهده کنند.',
    advisorNextStep: 'مشاور مرتبط باید امضای مالک را جمع‌آوری کند.',
    opsNextStep: 'عملیات فقط در صورت ریسک یا ارجاع وارد می‌شود.',
    version: 1,
    signedByUserIds: [],
  },
  {
    id: 'ct-1004',
    title: 'قرارداد تیمی آژانس',
    counterpartLabel: 'مستاجر: علی احمدی',
    date: '۱۴۰۴/۱۰/۱۹',
    tab: 'active',
    status: 'awaiting_tenant',
    message: 'منتظر تکمیل اطلاعات و امضای مستاجر باشید',
    visibilityScope: 'team',
    createdByClient: 'advisor',
    ownerUserIds: ['acct_6', 'acct_7'],
    advisorId: 'adv_44',
    teamId: 'team_north',
    propertyLabel: 'رهن و اجاره آپارتمان در زنبیل‌آباد',
    peopleNextStep: 'فقط طرفین مستقیم قرارداد این نسخه را می‌بینند.',
    advisorNextStep: 'اعضای تیم مجاز می‌توانند این قرارداد را در Advisor ببینند.',
    opsNextStep: 'این قرارداد برای عملیات در صورت ارجاع قابل مشاهده است.',
    version: 1,
    signedByUserIds: [],
  },
  {
    id: 'ct-1005',
    title: 'پرونده در انتظار بررسی حقوقی',
    counterpartLabel: 'مستاجر: علی احمدی',
    date: '۱۴۰۴/۱۰/۱۹',
    tab: 'active',
    status: 'awaiting_legal',
    message: 'قرارداد در حال بررسی توسط کارشناس حقوقی است',
    visibilityScope: 'shared',
    createdByClient: 'advisor',
    ownerUserIds: ['acct_1', 'acct_8'],
    advisorId: 'adv_21',
    teamId: 'team_ops',
    propertyLabel: 'رهن و اجاره آپارتمان در زنبیل‌آباد',
    peopleNextStep: 'در انتظار تایید حقوقی املاین باشید.',
    advisorNextStep: 'وضعیت review و SLA را در Advisor پیگیری کنید.',
    opsNextStep: 'این پرونده در صف عملیات قابل مشاهده و بررسی است.',
    version: 1,
    signedByUserIds: [],
  },
  {
    id: 'ct-1006',
    title: 'در انتظار کد رهگیری',
    counterpartLabel: 'مستاجر: علی احمدی',
    date: '۱۴۰۴/۱۰/۱۹',
    tab: 'completed',
    status: 'awaiting_tracking',
    message: 'اطلاعات قرارداد در حال ثبت در سامانه رسمی است',
    visibilityScope: 'shared',
    createdByClient: 'advisor',
    ownerUserIds: ['acct_1', 'acct_9'],
    advisorId: 'adv_21',
    teamId: 'team_ops',
    propertyLabel: 'آپارتمان ۲۰۰ متری در نیاوران',
    peopleNextStep: 'کد رهگیری به‌زودی صادر می‌شود.',
    advisorNextStep: 'وضعیت ثبت رسمی و صدور رهگیری را مانیتور کنید.',
    opsNextStep: 'پروسه tracking در لایه عملیات audit می‌شود.',
    version: 1,
    signedByUserIds: ['acct_1'],
  },
  {
    id: 'ct-1007',
    title: 'قرارداد نهایی فایل ۱۴',
    counterpartLabel: 'مستاجر: مهدی رضایی',
    date: '۱۴۰۴/۱۰/۲۰',
    tab: 'completed',
    status: 'finalized',
    message: 'قرارداد نهایی شده و کد رهگیری صادر شده است',
    visibilityScope: 'shared',
    createdByClient: 'advisor',
    ownerUserIds: ['acct_1', 'acct_10'],
    advisorId: 'adv_21',
    teamId: 'team_ops',
    propertyLabel: 'فایل ۱۴ - اجاره سالانه',
    peopleNextStep: 'نسخه نهایی قرارداد و کد رهگیری را دانلود کنید.',
    advisorNextStep: 'پرونده برای CRM و کمیسیون بسته شد.',
    opsNextStep: 'پرونده نهایی شده و در audit log ثبت شده است.',
    lifecycleClosed: true,
    version: 4,
    signedByUserIds: ['acct_1', 'acct_10'],
  },
  {
    id: 'ct-vis-008',
    title: 'نمونه حذف منطقی (تست)',
    date: '۱۴۰۴/۱۰/۱۰',
    tab: 'cancelled',
    status: 'cancelled',
    message: 'حذف منطقی',
    visibilityScope: 'people_only',
    createdByClient: 'people',
    ownerUserIds: ['acct_1'],
    propertyLabel: '—',
    peopleNextStep: '—',
    advisorNextStep: '—',
    opsNextStep: '—',
    deleted: true,
    version: 1,
    signedByUserIds: [],
  },
];

const stateFile = 'amline-contract-store.json';
const state = readJsonState<ContractState>(stateFile, {
  version: 1,
  contracts: defaultContracts,
});
const contracts = state.contracts;

function persist(): void {
  writeJsonState(stateFile, state);
}

function canViewContract(contract: ContractRecord, client: ClientContext, actorId: string, teamId?: string): boolean {
  if (client === 'ops') {
    return true;
  }

  if (client === 'people') {
    return contract.ownerUserIds.includes(actorId);
  }

  if (contract.visibilityScope === 'people_only') {
    return false;
  }

  if (contract.advisorId === actorId) {
    return true;
  }

  return contract.visibilityScope === 'team' && Boolean(teamId) && contract.teamId === teamId;
}

function forbiddenReason(
  contract: ContractRecord,
  client: ClientContext,
  actorId: string,
  teamId?: string,
): { scenarioId: string; message: string } {
  if (client === 'advisor' && contract.visibilityScope === 'people_only') {
    return {
      scenarioId: 'VIS-002',
      message: 'این قرارداد فقط در AmLine برای طرفین قرارداد قابل مشاهده است',
    };
  }
  if (client === 'advisor' && contract.visibilityScope === 'team') {
    const allowed = contract.advisorId === actorId || (Boolean(teamId) && contract.teamId === teamId);
    if (!allowed) {
      return { scenarioId: 'VIS-006', message: 'شما به این قرارداد دسترسی ندارید' };
    }
  }
  if (client === 'advisor' && !contract.ownerUserIds.includes(actorId) && contract.advisorId !== actorId) {
    if (contract.visibilityScope !== 'team' || !teamId || contract.teamId !== teamId) {
      return { scenarioId: 'VIS-006', message: 'شما به این قرارداد دسترسی ندارید' };
    }
  }
  return { scenarioId: 'VIS-007', message: 'شما به این قرارداد دسترسی ندارید' };
}

function buildTimeline(status: ContractRecord['status']): Array<{ label: string; status: 'done' | 'current' | 'next' }> {
  const steps = ['ثبت اطلاعات', 'تایید طرفین', 'بازبینی حقوقی', 'رهگیری و نهایی‌سازی'];
  const currentIndex =
    status === 'finalized'
      ? 3
      : status === 'awaiting_tracking'
        ? 2
        : status === 'awaiting_legal'
          ? 2
          : status === 'awaiting_owner' || status === 'awaiting_tenant'
            ? 1
            : 0;

  return steps.map((label, index) => ({
    label,
    status: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'next',
  }));
}

function buildDetail(contract: ContractRecord, client: ClientContext): ContractDetailView {
  const baseActions =
    client === 'ops'
      ? ['forward', 'clarify', 'escalate', 'audit']
      : client === 'advisor'
        ? ['follow_up', 'collect_signature', 'sync_crm']
        : ['track', 'chat_support', 'submit_complaint'];

  let actions = baseActions;
  if (!contract.lifecycleClosed && client === 'people' && contract.status === 'awaiting_you') {
    actions = ['sign_contract', ...baseActions];
  }
  if (contract.lifecycleClosed || contract.status === 'finalized') {
    actions = [...actions.filter((a) => a !== 'sign_contract'), 'download_pdf'];
  }

  return {
    contract,
    client,
    viewKind: client === 'ops' ? 'ops_view' : client === 'advisor' ? 'advisor_view' : 'people_view',
    timeline: buildTimeline(contract.status),
    actions,
    visibilityReason:
      client === 'ops'
        ? 'Operational access with audited visibility.'
        : client === 'advisor'
          ? 'Advisor-linked or team-visible contract.'
          : 'People-owned or shared contract visible to the involved party.',
  };
}

export const contractService = {
  list(
    client: ClientContext = 'people',
    actorId = 'acct_1',
    teamId = 'team_north',
    filters?: { status?: string; q?: string },
  ): ContractRecord[] {
    let rows = contracts.filter((c) => !c.deleted && canViewContract(c, client, actorId, teamId));

    if (filters?.status === 'pending_user') {
      rows = rows.filter((c) => c.status === 'awaiting_you');
    }
    if (filters?.q?.trim()) {
      const needle = filters.q.trim();
      rows = rows.filter(
        (c) => c.title.includes(needle) || c.message.includes(needle) || (c.propertyLabel?.includes(needle) ?? false),
      );
    }

    return rows;
  },

  resolveDetail(id: string, client: ClientContext = 'people', actorId = 'acct_1', teamId = 'team_north'): ContractAccessResult {
    const contract = contracts.find((item) => item.id.toLowerCase() === id.toLowerCase());
    if (!contract || contract.deleted) {
      return { kind: 'not_found' };
    }
    if (!canViewContract(contract, client, actorId, teamId)) {
      const fr = forbiddenReason(contract, client, actorId, teamId);
      logger.warn('contract_access_denied', { id, client, actorId, scenarioId: fr.scenarioId });
      return { kind: 'forbidden', scenarioId: fr.scenarioId, message: fr.message };
    }
    return { kind: 'ok', detail: buildDetail(contract, client) };
  },

  /** @deprecated use resolveDetail */
  detail(id: string, client: ClientContext = 'people', actorId = 'acct_1', teamId = 'team_north'): ContractDetailView | null {
    const r = this.resolveDetail(id, client, actorId, teamId);
    return r.kind === 'ok' ? r.detail : null;
  },

  signContract(
    id: string,
    userId: string,
    client: ClientContext,
  ):
    | { ok: true; message: string }
    | { ok: false; http: number; error: string; code?: string } {
    const contract = contracts.find((item) => item.id.toLowerCase() === id.toLowerCase());
    if (!contract || contract.deleted) {
      return { ok: false, http: 404, error: 'قرارداد یافت نشد' };
    }
    if (contract.lifecycleClosed || contract.status === 'finalized') {
      return { ok: false, http: 400, error: 'این قرارداد بسته شده و قابل امضا نیست', code: 'SIGN-004' };
    }
    if (!contract.ownerUserIds.includes(userId)) {
      return { ok: false, http: 403, error: 'شما به این قرارداد دسترسی ندارید' };
    }
    if (contract.signedByUserIds.includes(userId)) {
      return { ok: false, http: 409, error: 'شما قبلاً این قرارداد را امضا کرده‌اید', code: 'SIGN-002' };
    }
    if (client === 'people' && contract.status !== 'awaiting_you') {
      return { ok: false, http: 409, error: 'نوبت امضای شما نیست', code: 'SIGN-003' };
    }

    contract.signedByUserIds.push(userId);
    contract.version += 1;
    persist();
    logger.info('contract_signed', { contractId: id, userId, client, audit: 'contract_signed' });
    return { ok: true, message: 'قرارداد با موفقیت امضا شد. نسخه PDF برای شما ارسال شد.' };
  },

  saveDraft(
    id: string,
    version: number,
  ): { ok: true; version: number } | { ok: false; http: number; error: string } {
    const contract = contracts.find((item) => item.id.toLowerCase() === id.toLowerCase());
    if (!contract) {
      return { ok: false, http: 404, error: 'قرارداد یافت نشد' };
    }
    if (contract.version !== version) {
      return {
        ok: false,
        http: 409,
        error: 'این قرارداد توسط کاربر دیگری ویرایش شده است. صفحه را بازخوانی کنید.',
      };
    }
    contract.version += 1;
    persist();
    return { ok: true, version: contract.version };
  },

  pdfFilename(id: string): string | null {
    const c = contracts.find((item) => item.id.toLowerCase() === id.toLowerCase());
    if (!c) {
      return null;
    }
    return `Contract_${id}_${c.date.replace(/\//g, '')}.pdf`;
  },

  removeDraft(id: string): boolean {
    const index = contracts.findIndex((item) => item.id === id && item.draft);
    if (index === -1) {
      return false;
    }

    contracts.splice(index, 1);
    persist();
    return true;
  },
};
