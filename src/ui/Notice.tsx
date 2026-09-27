import type { ReactNode } from 'react';

interface NoticeProps {
  readonly tone?: 'info' | 'success' | 'error';
  readonly title?: string;
  readonly children?: ReactNode;
}

/**
 * Message block. Errors are announced immediately (role "alert"), other
 * notices politely (role "status"). Errors say what to do next (UI-03).
 */
export function Notice({ tone = 'info', title, children }: NoticeProps) {
  return (
    <div className={`notice notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {title === undefined ? null : <p className="notice__title">{title}</p>}
      {children}
    </div>
  );
}
