import { useRouter } from 'next/router';
import { Icon } from '../../components/UI/Icon';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <main className="amline-auth-page">
      <section className="amline-auth-shell">
        <aside className="amline-auth-story">
          <span className="amline-auth-story__eyebrow">ثبت نام یکپارچه شده است</span>
          <h1>در املاین، ورود و ساخت حساب یک مسیر واحد دارد</h1>
          <p>برای سادگی و امنیت بیشتر، ساخت حساب جدید با تایید شماره موبایل انجام می‌شود و فرم جداگانه ثبت نام حذف شده است.</p>
        </aside>
        <section className="amline-auth-card">
          <header className="amline-auth-card__header">
            <span className="amline-auth-card__badge">ساخت حساب خودکار</span>
            <h2>ثبت نام از مسیر ورود</h2>
            <p>اگر حساب نداشته باشید، پس از تایید شماره موبایل به صورت خودکار حساب شما ایجاد می‌شود.</p>
          </header>
          <div className="amline-auth-trust">
            <span><Icon name="check" className="amline-icon amline-icon--xs" /> بدون فرم اضافه و ورود کم‌اصطکاک</span>
            <span><Icon name="check" className="amline-icon amline-icon--xs" /> تایید شماره به‌عنوان نقطه ورود و ثبت حساب</span>
          </div>
          <button type="button" className="amline-button amline-button--primary" onClick={() => router.push('/auth/login')}>
            ادامه با ورود موبایلی
          </button>
        </section>
      </section>
    </main>
  );
}
