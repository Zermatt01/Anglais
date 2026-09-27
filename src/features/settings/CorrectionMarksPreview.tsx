/**
 * Preview of the correction marks (UI-02), on examples of docs/PEDAGOGY.md.
 * Each mark is also named in words: colour is never the only information.
 */
const EXAMPLES = [
  {
    label: 'Faute légère',
    mark: 'minor',
    before: 'I will ',
    marked: 'recieve',
    after: ' it tomorrow.',
  },
  { label: 'Faute moyenne', mark: 'medium', before: 'She ', marked: 'work', after: ' in a bank.' },
  { label: 'Faute importante', mark: 'major', before: '', marked: 'I have 25 years', after: '.' },
  {
    label: 'Correct mais peu naturel',
    mark: 'unnatural',
    before: '',
    marked: 'According to me',
    after: ', rates will fall.',
  },
] as const;

export function CorrectionMarksPreview() {
  return (
    <div className="field">
      <p className="field__label">Aperçu des corrections</p>
      <ul className="plain-list">
        {EXAMPLES.map((example) => (
          <li key={example.mark} className="plain-list__item">
            <span className="plain-list__text">
              <span className="muted">{example.label}</span>
              <span lang="en">
                {example.before}
                <span className={`mark mark--${example.mark}`}>{example.marked}</span>
                {example.after}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
