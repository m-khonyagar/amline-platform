import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Icon } from '../../components/UI/Icon';
import { useAuth } from '../../hooks/useAuth';
import { defaultRouteForRole, personaProfile, type AppRole } from '../../lib/auth';
import { requestAuthOtp, verifyAuthOtp } from '../../services/api';

const personas: Array<{ value: AppRole; label: string; description: string }> = [
  { value: 'seller', label: 'کاربر عادی', description: 'قراردادها، حساب کاربری و پشتیبانی شخصی.' },
  { value: 'advisor', label: 'مشاور املاک', description: 'داشبورد تیم، پیگیری مشتری و عملیات فروش.' },
  { value: 'admin', label: 'ادمین عملیات', description: 'صف بررسی، نظارت، تقلب و گزارش‌های مدیریتی.' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [persona, setPersona] = useState<AppRole>('seller');
  const [mobile, setMobile] = useState('09121234567');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [resendTimer, setResendTimer] = useState(120);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [mobileTouched, setMobileTouched] = useState(false);
  const [otpDevHint, setOtpDevHint] = useState('');
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const otpSubmitRef = useRef('');
  const verifyInFlight = useRef(false);
  const mobileIsValid = /^09\d{9}$/.test(mobile.trim());
  const otpCode = useMemo(() => otp.join(''), [otp]);
  const returnTo = typeof router.query.returnTo === 'string' ? router.query.returnTo : defaultRouteForRole(persona);

  useEffect(() => {
    if (step !== 'otp' || resendTimer <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setResendTimer((value) => (value > 0 ? value - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendTimer, step]);

  useEffect(() => {
    if (step !== 'otp' || otpCode.length !== 6 || otp.some((digit) => digit === '')) {
      return undefined;
    }

    if (otpSubmitRef.current === otpCode) {
      return undefined;
    }

    otpSubmitRef.current = otpCode;
    void handleFinalizeLogin();
    return undefined;
  }, [otp, otpCode, step]);

  async function handleSendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMobileTouched(true);
    if (!mobileIsValid) {
      setError('شماره موبایل باید ۱۱ رقم باشد.');
      return;
    }

    setError('');
    setResult('');
    setSendingCode(true);
    setOtpDevHint('');

    try {
      const { expiresInSeconds, devHint } = await requestAuthOtp(mobile.trim());
      setStep('otp');
      setOtp(['', '', '', '', '', '']);
      otpSubmitRef.current = '';
      setResendTimer(expiresInSeconds);
      setOtpDevHint(devHint ?? '');
      window.setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'ارسال کد ناموفق بود.');
    } finally {
      setSendingCode(false);
    }
  }

  async function handleResendCode() {
    if (!mobileIsValid || resendTimer > 0 || sendingCode) {
      return;
    }

    setError('');
    setSendingCode(true);

    try {
      const { expiresInSeconds, devHint } = await requestAuthOtp(mobile.trim());
      setResendTimer(expiresInSeconds);
      setOtpDevHint(devHint ?? '');
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'ارسال مجدد ناموفق بود.');
    } finally {
      setSendingCode(false);
    }
  }

  async function handleFinalizeLogin() {
    if (loading || verifyInFlight.current) {
      return;
    }

    verifyInFlight.current = true;
    setLoading(true);
    setError('');

    try {
      const payload = await verifyAuthOtp(mobile.trim(), otpCode);
      login(
        personaProfile(persona, payload.user.mobile, {
          accessToken: payload.token,
          refreshToken: payload.refreshToken,
        }),
      );
      setResult('ورود با موفقیت انجام شد.');
      void router.push(returnTo);
    } catch (reason: unknown) {
      otpSubmitRef.current = '';
      setError(reason instanceof Error ? reason.message : 'ورود ناموفق بود.');
    } finally {
      setLoading(false);
      verifyInFlight.current = false;
    }
  }

  function handleOtpChange(index: number, value: string) {
    const next = value.replace(/\D/g, '').slice(-1);
    setOtp((current) => {
      const clone = [...current];
      clone[index] = next;
      return clone;
    });

    if (next && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpPaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) {
      return;
    }

    event.preventDefault();
    const filled = pasted.split('');
    const nextOtp = Array.from({ length: 6 }, (_, index) => filled[index] ?? '');
    setOtp(nextOtp);
    const focusIndex = Math.min(pasted.length, 5);
    otpRefs.current[focusIndex]?.focus();
  }

  return (
    <main className="amline-auth-page">
      <section className="amline-auth-shell">
        <aside className="amline-auth-story">
          <span className="amline-auth-story__eyebrow">ورود امن به هاب عملیات املاین</span>
          <h1>ورود نقش‌محور برای کاربر، مشاور و ادمین</h1>
          <p>
            املاین برای سه تجربه‌ی واقعی طراحی شده است: استفاده‌ی روزمره‌ی کاربر، عملیات فروش و پیگیری برای مشاور، و کنترل
            کیفیت و عملیات برای ادمین. با یک ورود امن، هر نقش به مسیر کاری مناسب خودش هدایت می‌شود.
          </p>
          <div className="amline-auth-story__metrics">
            <article>
              <strong>+27,000</strong>
              <span>کاربر فعال</span>
            </article>
            <article>
              <strong>+120,000</strong>
              <span>قرارداد ثبت‌شده</span>
            </article>
            <article>
              <strong>24/7</strong>
              <span>پشتیبانی حقوقی</span>
            </article>
          </div>
          <div className="amline-auth-story__benefits">
            <span><Icon name="check" className="amline-icon amline-icon--xs" /> مسیر اختصاصی برای هر نقش</span>
            <span><Icon name="check" className="amline-icon amline-icon--xs" /> رهگیری قرارداد و عملیات در یک هاب</span>
            <span><Icon name="check" className="amline-icon amline-icon--xs" /> ورود امن با OTP و نشست پایدار</span>
          </div>
        </aside>

        <section className="amline-auth-card" aria-label="فرم ورود">
          <header className="amline-auth-card__header">
            <span className="amline-auth-card__badge">ورود امن</span>
            <h2>ورود به حساب املاین</h2>
            <p>نوع حساب را انتخاب کنید و با شماره موبایل خود وارد شوید.</p>
          </header>

          {step === 'mobile' ? (
            <form className="amline-form-stack" onSubmit={handleSendCode}>
              <div className="amline-persona-switch" role="radiogroup" aria-label="نوع حساب">
                {personas.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`amline-persona-switch__item${persona === item.value ? ' is-active' : ''}`}
                    onClick={() => setPersona(item.value)}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.description}</span>
                  </button>
                ))}
              </div>

              <label className="amline-field">
                <span>شماره موبایل</span>
                <input
                  className="amline-input"
                  value={mobile}
                  onBlur={() => setMobileTouched(true)}
                  onChange={(event) => setMobile(event.target.value)}
                  placeholder="09121234567"
                  inputMode="numeric"
                  dir="ltr"
                />
              </label>

              {mobileTouched && !mobileIsValid ? (
                <p className="amline-form-feedback amline-form-feedback--error">شماره موبایل باید ۱۱ رقم باشد.</p>
              ) : (
                <p className="amline-form-feedback">
                  پس از تایید کد، به مسیر مخصوص <strong>{personas.find((item) => item.value === persona)?.label}</strong> هدایت
                  می‌شوید.
                </p>
              )}

              <button type="submit" className="amline-button amline-button--primary" disabled={!mobileIsValid || sendingCode}>
                {sendingCode ? 'در حال ارسال...' : 'ارسال کد تایید'}
              </button>
            </form>
          ) : (
            <div className="amline-form-stack">
              <div className="amline-auth-otp">
                <div className="amline-auth-otp__header">
                  <strong>کد تایید ۶ رقمی</strong>
                  <button
                    type="button"
                    className="amline-button amline-button--ghost"
                    onClick={() => {
                      setStep('mobile');
                      otpSubmitRef.current = '';
                    }}
                  >
                    ویرایش شماره
                  </button>
                </div>

                {otpDevHint ? (
                  <p className="amline-form-feedback" dir="ltr">
                    {otpDevHint}
                  </p>
                ) : null}

                <div className="amline-auth-otp__inputs" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={`otp-${index}`}
                      ref={(element) => {
                        otpRefs.current[index] = element;
                      }}
                      value={digit}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      inputMode="numeric"
                      maxLength={1}
                      aria-label={`رقم ${index + 1} کد تایید`}
                    />
                  ))}
                </div>

                <div className="amline-auth-otp__actions">
                  <button
                    type="button"
                    className="amline-button amline-button--primary"
                    onClick={() => void handleFinalizeLogin()}
                    disabled={loading || otpCode.length !== 6 || otp.some((digit) => digit === '')}
                  >
                    {loading ? 'در حال تایید...' : 'تایید و ورود'}
                  </button>
                  <button
                    type="button"
                    className="amline-button amline-button--ghost"
                    onClick={() => void handleResendCode()}
                    disabled={resendTimer > 0 || sendingCode}
                  >
                    {resendTimer > 0 ? `ارسال مجدد تا ${resendTimer} ثانیه` : 'ارسال مجدد کد'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="amline-auth-trust">
            <span><Icon name="check" className="amline-icon amline-icon--xs" /> ورود امن و رمزنگاری‌شده</span>
            <span><Icon name="check" className="amline-icon amline-icon--xs" /> نشست پایدار برای ادامه‌ی عملیات</span>
            <span><Icon name="check" className="amline-icon amline-icon--xs" /> هدایت خودکار به پنل مناسب نقش</span>
          </div>

          <p className="amline-form-feedback">اگر حسابی نداشته باشید، پس از تایید شماره ساخته می‌شود.</p>
          {result ? <p className="amline-form-feedback amline-form-feedback--success">{result}</p> : null}
          {error ? <p className="amline-form-feedback amline-form-feedback--error">{error}</p> : null}
        </section>
      </section>
    </main>
  );
}
