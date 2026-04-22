import type { ReactNode } from 'react';
import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';
import { termsDocument, type TermsSection } from '../../content/legal/terms';

const MOJIBAKE_PATTERN = /[ØÙÃÂÐÑ]/;
const PERSIAN_PATTERN = /[\u0600-\u06FF]/;

function decodePossiblyBrokenText(value: string): string {
  if (!value || !MOJIBAKE_PATTERN.test(value)) {
    return value;
  }

  try {
    const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0) & 0xff);
    const decoded = new TextDecoder('utf-8').decode(bytes);

    if (decoded && PERSIAN_PATTERN.test(decoded)) {
      return decoded;
    }
  } catch {
    return value;
  }

  return value;
}

function normalizeSection(section: TermsSection): TermsSection {
  return {
    ...section,
    title: decodePossiblyBrokenText(section.title),
    content_markdown: section.content_markdown ? decodePossiblyBrokenText(section.content_markdown) : undefined,
    subsections: section.subsections?.map(normalizeSection),
  };
}

function renderInline(text: string) {
  const normalized = decodePossiblyBrokenText(text);
  const parts = normalized.split(/(\*\*.*?\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

function renderMarkdown(markdown?: string): ReactNode {
  if (!markdown) {
    return null;
  }

  const normalized = decodePossiblyBrokenText(markdown);
  const lines = normalized.split('\n');
  const nodes: ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let orderedBuffer: string[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (!paragraphBuffer.length) {
      return;
    }

    nodes.push(
      <p key={`paragraph-${nodes.length}`} className="amline-legal-rich__paragraph">
        {renderInline(paragraphBuffer.join(' '))}
      </p>,
    );
    paragraphBuffer = [];
  };

  const flushBullets = () => {
    if (!bulletBuffer.length) {
      return;
    }

    nodes.push(
      <ul key={`bullet-${nodes.length}`} className="amline-legal-list">
        {bulletBuffer.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    bulletBuffer = [];
  };

  const flushOrdered = () => {
    if (!orderedBuffer.length) {
      return;
    }

    nodes.push(
      <ol key={`ordered-${nodes.length}`} className="amline-legal-list">
        {orderedBuffer.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInline(item)}</li>
        ))}
      </ol>,
    );
    orderedBuffer = [];
  };

  const flushAll = () => {
    flushParagraph();
    flushBullets();
    flushOrdered();
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushAll();
      return;
    }

    if (line.startsWith('#### ')) {
      flushAll();
      nodes.push(
        <h4 key={`h4-${nodes.length}`} className="amline-legal-rich__subheading">
          {renderInline(line.slice(5))}
        </h4>,
      );
      return;
    }

    if (line.startsWith('### ')) {
      flushAll();
      nodes.push(
        <h3 key={`h3-${nodes.length}`} className="amline-legal-rich__heading">
          {renderInline(line.slice(4))}
        </h3>,
      );
      return;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      flushBullets();
      orderedBuffer.push(line.replace(/^\d+\.\s+/, ''));
      return;
    }

    if (line.startsWith('- ')) {
      flushParagraph();
      flushOrdered();
      bulletBuffer.push(line.slice(2));
      return;
    }

    paragraphBuffer.push(line);
  });

  flushAll();

  return <div className="amline-legal-rich">{nodes}</div>;
}

function TermsAccordionSection({
  section,
  defaultOpen = false,
  nested = false,
}: {
  section: TermsSection;
  defaultOpen?: boolean;
  nested?: boolean;
}) {
  return (
    <details
      className={`amline-legal-accordion__item${nested ? ' amline-legal-accordion__item--nested' : ''}`}
      open={defaultOpen}
    >
      <summary className="amline-legal-accordion__summary">
        <span className="amline-legal-accordion__icon" aria-hidden />
        <span className="amline-legal-accordion__title">{section.title}</span>
      </summary>

      <div className="amline-legal-accordion__panel">
        {section.content_markdown ? renderMarkdown(section.content_markdown) : null}

        {section.subsections?.length ? (
          <div className="amline-legal-accordion__nested">
            {section.subsections
              .slice()
              .sort((left, right) => left.order - right.order)
              .map((subsection, index) => (
                <TermsAccordionSection
                  key={subsection.id}
                  section={subsection}
                  nested
                  defaultOpen={defaultOpen && index === 0}
                />
              ))}
          </div>
        ) : null}
      </div>
    </details>
  );
}

export default function TermsOfServicePage() {
  const normalizedDocument = {
    document: {
      title: decodePossiblyBrokenText(termsDocument.document.title),
      source_url: termsDocument.document.source_url,
    },
    sections: termsDocument.sections.map(normalizeSection).sort((left, right) => left.order - right.order),
  };

  return (
    <PageShell
      title={normalizedDocument.document.title}
      subtitle="قوانین و مقررات املاین را به‌صورت دسته‌بندی‌شده و دراپ‌داون مرور کنید تا هر بند را سریع‌تر پیدا کنید."
    >
      <SectionCard
        title="قوانین و مقررات"
        actions={
          <a
            href={normalizedDocument.document.source_url}
            target="_blank"
            rel="noreferrer"
            className="amline-link amline-legal-accordion__source"
          >
            منبع مرجع
          </a>
        }
      >
        <div className="amline-legal-accordion">
          <div className="amline-legal-accordion__intro">
            <p className="amline-legal-accordion__eyebrow">مرور سریع سند</p>
            <p className="amline-legal-accordion__description">
              هر بخش را باز کنید تا متن کامل همان ماده و زیربندهای مرتبط نمایش داده شود.
            </p>
          </div>

          <div className="amline-legal-accordion__stack">
            {normalizedDocument.sections.map((section, index) => (
              <TermsAccordionSection key={section.id} section={section} defaultOpen={index === 0} />
            ))}
          </div>
        </div>
      </SectionCard>
    </PageShell>
  );
}
