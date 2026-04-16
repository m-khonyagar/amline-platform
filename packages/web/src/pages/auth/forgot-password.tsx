import { useRouter } from 'next/router';
import { Icon } from '../../components/UI/Icon';

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <main className="amline-auth-page">
      <section className="amline-auth-shell">
        <aside className="amline-auth-story">
          <span className="amline-auth-story__eyebrow">احراز هویت OTP-first</span>
          <h1>بازیابی جداگانه رمز عبور در این نسخه فعال نیست</h1>
          <p>ورود املاین بر پایه تایید شماره موبایل است و نیاز به رمز عبور مستقل ندارد. برای ورود یا بازیابی دسترسی، همان مسیر تایید شماره را ادامه دهید.</p>
        </aside>
        <section className="amline-auth-card">
          <header className="amline-auth-card__header">
            <span className="amline-auth-card__badge">بازیابی از مسیر ورود</span>
            <h2>بازگشت به ورود امن</h2>
            <p>کد تایید فقط به شماره شما ارسال می‌شود و پس از تایید، دسترسی حساب بازیابی خواهد شد.</p>
          </header>
          <div className="amline-auth-trust">
            <span><Icon name="check" className="amline-icon amline-icon--xs" /> بدون نیاز به رمز عبور ایستا</span>
            <span><Icon name="check" className="amline-icon amline-icon--xs" /> ورود و بازیابی در یک جریان یکپارچه</span>
          </div>
          <button type="button" className="amline-button amline-button--primary" onClick={() => router.push('/auth/login')}>
            بازگشت به ورود موبایلی
          </button>
        </section>
      </section>
    </main>
  );
}
