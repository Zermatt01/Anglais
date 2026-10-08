/**
 * Reprises (MOD-03, CARD-05), Mon lexique (MOD-09) and the rule book
 * (MOD-10), on a real in-memory database and a fake server.
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CardContent } from '../../domain/cards/content.ts';
import { createTestServices, renderApp } from '../../test/render.tsx';
import { createFakeServer, TEST_ACCOUNT } from '../../test/server.ts';
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
        promptVersion: 'correct-production@1',
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
