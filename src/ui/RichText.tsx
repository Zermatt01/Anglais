import { Fragment } from 'react';

/**
 * French text in which English words are marked with underscores
 * ("le mot _yet_"): they are shown in the English font, with `lang="en"`, so
 * that screen readers pronounce them in English (UI-02, UI-04).
 */
export function RichText({ text }: { readonly text: string }) {
  const parts = text.split('_');
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <i key={index} lang="en">
            {part}
          </i>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}
