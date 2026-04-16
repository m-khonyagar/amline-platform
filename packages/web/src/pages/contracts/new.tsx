import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { AppShellLayout } from '../../components/Common/AppShellLayout';
import { useAuth } from '../../hooks/useAuth';

type ContractStep = 'lessor' | 'tenant' | 'property' | 'terms' | 'review' | 'success';

type ContractDraft = {
  lessorName: string;
  lessorMobile: string;
  tenantName: string;
  tenantMobile: string;
  propertyTitle: string;
  propertyAddress: string;
  depositAmount: string;
  rentAmount: string;
  startDate: string;
  durationMonths: string;
};

const storageKey = 'amline.contract.rental';
const sessionKey = 'amline.session';

const steps: Array<{ key: ContractStep; title: string; subtitle: string }> = [
  { key: 'lessor', title: 'اطلاعات موجر', subtitle: 'مشخصات صاحب ملک را ثبت کنید.' },
  { key: 'tenant', title: 'اطلاعات مستاجر', subtitle: 'مشخصات طرف مقابل قرارداد را وارد کنید.' },
  { key: 'property', title: 'اطلاعات ملک', subtitle: 'عنوان و نشانی ملک را ثبت کنید.' },
  { key: 'terms', title: 'جزئیات قرارداد', subtitle: 'رهن، اجاره و زمان شروع قرارداد را مشخص کنید.' },
  { key: 'review', title: 'مرور نهایی', subtitle: 'اطلاعات را قبل از ثبت نهایی مرور کنید.' },
  { key: 'success', title: 'ثبت اولیه انجام شد', subtitle: 'پیش‌نویس قرارداد در حساب شما ذخیره شد.' },
];

const defaultDraft: ContractDraft = {
  lessorName: '',
  lessorMobile: '',
  tenantName: '',
  tenantMobile: '',
  propertyTitle: '',
  propertyAddress: '',
  depositAmount: '',
  rentAmount: '',
  startDate: '',
  durationMonths: '12',
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'numeric';
}) {
  return (
    <label className="amline-field">
      <span>{label}</span>
      <input
        className="amline-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        dir={inputMode === 'numeric' ? 'ltr' : undefined}
      />
    </label>
  );
}

export default function NewContractPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<ContractDraft>(defaultDraft);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const hasStoredSession = Boolean(window.localStorage.getItem(sessionKey));
    if (!isAuthenticated && !hasStoredSession) {
      void router.replace(`/auth/login?returnTo=${encodeURIComponent('/contracts/new')}`);
    }
    setAuthChecked(true);
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { stepIndex: number; draft: ContractDraft };
      setStepIndex(parsed.stepIndex);
      setDraft({ ...defaultDraft, ...parsed.draft });
    } catch {
      window.sessionStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isAuthenticated) {
      return;
    }
    window.sessionStorage.setItem(storageKey, JSON.stringify({ stepIndex, draft }));
  }, [draft, isAuthenticated, stepIndex]);

  const currentStep = steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  const canContinue = useMemo(() => {
    switch (currentStep.key) {
      case 'lessor':
        return draft.lessorName.trim().length >= 3 && /^09\d{9}$/.test(draft.lessorMobile.trim());
      case 'tenant':
        return draft.tenantName.trim().length >= 3 && /^09\d{9}$/.test(draft.tenantMobile.trim());
      case 'property':
        return draft.propertyTitle.trim().length >= 5 && draft.propertyAddress.trim().length >= 10;
      case 'terms':
        return Boolean(draft.depositAmount && draft.rentAmount && draft.startDate && draft.durationMonths);
      case 'review':
        return true;
      case 'success':
        return true;
      default:
        return false;
    }
  }, [currentStep.key, draft]);

  function updateDraft<K extends keyof ContractDraft>(key: K, value: ContractDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function goNext() {
    if (currentStep.key === 'review') {
      setStepIndex(steps.findIndex((item) => item.key === 'success'));
      return;
    }
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  function renderStep() {
    switch (currentStep.key) {
      case 'lessor':
        return (
          <div className="amline-contract-wizard__fields">
            <Field label="نام و نام خانوادگی موجر" value={draft.lessorName} onChange={(value) => updateDraft('lessorName', value)} placeholder="مثال: سارا محمدی" />
            <Field label="شماره موبایل موجر" value={draft.lessorMobile} onChange={(value) => updateDraft('lessorMobile', value)} placeholder="09121234567" inputMode="numeric" />
          </div>
        );
      case 'tenant':
        return (
          <div className="amline-contract-wizard__fields">
            <Field label="نام و نام خانوادگی مستاجر" value={draft.tenantName} onChange={(value) => updateDraft('tenantName', value)} placeholder="مثال: علی رضایی" />
            <Field label="شماره موبایل مستاجر" value={draft.tenantMobile} onChange={(value) => updateDraft('tenantMobile', value)} placeholder="09121234567" inputMode="numeric" />
          </div>
        );
      case 'property':
        return (
          <div className="amline-contract-wizard__fields">
            <Field label="عنوان ملک" value={draft.propertyTitle} onChange={(value) => updateDraft('propertyTitle', value)} placeholder="آپارتمان ۱۲۰ متری در سعادت‌آباد" />
            <label className="amline-field">
              <span>نشانی ملک</span>
              <textarea
                className="amline-textarea"
                rows={4}
                value={draft.propertyAddress}
                onChange={(event) => updateDraft('propertyAddress', event.target.value)}
                placeholder="نشانی کامل ملک را وارد کنید"
              />
            </label>
          </div>
        );
      case 'terms':
        return (
          <div className="amline-contract-wizard__fields">
            <Field label="مبلغ رهن" value={draft.depositAmount} onChange={(value) => updateDraft('depositAmount', value)} placeholder="500000000" inputMode="numeric" />
            <Field label="مبلغ اجاره ماهانه" value={draft.rentAmount} onChange={(value) => updateDraft('rentAmount', value)} placeholder="15000000" inputMode="numeric" />
            <Field label="تاریخ شروع قرارداد" value={draft.startDate} onChange={(value) => updateDraft('startDate', value)} placeholder="1405/01/20" inputMode="numeric" />
            <Field label="مدت قرارداد (ماه)" value={draft.durationMonths} onChange={(value) => updateDraft('durationMonths', value)} placeholder="12" inputMode="numeric" />
          </div>
        );
      case 'review':
        return (
          <div className="amline-contract-review">
            <article><strong>موجر</strong><span>{draft.lessorName} - {draft.lessorMobile}</span></article>
            <article><strong>مستاجر</strong><span>{draft.tenantName} - {draft.tenantMobile}</span></article>
            <article><strong>ملک</strong><span>{draft.propertyTitle}</span></article>
            <article><strong>نشانی</strong><span>{draft.propertyAddress}</span></article>
            <article><strong>رهن</strong><span>{draft.depositAmount}</span></article>
            <article><strong>اجاره</strong><span>{draft.rentAmount}</span></article>
            <article><strong>شروع / مدت</strong><span>{draft.startDate} / {draft.durationMonths} ماه</span></article>
          </div>
        );
      case 'success':
        return (
          <div className="amline-contract-success">
            <strong>پیش‌نویس قرارداد ذخیره شد</strong>
            <p>اطلاعات قرارداد داخل حساب شما ثبت شد و می‌توانید ادامه فرایند را از بخش قراردادها پیگیری کنید.</p>
          </div>
        );
      default:
        return null;
    }
  }

  if (!authChecked || !isAuthenticated) {
    return null;
  }

  return (
    <AppShellLayout title="قرارداد رهن و اجاره" activeNavHref="/contracts">
      <section className="amline-contract-wizard">
        <div className="amline-contract-wizard__progress">
          <div>
            <strong>{currentStep.title}</strong>
            <span>{currentStep.subtitle}</span>
          </div>
          <span>{stepIndex + 1} / {steps.length}</span>
        </div>

        <progress className="amline-progress-bar" value={progress} max={100} />

        <div className="amline-contract-wizard__steps">
          {steps.slice(0, 5).map((step, index) => (
            <button
              key={step.key}
              type="button"
              className={`amline-contract-wizard__step${index === stepIndex ? ' is-active' : ''}${index < stepIndex ? ' is-complete' : ''}`}
              onClick={() => setStepIndex(index)}
            >
              <span>{index + 1}</span>
              <strong>{step.title}</strong>
            </button>
          ))}
        </div>

        <div className="amline-contract-wizard__card">{renderStep()}</div>

        <div className="amline-contract-wizard__actions">
          {stepIndex > 0 && currentStep.key !== 'success' ? (
            <button type="button" className="amline-button amline-button--ghost" onClick={() => setStepIndex((current) => Math.max(0, current - 1))}>
              مرحله قبل
            </button>
          ) : <span />}
          {currentStep.key === 'success' ? (
            <button
              type="button"
              className="amline-button amline-button--primary"
              onClick={() => router.push('/contracts')}
            >
              بازگشت به قراردادها
            </button>
          ) : (
            <button type="button" className="amline-button amline-button--primary" disabled={!canContinue} onClick={goNext}>
              {currentStep.key === 'review' ? 'ثبت اولیه قرارداد' : 'ادامه'}
            </button>
          )}
        </div>
      </section>
    </AppShellLayout>
  );
}
