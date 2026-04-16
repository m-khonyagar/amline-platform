import type { ReactNode } from 'react';
import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';
import { termsDocument } from '../../content/legal/terms';

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
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

  const lines = markdown.split('\n');
  const nodes: ReactNode[] = [];
  let listItems: string[] = [];
  let bulletItems: string[] = [];

  function flushOrderedList() {
    if (listItems.length === 0) {
      return;
    }
    nodes.push(
      <ol key={`ol-${nodes.length}`} className="amline-legal-list">
        {listItems.map((item, index) => (
          <li key={`${item.slice(0, 20)}-${index}`}>{renderInline(item)}</li>
        ))}
      </ol>,
    );
    listItems = [];
  }

  function flushBulletList() {
    if (bulletItems.length === 0) {
      return;
    }
    nodes.push(
      <ul key={`ul-${nodes.length}`} className="amline-legal-list">
        {bulletItems.map((item, index) => (
          <li key={`${item.slice(0, 20)}-${index}`}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    bulletItems = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushOrderedList();
      flushBulletList();
      continue;
    }

    if (line.startsWith('#### ')) {
      flushOrderedList();
      flushBulletList();
      nodes.push(<h4 key={`h4-${nodes.length}`} className="amline-legal-rich__subheading">{line.slice(5)}</h4>);
      continue;
    }

    if (line.startsWith('### ')) {
      flushOrderedList();
      flushBulletList();
      nodes.push(<h3 key={`h3-${nodes.length}`} className="amline-legal-rich__heading">{line.slice(4)}</h3>);
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      flushBulletList();
      listItems.push(line.replace(/^\d+\.\s/, ''));
      continue;
    }

    if (line.startsWith('- ')) {
      flushOrderedList();
      bulletItems.push(line.slice(2));
      continue;
    }

    flushOrderedList();
    flushBulletList();
    nodes.push(
      <p key={`p-${nodes.length}`} className="amline-legal-rich__paragraph">
        {renderInline(line)}
      </p>,
    );
  }

  flushOrderedList();
  flushBulletList();
  return <div className="amline-legal-rich">{nodes}</div>;
}

export default function TermsPage() {
  const sections = [...termsDocument.sections].sort((a, b) => a.order - b.order);

  return (
    <PageShell
      title={termsDocument.document.title}
      subtitle="متن کامل قوانین و مقررات، شرایط استفاده، الزامات قراردادی و آیین‌نامه داوری املاین."
    >
      <SectionCard title="راهنمای سند" actions={<a href={termsDocument.document.source_url}>منبع مرجع</a>}>
        <ul className="amline-legal-list">
          {sections.map((section) => (
            <li key={section.id}>{section.title}</li>
          ))}
        </ul>
      </SectionCard>

      {sections.map((section) => (
        <div key={section.id}>
          <div className="amline-section-gap" />
          <SectionCard title={section.title}>
            {renderMarkdown(section.content_markdown)}
            {section.subsections?.map((subsection) => (
              <div key={subsection.id} className="amline-legal-rich__subsection">
                <h3 className="amline-legal-rich__section-title">{subsection.title}</h3>
                {renderMarkdown(subsection.content_markdown)}
              </div>
            ))}
          </SectionCard>
        </div>
      ))}
    </PageShell>
  );
}
