export function Footer() {
  return (
    <footer className="amline-footer">
      <div className="amline-footer__inner">
        <div className="amline-footer__brand">
          <strong>املاین</strong>
          <p className="amline-footer__meta">
            پلتفرم قرارداد دیجیتال ملک برای آژانس‌ها، مشاوران و کاربران نهایی با تمرکز بر انطباق حقوقی، رهگیری رسمی و تجربه
            مالی امن.
          </p>
          <div className="amline-footer__badges">
            <span>نماد اعتماد</span>
            <span>مجوز اتحادیه</span>
            <span>امضای دیجیتال</span>
          </div>
        </div>

        <div className="amline-footer__columns">
          <div>
            <h4>محصول</h4>
            <a href="/">خانه</a>
            <a href="/contracts/new">شروع قرارداد</a>
            <a href="/account/profile">حساب کاربری</a>
            <a href="/support">پشتیبانی</a>
          </div>
          <div>
            <h4>حقوقی</h4>
            <a href="/legal">مرکز حقوقی</a>
            <a href="/legal/terms-of-service">شرایط استفاده</a>
            <a href="/legal/privacy-policy">حریم خصوصی</a>
            <a href="/legal/complaints">رسیدگی به شکایات</a>
          </div>
          <div>
            <h4>ارتباط و دانلود</h4>
            <a href="tel:02532048000">025-32048000</a>
            <a href="mailto:support@amline.ir">support@amline.ir</a>
            <a href="#">دانلود از بازار</a>
            <a href="#">دانلود از مایکت</a>
          </div>
        </div>

        <div className="amline-footer__meta amline-footer__meta--bottom">
          <span>قم، پردیسان، اندیشه ۳، پلاک ۱۵</span>
          <span>Instagram / LinkedIn / Telegram</span>
        </div>
      </div>
    </footer>
  );
}
