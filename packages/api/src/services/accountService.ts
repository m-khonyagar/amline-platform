export type AccountCollectionItem = {
  id: string;
  title: string;
  city?: string;
  budget?: string;
  status?: string;
};

const listings: AccountCollectionItem[] = [
  { id: 'listing-1', title: 'آپارتمان خوش‌نقشه ۱۸۰ متری', city: 'قم، پردیسان', status: 'منتشر شده' },
  { id: 'listing-2', title: 'ویلا باغ ۴۵۰ متری', city: 'دماوند', status: 'در انتظار تایید' },
];

const needs: AccountCollectionItem[] = [
  { id: 'need-1', title: 'نیازمندی خرید آپارتمان ۲۵۰ متری', city: 'قم، نیروگاه', budget: 'تا ۴ میلیارد' },
  { id: 'need-2', title: 'نیازمندی رهن و اجاره واحد ۱۲۰ متری', city: 'قم، سالاریه', budget: 'رهن کامل' },
];

const bookmarks: AccountCollectionItem[] = [
  { id: 'bookmark-1', title: 'آپارتمان خوش‌نقشه ۱۸۰ متری', city: 'قم، پردیسان' },
  { id: 'bookmark-2', title: 'ویلا باغ ۴۵۰ متری', city: 'دماوند' },
];

const requests: AccountCollectionItem[] = [
  { id: 'req-1', title: 'درخواست بازدید آپارتمان خوش‌نقشه', status: 'در انتظار پاسخ کارشناس' },
  { id: 'req-2', title: 'درخواست استعلام مالکیت', status: 'ثبت شده و در صف بررسی' },
];

export const accountService = {
  listings(): AccountCollectionItem[] {
    return listings;
  },
  needs(): AccountCollectionItem[] {
    return needs;
  },
  bookmarks(): AccountCollectionItem[] {
    return bookmarks;
  },
  requests(): AccountCollectionItem[] {
    return requests;
  },
};
