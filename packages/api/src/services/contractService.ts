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
};

const contracts: ContractRecord[] = [
  {
    id: 'draft-contract-1',
    title: 'قرارداد رهن و اجاره جدید',
    date: '۱۴۰۴/۱۰/۱۹',
    tab: 'active',
    status: 'awaiting_you',
    message: 'هنوز هیچ اطلاعاتی ثبت نشده است',
    draft: true,
  },
  {
    id: 'active-contract-1',
    title: 'قرارداد رهن و اجاره جدید',
    counterpartLabel: 'مستاجر: علی احمدی',
    date: '۱۴۰۴/۱۰/۱۹',
    tab: 'active',
    status: 'awaiting_you',
    message: 'اطلاعات خود را تکمیل کنید و قرارداد را امضا کنید',
  },
  {
    id: 'active-contract-2',
    title: 'قرارداد رهن و اجاره جدید',
    counterpartLabel: 'مالک: علی احمدی',
    date: '۱۴۰۴/۱۰/۱۹',
    tab: 'active',
    status: 'awaiting_owner',
    message: 'منتظر تکمیل اطلاعات و امضای مالک باشید',
  },
  {
    id: 'active-contract-3',
    title: 'رهن و اجاره آپارتمان در زنبیل‌آباد',
    counterpartLabel: 'مستاجر: علی احمدی',
    date: '۱۴۰۴/۱۰/۱۹',
    tab: 'active',
    status: 'awaiting_tenant',
    message: 'منتظر تکمیل اطلاعات و امضای مستاجر باشید',
  },
  {
    id: 'active-contract-4',
    title: 'رهن و اجاره آپارتمان در زنبیل‌آباد',
    counterpartLabel: 'مستاجر: علی احمدی',
    date: '۱۴۰۴/۱۰/۱۹',
    tab: 'active',
    status: 'awaiting_legal',
    message: 'قرارداد در حال بررسی توسط کارشناس حقوقی است',
  },
  {
    id: 'completed-contract-1',
    title: 'رهن و اجاره آپارتمان در زنبیل‌آباد',
    counterpartLabel: 'مستاجر: علی احمدی',
    date: '۱۴۰۴/۱۰/۱۹',
    tab: 'completed',
    status: 'awaiting_tracking',
    message: 'اطلاعات قرارداد در حال ثبت در سامانه رسمی است',
  },
  {
    id: 'completed-contract-2',
    title: 'قرارداد نهایی فایل ۱۴',
    counterpartLabel: 'مستاجر: مهدی رضایی',
    date: '۱۴۰۴/۱۰/۲۰',
    tab: 'completed',
    status: 'finalized',
    message: 'قرارداد نهایی شده و کد رهگیری صادر شده است',
  },
];

export const contractService = {
  list(): ContractRecord[] {
    return contracts;
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
