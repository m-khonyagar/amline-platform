import { useRouter } from 'next/router';
import { AppShellLayout } from '../../components/Common/AppShellLayout';
import { Badge } from '../../components/UI/Badge';
import { EmptyState } from '../../components/UI/EmptyState';
import { FeedbackBlock } from '../../components/UI/FeedbackBlock';
import { SectionCard } from '../../components/UI/SectionCard';
import { TrustPanel } from '../../components/UI/TrustPanel';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useAuth } from '../../hooks/useAuth';
import { getContractStatusMeta } from '../../lib/status';
import { fetchContractDetail } from '../../services/api';

export default function ContractDetailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const contractId = typeof router.query.id === 'string' ? router.query.id : '';
  const detailQuery = useAsyncData(
    () => fetchContractDetail(contractId, { client: 'people', actorId: user?.id ?? 'acct_1', teamId: 'team_north' }),
    [contractId, user?.id],
  );
  const detail = detailQuery.data ?? null;
  const contract = detail?.contract ?? null;
  const statusMeta = contract ? getContractStatusMeta(contract.status) : null;

  return (
    <AppShellLayout
      title={`قرارداد ${contract?.id ?? contractId ?? '---'}`}
      subtitle="نمای اختصاصی کاربر نهایی از وضعیت قرارداد، سطح دسترسی، اقدام بعدی و مسیر پشتیبانی."
      activeNavHref="/contracts"
      trustItems={['کد رهگیری رسمی', 'پشتیبانی حقوقی', 'نمایش شفاف وضعیت', 'حفظ محرمانگی مدارک']}
    >
      {detailQuery.error ? <FeedbackBlock tone="error">دریافت جزئیات قرارداد با خطا مواجه شد.</FeedbackBlock> : null}

      {!contract && !detailQuery.loading ? (
        <EmptyState
          title="قرارداد پیدا نشد"
          description="ممکن است این قرارداد در دسترس این کاربر نباشد یا شناسه آن تغییر کرده باشد."
          actions={
            <button type="button" className="amline-button amline-button--primary" onClick={() => router.push('/contracts')}>
              بازگشت به فهرست قراردادها
            </button>
          }
        />
      ) : null}

      {contract && detail ? (
        <>
          <SectionCard
            title="خلاصه قرارداد"
            actions={statusMeta ? <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge> : undefined}
          >
            <div className="amline-metric-strip">
              <div>
                <strong>ملک</strong>
                <span>{contract.propertyLabel ?? contract.title}</span>
              </div>
              <div>
                <strong>طرف مقابل</strong>
                <span>{contract.counterpartLabel ?? 'ثبت نشده'}</span>
              </div>
              <div>
                <strong>تاریخ</strong>
                <span>{contract.date}</span>
              </div>
              <div>
                <strong>نمای فعلی</strong>
                <span>{detail.viewKind === 'people_view' ? 'کاربر نهایی' : detail.viewKind}</span>
              </div>
            </div>
          </SectionCard>

          <div className="amline-section-gap" />

          <SectionCard title="دلیل نمایش این قرارداد">
            <p>{detail.visibilityReason}</p>
            <p className="amline-muted-copy">{contract.peopleNextStep ?? contract.message}</p>
          </SectionCard>

          <div className="amline-section-gap" />

          <SectionCard title="پیشرفت پرونده">
            <div className="amline-funnel-grid">
              {detail.timeline.map((item, index) => (
                <article
                  key={`${item.label}-${index}`}
                  className={`amline-funnel-step amline-funnel-step--${
                    item.status === 'done' ? 'success' : item.status === 'current' ? 'info' : 'muted'
                  }`}
                >
                  <span className="amline-funnel-step__index">{index + 1}</span>
                  <strong>{item.label}</strong>
                  <small>{item.status === 'done' ? 'تکمیل شده' : item.status === 'current' ? 'مرحله فعلی' : 'در انتظار'}</small>
                </article>
              ))}
            </div>
          </SectionCard>

          <div className="amline-section-gap" />

          <SectionCard title="اقدامات در دسترس">
            <div className="amline-panel-actions amline-panel-actions--balanced">
              {detail.actions.includes('track') ? (
                <button type="button" className="amline-panel-action amline-panel-action--primary">
                  <strong>پیگیری وضعیت</strong>
                  <span>آخرین وضعیت قرارداد و گام بعدی را از همین صفحه دنبال کنید.</span>
                </button>
              ) : null}
              {detail.actions.includes('chat_support') ? (
                <button
                  type="button"
                  className="amline-panel-action amline-panel-action--secondary"
                  onClick={() => router.push('/chat/support')}
                >
                  <strong>گفتگو با پشتیبانی</strong>
                  <span>اگر در مدارک یا روند امضا ابهام دارید با تیم پشتیبانی گفتگو کنید.</span>
                </button>
              ) : null}
              {detail.actions.includes('submit_complaint') ? (
                <button
                  type="button"
                  className="amline-panel-action amline-panel-action--secondary"
                  onClick={() => router.push('/support/complaints')}
                >
                  <strong>ثبت درخواست یا شکایت</strong>
                  <span>برای ثبت مورد رسمی و دریافت کد رهگیری از این مسیر استفاده کنید.</span>
                </button>
              ) : null}
            </div>
          </SectionCard>

          <div className="amline-section-gap" />

          <SectionCard title="اعتماد و رهگیری">
            <TrustPanel items={['نسخه رسمی قرارداد', 'سوابق ثبت وضعیت', 'پشتیبانی حقوقی پاسخگو', 'مسیر مشخص برای پیگیری']} />
          </SectionCard>
        </>
      ) : null}
    </AppShellLayout>
  );
}
