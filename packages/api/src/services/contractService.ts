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
};

export type ContractDetailView = {
  contract: ContractRecord;
  client: ClientContext;
  viewKind: 'people_view' | 'advisor_view' | 'ops_view';
  timeline: Array<{ label: string; status: 'done' | 'current' | 'next' }>;
  actions: string[];
  visibilityReason: string;
};

const contracts: ContractRecord[] = [
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
  },
];

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

function buildTimeline(status: ContractRecord['status']): Array<{ label: string; status: 'done' | 'current' | 'next' }> {
  const steps = ['ثبت اطلاعات', 'تایید طرفین', 'بازبینی حقوقی', 'رهگیری و نهایی‌سازی'];
  const currentIndex =
    status === 'finalized' ? 3 :
    status === 'awaiting_tracking' ? 2 :
    status === 'awaiting_legal' ? 2 :
    status === 'awaiting_owner' || status === 'awaiting_tenant' ? 1 : 0;

  return steps.map((label, index) => ({
    label,
    status: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'next',
  }));
}

export const contractService = {
  list(client: ClientContext = 'people', actorId = 'acct_1', teamId = 'team_north'): ContractRecord[] {
    return contracts.filter((contract) => canViewContract(contract, client, actorId, teamId));
  },
  detail(id: string, client: ClientContext = 'people', actorId = 'acct_1', teamId = 'team_north'): ContractDetailView | null {
    const contract = contracts.find((item) => item.id.toLowerCase() === id.toLowerCase());
    if (!contract || !canViewContract(contract, client, actorId, teamId)) {
      return null;
    }

    return {
      contract,
      client,
      viewKind: client === 'ops' ? 'ops_view' : client === 'advisor' ? 'advisor_view' : 'people_view',
      timeline: buildTimeline(contract.status),
      actions:
        client === 'ops'
          ? ['forward', 'clarify', 'escalate', 'audit']
          : client === 'advisor'
            ? ['follow_up', 'collect_signature', 'sync_crm']
            : ['track', 'chat_support', 'submit_complaint'],
      visibilityReason:
        client === 'ops'
          ? 'Operational access with audited visibility.'
          : client === 'advisor'
            ? 'Advisor-linked or team-visible contract.'
            : 'People-owned or shared contract visible to the involved party.',
    };
  },
  removeDraft(id: string): boolean {
    const index = contracts.findIndex((item) => item.id === id && item.draft);
    if (index === -1) {
      return false;
    }

    contracts.splice(index, 1);
    return true;
  },
};
