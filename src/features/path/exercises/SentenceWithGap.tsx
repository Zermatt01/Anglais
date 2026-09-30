/** An English sentence whose gap (`___`) is shown as a line, and read as "blanc". */
export function SentenceWithGap({ sentence }: { readonly sentence: string }) {
  const [before = '', ...rest] = sentence.split(/_{3,}/);
  const after = rest.join(' ');
  return (
    <p className="exercise__sentence" lang="en">
      {before}
      <span className="gap" aria-hidden="true">
        ________
      </span>
      <span className="visually-hidden" lang="fr">
        (blanc)
      </span>
      {after}
    </p>
  );
}
