import { useMemo, useState } from 'react';
import { PageShell } from '../../components/Common/PageShell';
import { MetricCard } from '../../components/UI/MetricCard';
import { SectionCard } from '../../components/UI/SectionCard';

const flowSteps = [
  'اطلاعات مالک',
  'اطلاعات مستاجر',
  'مشخصات ملک',
  'مبالغ قرارداد',
  'پیش‌نویس',
  'امضای قرارداد',
  'تایید کارشناس',
];

const contractTypes = ['رهن و اجاره', 'اجاره روزانه', 'تمدید قرارداد'];

const previewPages = [
  '/assets/amline/contract-1.jpeg',
  '/assets/amline/contract-2.jpeg',
  '/assets/amline/contract-3.jpeg',
  '/assets/amline/contract-4.jpeg',
  '/assets/amline/contract-5.jpeg',
];

type ContractMode = 'form' | 'preview' | 'success' | 'witness';
type WitnessKey = 'owner' | 'tenant';

type WitnessState = {
  name: string;
  mobile: string;
  code: string[];
  verified: boolean;
};

const articleTitles = [
  'ماده 1: مشخصات طرفین',
  'ماده 2: موضوع قرارداد و مشخصات',
  'ماده 3: مدت اجاره',
  'ماده 4: اجاره‌بها و نحوه پرداخت',
  'ماده 5: شرایط تحویل ملک',
  'ماده 6: تعهدات طرفین',
];

export default function NewContractPage() {
  const [contractType, setContractType] = useState(contractTypes[0]);
  const [currentStep, setCurrentStep] = useState(1);
  const [mode, setMode] = useState<ContractMode>('form');
  const [ownerType, setOwnerType] = useState<'individual' | 'company'>('individual');
  const [ibanMode, setIbanMode] = useState<'iban' | 'card'>('iban');
  const [ownerName, setOwnerName] = useState('سارا محمدی');
  const [nationalId, setNationalId] = useState('');
  const [mobile, setMobile] = useState('');
  const [birthDay, setBirthDay] = useState('روز');
  const [birthMonth, setBirthMonth] = useState('ماه');
  const [birthYear, setBirthYear] = useState('سال');
  const [iban, setIban] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [electricityBillId, setElectricityBillId] = useState('');
  const [witnessRequested, setWitnessRequested] = useState(false);
  const [openWitness, setOpenWitness] = useState<WitnessKey>('owner');
  const [otpSheetFor, setOtpSheetFor] = useState<WitnessKey | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [discountSheetOpen, setDiscountSheetOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [commissionPaid, setCommissionPaid] = useState(false);
  const [trackingCodeIssued, setTrackingCodeIssued] = useState(false);
  const [openArticle, setOpenArticle] = useState<number | null>(0);
  const [customCommitment, setCustomCommitment] = useState('');
  const [customCommitments, setCustomCommitments] = useState<string[]>([]);
  const [witnesses, setWitnesses] = useState<Record<WitnessKey, WitnessState>>({
    owner: { name: '', mobile: '', code: ['', '', '', '', ''], verified: false },
    tenant: { name: '', mobile: '', code: ['', '', '', '', ''], verified: false },
  });

  const progress = useMemo(() => Math.round((currentStep / flowSteps.length) * 100), [currentStep]);

  const nextLabel = mode === 'form' ? 'مرحله بعد' : mode === 'preview' ? 'ثبت نهایی' : mode === 'success' ? 'افزودن شاهد' : 'تکمیل فرایند';
  const previousLabel = mode === 'preview' ? 'مرحله قبل' : mode === 'witness' ? 'بازگشت به تایید قرارداد' : 'رد شدن از این مرحله';

  const handleNext = () => {
    if (mode === 'form' && currentStep < 5) {
      setCurrentStep((value) => Math.min(5, value + 1));
      if (currentStep === 4) {
        setMode('preview');
      }
      return;
    }

    if (mode === 'preview') {
      setCurrentStep(6);
      setMode('success');
      return;
    }

    if (mode === 'success') {
      setWitnessRequested(true);
      setMode('witness');
      return;
    }

    if (mode === 'witness') {
      setToastMessage('اطلاعات شاهدها ثبت شد و قرارداد آماده صدور کد رهگیری است.');
    }
  };

  const handlePrevious = () => {
    if (mode === 'preview') {
      setMode('form');
      setCurrentStep(4);
      return;
    }

    if (mode === 'success') {
      setMode('preview');
      setCurrentStep(6);
      setWitnessRequested(false);
      return;
    }

    if (mode === 'witness') {
      setMode('success');
      return;
    }

    setCurrentStep((value) => Math.max(1, value - 1));
  };

  const updateWitness = (key: WitnessKey, field: 'name' | 'mobile', value: string) => {
    setWitnesses((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [field]: value,
      },
    }));
  };

  const updateWitnessCode = (key: WitnessKey, index: number, value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(-1);

    setWitnesses((current) => {
      const nextCode = [...current[key].code];
      nextCode[index] = sanitized;

      return {
        ...current,
        [key]: {
          ...current[key],
          code: nextCode,
        },
      };
    });
  };

  const sendWitnessCode = (key: WitnessKey) => {
    setOtpSheetFor(key);
    setToastMessage(`کد تایید برای ${key === 'owner' ? 'شاهد مالک' : 'شاهد مستاجر'} ارسال شد.`);
  };

  const verifyWitness = () => {
    if (!otpSheetFor) {
      return;
    }

    setWitnesses((current) => ({
      ...current,
      [otpSheetFor]: {
        ...current[otpSheetFor],
        verified: true,
      },
    }));

    setToastMessage(`${otpSheetFor === 'owner' ? 'شاهد مالک' : 'شاهد مستاجر'} با موفقیت تایید شد.`);
    setOpenWitness(otpSheetFor === 'owner' ? 'tenant' : 'tenant');
    setOtpSheetFor(null);
  };

  const allWitnessesVerified = witnesses.owner.verified && witnesses.tenant.verified;
  const unionCommission = 1595000;
  const vatAmount = 159000;
  const discountAmount = discountApplied ? 877000 : 0;
  const payableAmount = unionCommission + vatAmount - discountAmount;
  const articleContent = [
    ['مالک: ' + ownerName, 'مستاجر: علی رضایی', 'شاهد مالک و شاهد مستاجر پس از تایید در این ماده ثبت می‌شوند.'],
    ['نوع قرارداد: ' + contractType, 'ملک واقع در تهران، سعادت‌آباد، میدان کاج.', 'ملک دارای دسترسی کامل به امکانات پایه و قبض برق ثبت‌شده است.'],
    ['مدت قرارداد 12 ماه از 1405/01/01 تا 1405/12/29.', 'تمدید قرارداد منوط به توافق کتبی طرفین است.'],
    ['کمیسیون مصوب: ' + unionCommission.toLocaleString('fa-IR') + ' ریال', 'مالیات: ' + vatAmount.toLocaleString('fa-IR') + ' ریال', 'مبلغ نهایی: ' + payableAmount.toLocaleString('fa-IR') + ' ریال'],
    ['تحویل ملک هم‌زمان با تسویه اولیه انجام می‌شود.', 'مالک موظف است شناسه‌های آب، برق و گاز را در اختیار مستاجر قرار دهد.'],
    ['طرفین متعهد به رعایت مفاد قرارداد و ثبت هرگونه الحاقیه در بستر املاین هستند.', ...customCommitments],
  ];

  return (
    <PageShell
      title="فلو انعقاد قرارداد مطابق الگوی فیگما"
      subtitle="این صفحه بر اساس flow فایل Figma برای قرارداد رهن و اجاره بازطراحی شده است: progress bar هفت‌مرحله‌ای، فرم مالک با branch حقیقی/حقوقی، پیش‌نویس قرارداد، مرحله امضا و success state با افزودن شاهد."
    >
      <div className="amline-section-grid" style={{ marginBottom: '1rem' }}>
        <MetricCard label="مرحله فعال" value={flowSteps[currentStep - 1]} />
        <MetricCard label="درصد پیشرفت" value={`${progress}%`} />
        <MetricCard label="نوع قرارداد" value={contractType} />
      </div>

      <div className="amline-contract-layout">
        <div className="amline-contract-phone">
          <div className="amline-contract-phone__status">
            <span>12:30</span>
            <span>◉ ◔ ▯</span>
          </div>

          <div className="amline-contract-phone__bar">
            <span onClick={handlePrevious} style={{ cursor: 'pointer', color: '#667085' }}>→</span>
            <h2>
              {mode === 'form' ? 'اطلاعات مالک' : mode === 'preview' ? 'امضای قرارداد' : 'تایید قرارداد'}
            </h2>
          </div>

          <div className="amline-contract-phone__body">
            <div className="amline-contract-progress-card">
              <div className="amline-contract-progress">
                {flowSteps.map((step, index) => {
                  const stepNumber = index + 1;
                  const isActive = stepNumber === currentStep;

                  return (
                    <div
                      key={step}
                      className={`amline-contract-progress__item${isActive ? ' amline-contract-progress__item--active' : ''}`}
                    >
                      <span className="amline-contract-progress__dot" />
                      {isActive ? <span className="amline-contract-progress__label">{step}</span> : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {mode === 'form' ? (
              <div className="amline-contract-card">
                <div className="amline-contract-header">
                  <button className="amline-contract-inline-action" type="button">
                    حذف
                  </button>
                  <span>اطلاعات مالک اول</span>
                </div>

                <div className="amline-radio-row" style={{ marginBottom: '1rem' }}>
                  <button
                    className={`amline-radio-pill${ownerType === 'company' ? ' amline-radio-pill--active' : ''}`}
                    onClick={() => setOwnerType('company')}
                    type="button"
                  >
                    <span>شخص حقوقی هستم</span>
                    <span className="amline-radio-pill__dot" />
                  </button>
                  <button
                    className={`amline-radio-pill${ownerType === 'individual' ? ' amline-radio-pill--active' : ''}`}
                    onClick={() => setOwnerType('individual')}
                    type="button"
                  >
                    <span>شخص حقیقی هستم</span>
                    <span className="amline-radio-pill__dot" />
                  </button>
                </div>

                <div className="amline-form-grid">
                  {ownerType === 'company' ? (
                    <>
                      <div className="amline-field amline-field--full">
                        <span>نام شرکت</span>
                        <input className="amline-input" value={ownerName} onChange={(event) => setOwnerName(event.target.value)} placeholder="نام شرکت را وارد کنید" />
                      </div>
                      <div className="amline-field amline-field--full">
                        <span>شناسه ملی شرکت</span>
                        <input className="amline-input" placeholder="شناسه ملی را وارد کنید" />
                      </div>
                      <div className="amline-field amline-field--full">
                        <span>شماره ثبت</span>
                        <input className="amline-input" placeholder="شماره ثبت را وارد کنید" />
                      </div>
                      <div className="amline-field amline-field--full">
                        <span>این شرکت دانش‌بنیان است؟</span>
                        <div className="amline-radio-row">
                          <button className="amline-radio-pill amline-radio-pill--active" type="button">
                            <span>است</span>
                            <span className="amline-radio-pill__dot" />
                          </button>
                          <button className="amline-radio-pill" type="button">
                            <span>نیست</span>
                            <span className="amline-radio-pill__dot" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="amline-field amline-field--full">
                        <span>کدملی</span>
                        <input className="amline-input" value={nationalId} onChange={(event) => setNationalId(event.target.value)} placeholder="کدملی خود را وارد کنید" />
                      </div>
                      <div className="amline-footer__meta" style={{ marginTop: '-0.6rem' }}>
                        کدملی و شماره موبایل باید متعلق به یک نفر باشد
                      </div>
                      <div className="amline-field amline-field--full">
                        <span>شماره موبایل</span>
                        <input className="amline-input" value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="شماره موبایل خود را وارد کنید" />
                      </div>
                      <div className="amline-field amline-field--full">
                        <span>تاریخ تولد</span>
                        <div className="amline-form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                          <select className="amline-select" value={birthDay} onChange={(event) => setBirthDay(event.target.value)}>
                            <option>روز</option>
                            <option>01</option>
                            <option>02</option>
                            <option>03</option>
                          </select>
                          <select className="amline-select" value={birthMonth} onChange={(event) => setBirthMonth(event.target.value)}>
                            <option>ماه</option>
                            <option>فروردین</option>
                            <option>اردیبهشت</option>
                            <option>خرداد</option>
                          </select>
                          <select className="amline-select" value={birthYear} onChange={(event) => setBirthYear(event.target.value)}>
                            <option>سال</option>
                            <option>1375</option>
                            <option>1376</option>
                            <option>1377</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="amline-contract-divider">اطلاعات حساب</div>
                <div className="amline-radio-row" style={{ marginBottom: '0.75rem' }}>
                  <button
                    className={`amline-radio-pill${ibanMode === 'card' ? ' amline-radio-pill--active' : ''}`}
                    onClick={() => setIbanMode('card')}
                    type="button"
                  >
                    <span>شماره کارت</span>
                    <span className="amline-radio-pill__dot" />
                  </button>
                  <button
                    className={`amline-radio-pill${ibanMode === 'iban' ? ' amline-radio-pill--active' : ''}`}
                    onClick={() => setIbanMode('iban')}
                    type="button"
                  >
                    <span>شماره شبا</span>
                    <span className="amline-radio-pill__dot" />
                  </button>
                </div>

                <div className="amline-field">
                  <input
                    className="amline-input"
                    value={iban}
                    onChange={(event) => setIban(event.target.value)}
                    placeholder={ibanMode === 'iban' ? 'IR شماره شبای 24 رقمی را وارد کنید' : 'شماره کارت 16 رقمی را وارد کنید'}
                  />
                </div>

                <div className="amline-contract-divider">اطلاعات محل سکونت</div>
                <div className="amline-form-grid">
                  <div className="amline-field amline-field--full">
                    <span>کدپستی محل سکونت</span>
                    <input className="amline-input" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} placeholder="کدپستی را وارد کنید" />
                  </div>
                  <div className="amline-field amline-field--full">
                    <span>شناسه قبض برق محل سکونت</span>
                    <input className="amline-input" value={electricityBillId} onChange={(event) => setElectricityBillId(event.target.value)} placeholder="شناسه قبض برق را وارد کنید" />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <button className="amline-contract-inline-action" type="button">
                    افزودن مالک جدید +
                  </button>
                </div>
              </div>
            ) : null}

            {mode === 'preview' ? (
              <>
                <div className="amline-contract-card">
                  <div className="amline-contract-preview__toolbar">
                    <button className="amline-contract-inline-action" type="button">
                      دانلود فایل
                    </button>
                    <span>پیش‌نویس قرارداد</span>
                  </div>

                  <div className="amline-contract-preview">
                    <div className="amline-contract-preview__stack">
                      {previewPages.map((src) => (
                        <img key={src} src={src} alt="پیش‌نمایش قرارداد" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="amline-contract-card">
                  <div className="amline-contract-divider">امضای قرارداد</div>
                  <div className="amline-sign-list">
                    <div className="amline-sign-row">
                      <button
                        className="amline-button amline-button--ghost"
                        onClick={() => {
                          setCommissionPaid(true);
                          setToastMessage('امضای مالک ثبت شد.');
                        }}
                        type="button"
                      >
                        {commissionPaid ? 'کمیسیون پرداخت شد' : 'ثبت امضای مالک'}
                      </button>
                      <span className="amline-sign-row__status">امضای مالک ✓</span>
                    </div>
                    <div className="amline-sign-row">
                      <button
                        className="amline-button amline-button--ghost"
                        onClick={() => setDiscountSheetOpen(true)}
                        type="button"
                      >
                        پرداخت کمیسیون
                      </button>
                      <span className="amline-sign-row__status">امضای مستاجر ✓</span>
                    </div>
                    <div className="amline-sign-row">
                      <span />
                      <span className="amline-sign-row__status">امضای تنظیم‌کننده قرارداد ✓</span>
                    </div>
                  </div>
                </div>

                <div className="amline-contract-card">
                  <div className="amline-contract-divider">مواد پیش‌نویس قرارداد</div>
                  <div className="amline-article-list">
                    {articleTitles.map((title, index) => (
                      <div className="amline-article" key={title}>
                        <button
                          className="amline-article__header"
                          onClick={() => setOpenArticle(openArticle === index ? null : index)}
                          type="button"
                        >
                          <span>{openArticle === index ? '−' : '+'}</span>
                          <strong>{title}</strong>
                        </button>
                        {openArticle === index ? (
                          <div className="amline-article__body">
                            <ul>
                              {articleContent[index].map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                            {index === 5 ? (
                              <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
                                <input
                                  className="amline-input"
                                  value={customCommitment}
                                  onChange={(event) => setCustomCommitment(event.target.value)}
                                  placeholder="بند جدیدی به تعهدات اضافه کنید"
                                />
                                <button
                                  className="amline-button amline-button--ghost"
                                  onClick={() => {
                                    if (!customCommitment.trim()) {
                                      return;
                                    }

                                    setCustomCommitments((items) => [...items, customCommitment.trim()]);
                                    setToastMessage(`بند جدید به ماده 6 افزوده شد: ${customCommitment.trim()}`);
                                    setCustomCommitment('');
                                  }}
                                  type="button"
                                >
                                  اضافه کردن بند به تعهدات
                                </button>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="amline-contract-card amline-commission-card">
                  <div className="amline-commission-discount">
                    <button className="amline-contract-inline-action" onClick={() => setDiscountSheetOpen(true)} type="button">
                      {discountApplied ? 'ویرایش' : 'ورود'}
                    </button>
                    <div style={{ textAlign: 'right' }}>
                      <strong>{discountApplied ? `کد تخفیف ${discountCode || 'AMLINE50'}` : 'کد تخفیف دارید؟'}</strong>
                      <small>{discountApplied ? 'کد تخفیف با موفقیت اعمال شد' : 'کد تخفیف خود را وارد کنید'}</small>
                    </div>
                  </div>

                  <div className="amline-commission-lines">
                    <div className="amline-commission-row">
                      <span className="amline-commission-row__amount">◌ {unionCommission.toLocaleString('fa-IR')}</span>
                      <span>کمیسیون مصوب اتحادیه املاک</span>
                    </div>
                    <div className="amline-commission-row">
                      <span className="amline-commission-row__amount">◌ {vatAmount.toLocaleString('fa-IR')}</span>
                      <span>٪۱۰ مالیات بر ارزش افزوده</span>
                    </div>
                    {discountApplied ? (
                      <div className="amline-commission-row amline-commission-row--discount">
                        <span className="amline-commission-row__amount">◌ {discountAmount.toLocaleString('fa-IR')}</span>
                        <span>تخفیف</span>
                      </div>
                    ) : null}
                    <div className="amline-commission-separator" />
                    <div className="amline-commission-row amline-commission-row--total">
                      <span className="amline-commission-row__amount">◌ {payableAmount.toLocaleString('fa-IR')}</span>
                      <span>مبلغ قابل پرداخت</span>
                    </div>
                  </div>
                </div>

                <div className="amline-payment-status">
                  <div className="amline-payment-status__top">
                    <span className={`amline-status-chip ${commissionPaid ? 'amline-status-chip--success' : 'amline-status-chip--warning'}`}>
                      {commissionPaid ? 'پرداخت شده' : 'در انتظار پرداخت'}
                    </span>
                    <span className="amline-pill">پرداخت کمیسیون</span>
                  </div>
                  <div className="amline-commission-row">
                    <span>{new Date().toLocaleDateString('fa-IR')}</span>
                    <span>موعد پرداخت</span>
                  </div>
                  <div className="amline-commission-row">
                    <span>{payableAmount.toLocaleString('fa-IR')} تومان</span>
                    <span>مبلغ</span>
                  </div>
                  <button
                    className="amline-button amline-button--primary"
                    onClick={() => {
                      setCommissionPaid(true);
                      setTrackingCodeIssued(true);
                      setToastMessage('پرداخت کمیسیون ثبت شد و کد رهگیری صادر شد.');
                    }}
                    type="button"
                  >
                    {trackingCodeIssued ? 'کد رهگیری : 2181024959521' : 'ثبت پرداخت و صدور کد رهگیری'}
                  </button>
                </div>
              </>
            ) : null}

            {mode === 'success' ? (
              <div className="amline-contract-card amline-success-card">
                <div className="amline-success-card__icon" />
                <h3>قرارداد امضا شد و در انتظار تایید کارشناس است</h3>
                <p>
                  قرارداد شما پس از تأیید کارشناس حقوقی املاین معتبر و لازم‌الاجرا خواهد بود. با معرفی یک شاهد از سوی هر طرف
                  می‌توانید کد رهگیری رایگان دریافت و قرارداد را در سامانه رسمی املاک ثبت کنید.
                </p>
                <div className="amline-warning">
                  <strong>توجه!</strong>
                  <p>ثبت شاهد اختیاری است و در صورت عدم معرفی شاهد، فقط برای قرارداد شما کد رهگیری صادر نخواهد شد.</p>
                </div>
                {witnessRequested ? (
                  <div className="amline-notice">
                    درخواست افزودن شاهد ثبت شد و در ادامه می‌توان فلو معرفی شاهد را نیز روی همین صفحه کامل کرد.
                  </div>
                ) : null}
              </div>
            ) : null}

            {mode === 'witness' ? (
              <>
                {toastMessage ? <div className="amline-witness-toast">{toastMessage}</div> : null}

                <div className="amline-witness-list">
                  <div className="amline-witness-item">
                    <div
                      className={`amline-witness-item__header${witnesses.owner.verified ? ' amline-witness-item__header--done' : ''}`}
                      onClick={() => setOpenWitness(openWitness === 'owner' ? 'tenant' : 'owner')}
                    >
                      <span>{openWitness === 'owner' ? '⌃' : '⌄'}</span>
                      <strong>{witnesses.owner.verified ? '✓ ' : ''}اطلاعات شاهد مالک</strong>
                    </div>
                    {openWitness === 'owner' ? (
                      <div className="amline-witness-item__body">
                        <div className="amline-form-grid">
                          <div className="amline-field amline-field--full">
                            <span>نام و نام خانوادگی</span>
                            <input
                              className="amline-input"
                              value={witnesses.owner.name}
                              onChange={(event) => updateWitness('owner', 'name', event.target.value)}
                              placeholder="نام شاهد مالک را وارد کنید"
                            />
                          </div>
                          <div className="amline-field amline-field--full">
                            <span>شماره موبایل</span>
                            <input
                              className="amline-input"
                              value={witnesses.owner.mobile}
                              onChange={(event) => updateWitness('owner', 'mobile', event.target.value)}
                              placeholder="شماره موبایل شاهد مالک"
                            />
                          </div>
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                          <button className="amline-contract-inline-action" onClick={() => sendWitnessCode('owner')} type="button">
                            {witnesses.owner.verified ? 'ارسال مجدد کد' : 'ثبت و ارسال کد'}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="amline-witness-item">
                    <div
                      className={`amline-witness-item__header${witnesses.tenant.verified ? ' amline-witness-item__header--done' : ''}`}
                      onClick={() => setOpenWitness(openWitness === 'tenant' ? 'owner' : 'tenant')}
                    >
                      <span>{openWitness === 'tenant' ? '⌃' : '⌄'}</span>
                      <strong>{witnesses.tenant.verified ? '✓ ' : ''}اطلاعات شاهد مستاجر</strong>
                    </div>
                    {openWitness === 'tenant' ? (
                      <div className="amline-witness-item__body">
                        <div className="amline-form-grid">
                          <div className="amline-field amline-field--full">
                            <span>نام و نام خانوادگی</span>
                            <input
                              className="amline-input"
                              value={witnesses.tenant.name}
                              onChange={(event) => updateWitness('tenant', 'name', event.target.value)}
                              placeholder="نام شاهد مستاجر را وارد کنید"
                            />
                          </div>
                          <div className="amline-field amline-field--full">
                            <span>شماره موبایل</span>
                            <input
                              className="amline-input"
                              value={witnesses.tenant.mobile}
                              onChange={(event) => updateWitness('tenant', 'mobile', event.target.value)}
                              placeholder="شماره موبایل شاهد مستاجر"
                            />
                          </div>
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                          <button className="amline-contract-inline-action" onClick={() => sendWitnessCode('tenant')} type="button">
                            {witnesses.tenant.verified ? 'ارسال مجدد کد' : 'ثبت و ارسال کد'}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {allWitnessesVerified ? (
                  <div className="amline-notice">
                    شاهد مالک و شاهد مستاجر تایید شدند و این branch از فرایند فیگما کامل شده است.
                  </div>
                ) : null}
              </>
            ) : null}
          </div>

          <div className={`amline-contract-fixed${mode !== 'form' ? ' amline-contract-fixed--dual' : ''}`}>
            {mode !== 'form' ? (
              <button className="amline-button amline-button--ghost" onClick={handlePrevious} type="button">
                {previousLabel}
              </button>
            ) : null}
            <button className="amline-button amline-button--primary" onClick={handleNext} type="button">
              {nextLabel}
            </button>
          </div>

          {otpSheetFor ? (
            <div className="amline-bottom-sheet-overlay">
              <div className="amline-bottom-sheet">
                <div className="amline-bottom-sheet__handle" />
                <div className="amline-bottom-sheet__header">
                  <button className="amline-contract-inline-action" onClick={() => setOtpSheetFor(null)} type="button">
                    بستن
                  </button>
                  <strong>کد تایید {otpSheetFor === 'owner' ? 'شاهد مالک' : 'شاهد مستاجر'}</strong>
                </div>
                <div className="amline-footer__meta" style={{ marginBottom: '1rem' }}>
                  کد 5 رقمی ارسال‌شده را وارد کنید
                </div>
                <div className="amline-bottom-sheet__otp">
                  {witnesses[otpSheetFor].code.map((value, index) => (
                    <input
                      key={`${otpSheetFor}-${index}`}
                      className="amline-input"
                      value={value}
                      onChange={(event) => updateWitnessCode(otpSheetFor, index, event.target.value)}
                      inputMode="numeric"
                    />
                  ))}
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <button className="amline-button amline-button--primary" onClick={verifyWitness} type="button" style={{ width: '100%' }}>
                    تایید کد
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {discountSheetOpen ? (
            <div className="amline-bottom-sheet-overlay">
              <div className="amline-bottom-sheet">
                <div className="amline-bottom-sheet__handle" />
                <div className="amline-bottom-sheet__header">
                  <button className="amline-contract-inline-action" onClick={() => setDiscountSheetOpen(false)} type="button">
                    بستن
                  </button>
                  <strong>ثبت کد تخفیف</strong>
                </div>
                <div className="amline-field">
                  <input
                    className="amline-input"
                    value={discountCode}
                    onChange={(event) => setDiscountCode(event.target.value.toUpperCase())}
                    placeholder="کد تخفیف خود را وارد کنید"
                  />
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <button
                    className="amline-button amline-button--primary"
                    onClick={() => {
                      setDiscountApplied(true);
                      setDiscountSheetOpen(false);
                      setToastMessage(`کد تخفیف ${discountCode || 'AMLINE50'} با موفقیت اعمال شد.`);
                    }}
                    type="button"
                    style={{ width: '100%' }}
                  >
                    اعمال کد تخفیف
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <SectionCard title="ترجمه‌ی فیگما به وب">
            <div style={{ display: 'grid', gap: '0.85rem', lineHeight: 1.9, color: '#475467' }}>
              <div>فلو اصلی فیگما به سه state اجرایی شکسته شد: فرم اطلاعات مالک، پیش‌نویس و امضای قرارداد، سپس وضعیت موفقیت و افزودن شاهد.</div>
              <div>progress bar هفت‌مرحله‌ای، header موبایل، fixed action bar پایین، و cardهای border-light مطابق ساختار nodeهای فایل بازسازی شدند.</div>
              <div>branch حقیقی/حقوقی، انتخاب شبا یا کارت، اطلاعات محل سکونت، preview چندصفحه‌ای قرارداد و status امضاها همگی مطابق نمونه وارد flow شدند.</div>
              <div>branch جدید «شاهد» هم از node انتخابی اضافه شد: accordion شاهد مالک/مستاجر، ارسال کد، bottom sheet ورود OTP، toast تایید و وضعیت تکمیل هر شاهد.</div>
            </div>
          </SectionCard>

          <SectionCard title="داده‌های نمایشی">
            <div className="amline-form-grid">
              <div className="amline-field">
                <span>نام/عنوان مالک</span>
                <input className="amline-input" value={ownerName} onChange={(event) => setOwnerName(event.target.value)} />
              </div>
              <div className="amline-field">
                <span>نوع قرارداد</span>
                <select className="amline-select" value={contractType} onChange={(event) => setContractType(event.target.value)}>
                  {contractTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </PageShell>
  );
}
