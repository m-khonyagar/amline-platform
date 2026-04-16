import type { PaymentSummary, PropertySummary } from '../services/api';

export type FunnelStage = {
  key: string;
  label: string;
  value: number;
  rateFromPrevious: number;
};

function withRates(stages: Array<{ key: string; label: string; value: number }>): FunnelStage[] {
  return stages.map((stage, index) => {
    const previous = index === 0 ? stage.value : stages[index - 1]?.value ?? stage.value;
    const rateFromPrevious = previous > 0 ? Math.round((stage.value / previous) * 100) : 0;
    return { ...stage, rateFromPrevious };
  });
}

export function buildMarketplaceFunnel(properties: PropertySummary[], payments: PaymentSummary[]): FunnelStage[] {
  const visits = Math.max(120, properties.length * 20);
  const leads = Math.max(24, Math.round(visits * 0.32));
  const contracts = Math.max(8, properties.length);
  const successfulPayments = Math.max(4, payments.length);
  const retained = Math.max(2, Math.round(successfulPayments * 0.65));

  return withRates([
    { key: 'visit', label: 'بازدید و کشف', value: visits },
    { key: 'lead', label: 'سرنخ واجد شرایط', value: leads },
    { key: 'contract', label: 'ورود به قرارداد', value: contracts },
    { key: 'payment', label: 'پرداخت موفق', value: successfulPayments },
    { key: 'retain', label: 'بازگشت و تکرار', value: retained },
  ]);
}

export function buildOperationsFunnel(properties: PropertySummary[], payments: PaymentSummary[]): FunnelStage[] {
  const leads = Math.max(10, properties.length * 3);
  const contracts = Math.max(4, properties.length);
  const paid = Math.max(2, payments.length);
  const retention = Math.max(1, Math.round(paid * 0.6));

  return withRates([
    { key: 'lead', label: 'سرنخ فعال', value: leads },
    { key: 'contract', label: 'پرونده قراردادی', value: contracts },
    { key: 'paid', label: 'تسویه موفق', value: paid },
    { key: 'retention', label: 'مشتری بازگشتی', value: retention },
  ]);
}
