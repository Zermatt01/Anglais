import { useId, type ReactNode } from 'react';

interface PageProps {
  readonly title: ReactNode;
  readonly subtitle?: ReactNode;
  readonly children: ReactNode;
}

/** A screen: its title (the only h1) on the notebook margin, then its sections. */
export function Page({ title, subtitle, children }: PageProps) {
  return (
    <div className="page">
      <header className="page-header">
        <h1>{title}</h1>
        {subtitle === undefined ? null : <p className="page-header__subtitle">{subtitle}</p>}
      </header>
      {children}
    </div>
  );
}

interface SheetProps {
  readonly title: ReactNode;
  readonly children: ReactNode;
}

/** A section of a page, on raised paper, with an h2 title. */
export function Sheet({ title, children }: SheetProps) {
  const titleId = useId();
  return (
    <section className="sheet" aria-labelledby={titleId}>
      <h2 id={titleId} className="sheet__title">
        {title}
      </h2>
      {children}
    </section>
  );
}
