/**
 * Reprises (MOD-03, CARD-05), Mon lexique (MOD-09) and the rule book
 * (MOD-10), on a real in-memory database and a fake server.
 */
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CardContent } from '../../domain/cards/content.ts';
import { wordDraftKey } from '../../domain/lexicon.ts';
import { DRAFT_SAVE_DELAY_MS } from '../drafts/use-draft.ts';
import { createTestServices, renderApp } from '../../test/render.tsx';
import { createFakeServer, TEST_ACCOUNT, type FakeServerOptions } from '../../test/server.ts';
import { answered, correctionOf } from '../../test/corrections.ts';

const NOTION_CARD: CardContent = {
  type: 'notion',
  notionId: 'tense-past-simple',
  meaningFr: 'J’ai envoyé le contrat hier.',
  hint: 'Un moment passé précis.',
  answers: { canonical: 'I sent the contract yesterday.', variants: [] },
};

async function answerWith(text: string) {
  const field = await screen.findByRole('textbox', { name: 'Ta réponse, en anglais' });
  await waitFor(() => {
    expect(field).toBeEnabled();
  });
  fireEvent.change(field, { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }));
}

describe('Reprises (MOD-03)', () => {
  it('reviews a due card in production, and stores the grade the learner confirms', async () => {
    const services = await createTestServices();
    await services.cards.create({ content: NOTION_CARD, origin: 'notion' });
    await renderApp('/reprises', services);
    expect(await screen.findByText('J’ai envoyé le contrat hier.')).toBeInTheDocument();
    await answerWith('Yesterday I sent the contract.');
    // Not among the expected answers: never called wrong (NO-05).
    expect(await screen.findByText('Réponse non prévue')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Oui, juste' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Bien (proposé)' }));
    expect(await screen.findByText('Rien à revoir pour l’instant')).toBeInTheDocument();
    expect(await services.db.table('reviewLogs').count()).toBe(1);
    const [card] = await services.cards.all();
    expect(card?.srs.reps).toBe(1);
  });

  it('grades an expected answer locally, the hint making it "difficile"', async () => {
    const services = await createTestServices();
    await services.cards.create({ content: NOTION_CARD, origin: 'notion' });
    await renderApp('/reprises', services);
    fireEvent.click(await screen.findByRole('button', { name: 'Voir l’indice' }));
    await answerWith('I sent the contract yesterday');
    expect(await screen.findByText('Juste !')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Facile' }));
    await screen.findByText('Rien à revoir pour l’instant');
    const [log] = (await services.db.table('reviewLogs').toArray()) as {
      grade: string;
      adjustedGrade: string | null;
      hintUsed: boolean;
    }[];
    expect(log).toMatchObject({ grade: 'hard', adjustedGrade: 'easy', hintUsed: true });
  });

  it('asks the fast model to check an unexpected answer, on request only (CARD-05)', async () => {
    const fake = createFakeServer({
      account: TEST_ACCOUNT,
      run: () =>
        Promise.resolve({
          ok: true,
          output: {
            verdict: 'acceptable',
            reasonFr: 'Juste, mais _completed_ est moins naturel ici.',
          },
          costUsd: 0.0004,
          model: 'claude-haiku-4-5-20251001',
          promptVersion: 'check-card-answer@1',
        }),
    });
    const services = await createTestServices({ server: fake.server });
    await services.cards.create({ content: NOTION_CARD, origin: 'notion' });
    await renderApp('/reprises', services);
    await answerWith('I completed the contract yesterday.');
    expect(fake.calls.run).toEqual([]);
    fireEvent.click(await screen.findByRole('button', { name: 'Faire vérifier par l’IA' }));
    expect(await screen.findByText('Presque')).toBeInTheDocument();
    expect(fake.calls.run).toEqual(['check-card-answer']);
    expect(screen.getByRole('button', { name: 'Difficile (proposé)' })).toBeInTheDocument();
  });

  it('never shows a card suspended until its notion is studied (D-025)', async () => {
    const services = await createTestServices();
    await services.cards.create({
      content: NOTION_CARD,
      origin: 'error',
      suspensionReason: 'unstudied-notion',
    });
    await renderApp('/reprises', services);
    expect(await screen.findByText('Rien à revoir pour l’instant')).toBeInTheDocument();
  });
});

describe('Mes cartes (D-092)', () => {
  it('shows every card, grouped by where it stands, with the reason', async () => {
    const services = await createTestServices();
    await services.cards.create({ content: NOTION_CARD, origin: 'notion' });
    await services.cards.create({
      content: { ...NOTION_CARD, notionId: 'tense-future', meaningFr: 'Je t’appellerai demain.' },
      origin: 'error',
      suspensionReason: 'unstudied-notion',
    });
    await services.cards.create({
      content: { ...NOTION_CARD, meaningFr: 'J’ai payé la facture hier.' },
      origin: 'error',
      suspensionReason: 'reported',
    });
    await renderApp('/reprises', services);
    fireEvent.click(await screen.findByRole('link', { name: /Mes cartes/ }));

    expect(await screen.findByRole('heading', { name: 'À revoir maintenant (1)' })).toBeVisible();
    expect(screen.getByText('J’ai envoyé le contrat hier.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'En attente d’une notion (1)' })).toBeVisible();
    expect(
      screen.getByText('Elle s’activera quand la notion atteindra l’étape « Traduire ».'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voir la notion/ })).toHaveAttribute(
      'href',
      '/parcours/tense-future',
    );
    expect(screen.getByRole('heading', { name: 'Mises de côté (1)' })).toBeVisible();
    expect(screen.getByText('Signalée : elle n’est plus montrée.')).toBeInTheDocument();
  });

  it('says when a due card waits for another day, past the daily cap', async () => {
    const services = await createTestServices();
    await services.settings.update({ newCardsPerDay: 0 });
    await services.cards.create({ content: NOTION_CARD, origin: 'notion' });
    await renderApp('/reprises/cartes', services);
    expect(
      await screen.findByRole('heading', { name: 'Retenues par le plafond du jour (1)' }),
    ).toBeVisible();
    expect(
      screen.getByText(
        'Plafond de 0 nouvelle carte par jour atteint : elle viendra un autre jour.',
      ),
    ).toBeInTheDocument();
  });
});

describe('Mon lexique (MOD-09)', () => {
  it('adds an expression with its card, refuses a duplicate, and removes it', async () => {
    const services = await createTestServices();
    await renderApp('/lexique', services);
    const fill = async (name: string, value: string) => {
      fireEvent.change(await screen.findByRole('textbox', { name }), { target: { value } });
    };
    await fill('Expression', 'meet a deadline');
    await fill('Sens en français', 'respecter une échéance');
    await fill('Exemple, qui contient l’expression', 'We always meet a deadline.');
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(await screen.findByText('Ajoutée, avec sa carte de révision.')).toBeInTheDocument();
    expect(await screen.findByText('Ajoutée par toi · avec carte')).toBeInTheDocument();

    await fill('Expression', 'Meet a deadline');
    await fill('Sens en français', 'tenir un délai');
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(
      await screen.findByText('Cette expression est déjà dans ton lexique.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retirer meet a deadline' }));
    fireEvent.click(screen.getByRole('button', { name: 'Retirer' }));
    expect(await screen.findByText(/Aucune expression pour l’instant/)).toBeInTheDocument();
    expect(await services.cards.all()).toEqual([]);
  });
});

describe('rule book (MOD-10)', () => {
  it('builds a sheet from the learner’s own errors, and keeps a personal note', async () => {
    const text = 'Yesterday I have met the client.';
    const fake = createFakeServer({
      account: TEST_ACCOUNT,
      run: () =>
        Promise.resolve(answered(correctionOf(text, { segment: 'have met', correction: 'met' }))),
    });
    const services = await createTestServices({ server: fake.server });
    const production = await services.productions.submit({
      module: 'journal',
      prompt: { text: 'What did you do yesterday?', language: 'en' },
      context: {
        notionId: null,
        itemId: 'journal/q01',
        tier: null,
        unstudied: false,
        hintUsed: false,
      },
      text,
      durationMs: 60_000,
    });
    await services.productions.applyCorrection(
      production.id,
      {
        output: correctionOf(text, { segment: 'have met', correction: 'met' }),
        model: 'claude-sonnet-5',
        promptVersion: 'correct-production@2',
        costUsd: 0.01,
      },
      { reference: null, fallbackHint: () => 'Vérifie le temps.' },
    );
    await renderApp('/carnet', services);
    expect(await screen.findByRole('region', { name: 'Temps verbal' })).toBeInTheDocument();
    expect(screen.getByText('1 erreur(s) ces 30 derniers jours, 1 en tout.')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Ma note' }), {
      target: { value: 'Moment passé précis : prétérit.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer la note' }));
    expect(await screen.findByText('Note enregistrée.')).toBeInTheDocument();
    expect((await services.ruleNotes.all()).get('temps_verbaux')).toBe(
      'Moment passé précis : prétérit.',
    );
  });
});

describe('unknown words (D-095)', () => {
  it('adds a word touched in a sentence to the lexicon, with its card', async () => {
    const services = await createTestServices();
    await renderApp('/parcours/tense-present-continuous/lecon', services);
    // The third example of the lesson: "Inflation is falling across the euro area."
    const third = (await screen.findAllByRole('button', { name: 'Mot inconnu ?' }))[2];
    if (third === undefined) throw new Error('no word picker');
    fireEvent.click(third);
    fireEvent.click(screen.getByRole('button', { name: 'across' }));
    expect(screen.getByRole('button', { name: 'across' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter « across »' }));
    const meaning = await screen.findByRole('textbox', {
      name: 'Sens en français, dans cette phrase',
    });
    await waitFor(() => {
      expect(meaning).toBeEnabled();
    });
    fireEvent.change(meaning, { target: { value: 'dans tout, à travers' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter à mon lexique' }));
    expect(
      await screen.findByText('Ajouté à ton lexique, avec sa carte de révision.'),
    ).toBeInTheDocument();

    const [entry] = await services.lexicon.list();
    expect(entry).toMatchObject({
      expression: 'across',
      meaningFr: 'dans tout, à travers',
      example: 'Inflation is falling across the euro area.',
      source: 'exercise',
    });
    expect(await services.cards.all()).toMatchObject([
      {
        origin: 'lexicon',
        content: { type: 'collocation', context: 'Inflation is falling ___ the euro area.' },
      },
    ]);
  });

  it('picks an expression of several words, from its first to its last word', async () => {
    const services = await createTestServices();
    await renderApp('/parcours/tense-present-continuous/lecon', services);
    const third = (await screen.findAllByRole('button', { name: 'Mot inconnu ?' }))[2];
    if (third === undefined) throw new Error('no word picker');
    fireEvent.click(third);
    fireEvent.click(screen.getByRole('button', { name: 'euro' }));
    fireEvent.click(screen.getByRole('button', { name: 'area' }));
    expect(screen.getByRole('button', { name: 'Ajouter « euro area »' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(screen.queryByRole('button', { name: 'euro' })).not.toBeInTheDocument();
  });
});

describe('meaning of an unknown word, proposed by the AI (D-095)', () => {
  const pick = async () => {
    const third = (await screen.findAllByRole('button', { name: 'Mot inconnu ?' }))[2];
    if (third === undefined) throw new Error('no word picker');
    fireEvent.click(third);
    fireEvent.click(screen.getByRole('button', { name: 'across' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter « across »' }));
    const meaning = await screen.findByRole('textbox', {
      name: 'Sens en français, dans cette phrase',
    });
    await waitFor(() => {
      expect(meaning).toBeEnabled();
    });
    return meaning;
  };

  it('asks the fast model on request only, and adds the meaning once confirmed', async () => {
    const inputs: unknown[] = [];
    const fake = createFakeServer({
      account: TEST_ACCOUNT,
      run: (_task, input) => {
        inputs.push(input);
        return Promise.resolve({
          ok: true,
          output: { meaningFr: 'dans tout, à travers' },
          costUsd: 0.0012,
          model: 'claude-haiku-4-5-20251001',
          promptVersion: 'explain-word@1',
        });
      },
    });
    const services = await createTestServices({ server: fake.server });
    await renderApp('/parcours/tense-present-continuous/lecon', services);
    const meaning = await pick();
    expect(screen.getByText(/Sens proposé par l’IA, que tu confirmes : au plus 0,0/)).toBeVisible();
    expect(fake.calls.run).toEqual([]);

    fireEvent.click(screen.getByRole('button', { name: 'Demander le sens à l’IA' }));
    await waitFor(() => {
      expect(meaning).toHaveValue('dans tout, à travers');
    });
    expect(fake.calls.run).toEqual(['explain-word']);
    expect(inputs).toEqual([
      {
        expression: 'across',
        sentence: 'Inflation is falling across the euro area.',
        englishVariant: 'en-GB',
      },
    ]);
    expect(screen.getByText(/Vérifie-le ou corrige-le/)).toHaveTextContent('Coût : 0,0012 USD.');
    // Never asked twice in this form.
    expect(
      screen.queryByRole('button', { name: 'Demander le sens à l’IA' }),
    ).not.toBeInTheDocument();
    // Nothing is written before the learner confirms.
    expect(await services.lexicon.list()).toEqual([]);

    fireEvent.change(meaning, { target: { value: 'à travers, dans toute' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter à mon lexique' }));
    expect(
      await screen.findByText('Ajouté à ton lexique, avec sa carte de révision.'),
    ).toBeInTheDocument();
    expect(await services.lexicon.list()).toMatchObject([
      { expression: 'across', meaningFr: 'à travers, dans toute', source: 'exercise' },
    ]);
  });

  it('keeps the proposed meaning in the draft: closing the form never loses it', async () => {
    const fake = createFakeServer({
      account: TEST_ACCOUNT,
      run: () =>
        Promise.resolve({
          ok: true,
          output: { meaningFr: 'dans tout, à travers' },
          costUsd: 0.0012,
          model: 'claude-haiku-4-5-20251001',
          promptVersion: 'explain-word@1',
        }),
    });
    const services = await createTestServices({ server: fake.server });
    await renderApp('/parcours/tense-present-continuous/lecon', services);
    const meaning = await pick();
    fireEvent.click(screen.getByRole('button', { name: 'Demander le sens à l’IA' }));
    await waitFor(() => {
      expect(meaning).toHaveValue('dans tout, à travers');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    const again = await pick();
    expect(again).toHaveValue('dans tout, à travers');
    expect(
      screen.queryByRole('button', { name: 'Demander le sens à l’IA' }),
    ).not.toBeInTheDocument();
    expect(fake.calls.run).toEqual(['explain-word']);
  });

  it('says why the meaning could not be obtained, and lets the learner type it', async () => {
    const fake = createFakeServer({
      account: TEST_ACCOUNT,
      run: () => Promise.resolve({ ok: false, error: { code: 'unreachable' } }),
    });
    const services = await createTestServices({ server: fake.server });
    await renderApp('/parcours/tense-present-continuous/lecon', services);
    const meaning = await pick();
    fireEvent.click(screen.getByRole('button', { name: 'Demander le sens à l’IA' }));
    expect(await screen.findByText('Sens non obtenu')).toBeInTheDocument();
    expect(meaning).toHaveValue('');
    expect(meaning).toBeEnabled();
  });

  it('treats an empty meaning as a failure, never as a proposal', async () => {
    const fake = createFakeServer({
      account: TEST_ACCOUNT,
      run: () =>
        Promise.resolve({
          ok: true,
          output: { meaningFr: '  ' },
          costUsd: 0.0012,
          model: 'claude-haiku-4-5-20251001',
          promptVersion: 'explain-word@1',
        }),
    });
    const services = await createTestServices({ server: fake.server });
    await renderApp('/parcours/tense-present-continuous/lecon', services);
    await pick();
    fireEvent.click(screen.getByRole('button', { name: 'Demander le sens à l’IA' }));
    expect(await screen.findByText('Sens non obtenu')).toBeInTheDocument();
    expect(screen.queryByText(/Vérifie-le ou corrige-le/)).not.toBeInTheDocument();
  });

  it('offers no AI once the learner has typed a meaning', async () => {
    const fake = createFakeServer({ account: TEST_ACCOUNT });
    const services = await createTestServices({ server: fake.server });
    await renderApp('/parcours/tense-present-continuous/lecon', services);
    const meaning = await pick();
    fireEvent.change(meaning, { target: { value: 'à travers' } });
    expect(
      screen.queryByRole('button', { name: 'Demander le sens à l’IA' }),
    ).not.toBeInTheDocument();
    expect(fake.calls.run).toEqual([]);
  });

  it('offers no AI without a server: the meaning is typed', async () => {
    const services = await createTestServices();
    await renderApp('/parcours/tense-present-continuous/lecon', services);
    await pick();
    expect(
      screen.queryByRole('button', { name: 'Demander le sens à l’IA' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Sens proposé par l’IA/)).not.toBeInTheDocument();
  });
});

describe('drafts of the form of a word touched (D-096)', () => {
  const open = async (word: string) => {
    const third = (await screen.findAllByRole('button', { name: 'Mot inconnu ?' }))[2];
    if (third === undefined) throw new Error('no word picker');
    fireEvent.click(third);
    fireEvent.click(screen.getByRole('button', { name: word }));
    fireEvent.click(screen.getByRole('button', { name: `Ajouter « ${word} »` }));
    const meaning = await screen.findByRole('textbox', {
      name: 'Sens en français, dans cette phrase',
    });
    await waitFor(() => {
      expect(meaning).toBeEnabled();
    });
    return {
      meaning,
      expression: screen.getByRole('textbox', { name: 'Mot ou expression' }),
    };
  };

  it('restores the expression as edited along with its meaning', async () => {
    const services = await createTestServices();
    await renderApp('/parcours/tense-present-continuous/lecon', services);
    const first = await open('across');
    fireEvent.change(first.expression, { target: { value: 'euro area' } });
    fireEvent.change(first.meaning, { target: { value: 'la zone euro' } });
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    const again = await open('across');
    await waitFor(() => {
      expect(again.expression).toHaveValue('euro area');
    });
    expect(again.meaning).toHaveValue('la zone euro');
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter à mon lexique' }));
    expect(await screen.findByText(/Ajouté à ton lexique/)).toBeInTheDocument();
    expect(await services.lexicon.list()).toMatchObject([
      { expression: 'euro area', meaningFr: 'la zone euro' },
    ]);
    // Added: the drafts are done with, and the form starts afresh.
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    const fresh = await open('across');
    expect(fresh.expression).toHaveValue('across');
    expect(fresh.meaning).toHaveValue('');
  });

  it('never lets a late proposal replace a meaning typed meanwhile', async () => {
    let answer: (value: Awaited<ReturnType<NonNullable<FakeServerOptions['run']>>>) => void = () =>
      undefined;
    const fake = createFakeServer({
      account: TEST_ACCOUNT,
      run: () =>
        new Promise((resolve) => {
          answer = resolve;
        }),
    });
    const services = await createTestServices({ server: fake.server });
    await renderApp('/parcours/tense-present-continuous/lecon', services);
    await open('across');
    fireEvent.click(screen.getByRole('button', { name: 'Demander le sens à l’IA' }));
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    const typed = await open('across');
    fireEvent.change(typed.meaning, { target: { value: 'à travers' } });
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    const key = `${wordDraftKey('across', 'Inflation is falling across the euro area.')}:meaning`;
    await waitFor(async () => {
      expect(await services.drafts.get(key)).toEqual({ state: 'present', text: 'à travers' });
    });
    await act(async () => {
      answer({
        ok: true,
        output: { meaningFr: 'dans tout' },
        costUsd: 0.0012,
        model: 'claude-haiku-4-5-20251001',
        promptVersion: 'explain-word@1',
      });
      // Long enough for any save the closed form could still make.
      await new Promise((resolve) => setTimeout(resolve, DRAFT_SAVE_DELAY_MS + 100));
    });
    expect(await services.drafts.get(key)).toEqual({ state: 'present', text: 'à travers' });

    const after = await open('across');
    await waitFor(() => {
      expect(after.meaning).toHaveValue('à travers');
    });
    expect(fake.calls.run).toEqual(['explain-word']);
  });
});
