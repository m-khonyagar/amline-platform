import Link from 'next/link';
import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';

const legalDocs = [
  {
    title: 'قوانین و مقررات املاین',
    description: 'متن کامل شرایط استفاده، مقررات عمومی و اختصاصی، حقوق مالکیت فکری، حریم خصوصی و آیین‌نامه داوری.',
    href: '/legal/terms-of-service',
  },
  {
    title: 'حریم خصوصی',
    description: 'نحوه جمع‌آوری، پردازش، نگه‌داری و حفاظت از اطلاعات کاربران در وب‌اپ و اپلیکیشن.',
    href: '/legal/privacy-policy',
  },
  {
    title: 'حقوق مصرف‌کننده',
    description: 'تعهدات خدمت‌رسانی، شفافیت فرایندها و حقوق کاربر در تعامل با خدمات املاین.',
    href: '/legal/consumer-rights',
  },
  {
    title: 'فرآیند قانونی شکایات',
    description: 'روند ثبت شکایت، جمع‌آوری مستندات، بررسی حقوقی و مسیر رسمی پیگیری پرونده.',
    href: '/legal/complaints',
  },
];

const contractGuides = [
  'الزامات ثبت اطلاعات صحیح موجر، مستاجر و ملک',
  'چارچوب انعقاد قرارداد آنلاین و سند الکترونیکی',
  'الزامات پرداخت رهن، اجاره و کمیسیون از بستر رسمی املاین',
  'مبنای داوری، ابلاغ و پیگیری اختلافات قراردادی',
];

export default function LegalIndexPage() {
  return (
    <PageShell title="مرکز اسناد قانونی" subtitle="دسترسی سریع به قوانین و مقررات، حریم خصوصی، اسناد حقوقی و مسیرهای رسمی پیگیری در املاین.">
      <SectionCard title="اسناد اصلی">
        <div className="amline-legal-hub">
          {legalDocs.map((doc) => (
            <Link key={doc.href} href={doc.href} className="amline-legal-hub__item">
              <strong>{doc.title}</strong>
              <p>{doc.description}</p>
            </Link>
          ))}
        </div>
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="راهنمای سریع قرارداد و انطباق">
        <ul className="amline-legal-list">
          {contractGuides.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </SectionCard>
    </PageShell>
  );
}
