export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export function getContractStatusMeta(status: string): { label: string; tone: StatusTone; nextAction: string } {
  switch (status) {
    case 'awaiting_you':
      return { label: 'در انتظار شما', tone: 'danger', nextAction: 'بررسی و تکمیل اطلاعات' };
    case 'awaiting_owner':
      return { label: 'در انتظار مالک', tone: 'warning', nextAction: 'پیگیری تایید مالک' };
    case 'awaiting_tenant':
      return { label: 'در انتظار مستاجر', tone: 'warning', nextAction: 'پیگیری تایید مستاجر' };
    case 'awaiting_legal':
      return { label: 'در انتظار بررسی حقوقی', tone: 'info', nextAction: 'انتظار برای بازبینی کارشناس' };
    case 'awaiting_tracking':
      return { label: 'در انتظار کد رهگیری', tone: 'info', nextAction: 'رهگیری وضعیت صدور کد' };
    case 'finalized':
      return { label: 'نهایی شده', tone: 'success', nextAction: 'دانلود و بایگانی قرارداد' };
    case 'cancelled':
      return { label: 'لغو شده', tone: 'danger', nextAction: 'بررسی علت لغو یا شروع قرارداد جدید' };
    default:
      return { label: 'در حال پردازش', tone: 'neutral', nextAction: 'مشاهده جزئیات وضعیت' };
  }
}

export function getPaymentStatusMeta(status: string): { label: string; tone: StatusTone } {
  switch (status) {
    case 'paid':
    case 'success':
      return { label: 'پرداخت شده', tone: 'success' };
    case 'pending':
      return { label: 'در انتظار پرداخت', tone: 'warning' };
    case 'failed':
      return { label: 'ناموفق', tone: 'danger' };
    case 'refunded':
      return { label: 'بازگشت وجه', tone: 'info' };
    default:
      return { label: status || 'نامشخص', tone: 'neutral' };
  }
}
