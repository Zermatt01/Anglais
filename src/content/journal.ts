/**
 * Questions of the journal (MOD-07): three to five free sentences answer one
 * of them. They are asked in English, with their French meaning on request,
 * and chosen from the learner's domains first (`pickJournalQuestion`).
 * Original content (CUR-15), reviewed like the rest of the curriculum.
 */
import type { JournalQuestion } from './schema.ts';

const review = { first: '2026-10-07', second: '2026-10-07' } as const;

const question = (
  number: number,
  en: string,
  fr: string,
  domains: JournalQuestion['domains'],
): JournalQuestion => ({
  id: `journal/q${String(number).padStart(2, '0')}`,
  en,
  fr,
  domains,
  review,
});

export const JOURNAL_QUESTIONS: readonly JournalQuestion[] = [
  question(
    1,
    'What did you do at work yesterday? Describe two or three tasks.',
    'Qu’as-tu fait au travail hier ? Décris deux ou trois tâches.',
    ['workplace-communication', 'finance', 'data-ai'],
  ),
  question(
    2,
    'What have you learnt this week, at work or elsewhere?',
    'Qu’as-tu appris cette semaine, au travail ou ailleurs ?',
    ['daily-life', 'teaching'],
  ),
  question(
    3,
    'Describe a typical working day for you.',
    'Décris une journée de travail type pour toi.',
    ['workplace-communication', 'teaching'],
  ),
  question(
    4,
    'What are you working on at the moment? Why does it matter?',
    'Sur quoi travailles-tu en ce moment ? Pourquoi est-ce important ?',
    ['workplace-communication', 'data-ai', 'finance'],
  ),
  question(
    5,
    'Tell me about a problem you solved recently. How did you solve it?',
    'Parle-moi d’un problème que tu as résolu récemment. Comment l’as-tu résolu ?',
    ['job-interviews', 'data-ai'],
  ),
  question(
    6,
    'How long have you lived in your current home? What do you like about it?',
    'Depuis combien de temps habites-tu dans ton logement actuel ? Qu’est-ce qui t’y plaît ?',
    ['daily-life'],
  ),
  question(
    7,
    'What are your plans for next weekend?',
    'Quels sont tes projets pour le week-end prochain ?',
    ['daily-life'],
  ),
  question(
    8,
    'Which economic or market news caught your attention this week? Why?',
    'Quelle actualité économique ou financière a retenu ton attention cette semaine ? Pourquoi ?',
    ['finance'],
  ),
  question(
    9,
    'Explain to a colleague, in simple words, how a model or a method you know works.',
    'Explique à un collègue, avec des mots simples, comment fonctionne un modèle ou une méthode que tu connais.',
    ['data-ai', 'teaching'],
  ),
  question(
    10,
    'Describe a lesson that went well, one you taught or one you attended.',
    'Décris un cours qui s’est bien passé, que tu l’aies donné ou suivi.',
    ['teaching'],
  ),
  question(
    11,
    'Why do you want to work in finance or data? Answer as you would in a job interview.',
    'Pourquoi veux-tu travailler dans la finance ou la data ? Réponds comme en entretien d’embauche.',
    ['job-interviews', 'finance', 'data-ai'],
  ),
  question(
    12,
    'What is your greatest professional strength? Give an example.',
    'Quelle est ta plus grande qualité professionnelle ? Donne un exemple.',
    ['job-interviews'],
  ),
  question(
    13,
    'Write a short update to your manager about a project in progress.',
    'Écris un court point d’étape à ton manager sur un projet en cours.',
    ['workplace-communication'],
  ),
  question(
    14,
    'What had you already done before you started your current job or studies?',
    'Qu’avais-tu déjà fait avant de commencer ton poste ou tes études actuels ?',
    ['job-interviews', 'daily-life'],
  ),
  question(
    15,
    'What has changed in your daily life over the last year?',
    'Qu’est-ce qui a changé dans ta vie quotidienne au cours de l’année écoulée ?',
    ['daily-life'],
  ),
  question(
    16,
    'Describe a mistake you made at work or in your studies, and what you learnt from it.',
    'Décris une erreur que tu as faite au travail ou pendant tes études, et ce qu’elle t’a appris.',
    ['job-interviews', 'teaching'],
  ),
  question(
    17,
    'How do the decisions of a central bank affect ordinary people? Give one example.',
    'Comment les décisions d’une banque centrale touchent-elles les gens ordinaires ? Donne un exemple.',
    ['finance'],
  ),
  question(
    18,
    'What do you usually do to prepare for an important meeting?',
    'Que fais-tu d’habitude pour préparer une réunion importante ?',
    ['workplace-communication', 'job-interviews'],
  ),
  question(
    19,
    'Which tool or app has saved you the most time recently? How?',
    'Quel outil ou quelle application t’a fait gagner le plus de temps récemment ? Comment ?',
    ['data-ai', 'daily-life'],
  ),
  question(
    20,
    'Tell me about a book, a film or a podcast you enjoyed recently.',
    'Parle-moi d’un livre, d’un film ou d’un podcast que tu as aimé récemment.',
    ['daily-life'],
  ),
  question(
    21,
    'What were you doing at this time yesterday?',
    'Que faisais-tu hier à la même heure ?',
    ['daily-life'],
  ),
  question(22, 'Where do you see yourself in five years?', 'Où te vois-tu dans cinq ans ?', [
    'job-interviews',
  ]),
  question(
    23,
    'What advice would you give to a student who is starting to learn finance or data science?',
    'Quel conseil donnerais-tu à un étudiant qui commence à apprendre la finance ou la data science ?',
    ['teaching', 'finance', 'data-ai'],
  ),
  question(
    24,
    'How do you organise your week when you have a lot of work?',
    'Comment organises-tu ta semaine quand tu as beaucoup de travail ?',
    ['workplace-communication', 'daily-life'],
  ),
];
