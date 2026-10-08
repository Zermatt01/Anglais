/**
 * Complete, contrasted examples of the correction prompt (AI-04): errors of
 * several categories, a text with no error at all, and a correct but
 * unnatural phrase next to a minor error. Original content (CUR-15). The
 * contract tests check every output against the output schema, and that each
 * segment and sentence is copied exactly from its text.
 */
import type { AiTaskInput, CorrectionOutput } from '../tasks.ts';

export interface CorrectionExample {
  readonly title: string;
  readonly module: AiTaskInput<'correct-production'>['module'];
  readonly instruction: AiTaskInput<'correct-production'>['instruction'];
  readonly reference: AiTaskInput<'correct-production'>['reference'];
  readonly targetNotionId: AiTaskInput<'correct-production'>['targetNotionId'];
  readonly text: string;
  readonly output: CorrectionOutput;
}

const SEVERAL_ERRORS =
  'Last week I have presented the quarterly results to the board. I work in this team since 2023 and I am agree with my manager about the new strategy. She gave me many advices.';

const NO_ERROR = "The quarterly results were due yesterday, but I still haven't got them.";

const UNNATURAL =
  'According to me, the market is changing a lot this year. At the moment I am working on a new project, but usually I prepare the monthly reports every monday.';

export const CORRECTION_EXAMPLES: readonly CorrectionExample[] = [
  {
    title: 'A journal entry with four errors across three categories',
    module: 'journal',
    instruction: { text: 'What did you do at work last week?', language: 'en' },
    reference: null,
    targetNotionId: null,
    text: SEVERAL_ERRORS,
    output: {
      intentFr:
        'La semaine dernière, j’ai présenté les résultats trimestriels au conseil d’administration. Je travaille dans cette équipe depuis 2023 et je suis d’accord avec ma responsable sur la nouvelle stratégie. Elle m’a donné beaucoup de conseils.',
      errors: [
        {
          segment: 'have presented',
          start: SEVERAL_ERRORS.indexOf('have presented'),
          category: 'temps_verbaux',
          notionId: 'tense-present-perfect-vs-past-simple',
          severity: 'medium',
          confidence: 'high',
          hintFr: '_Last week_ situe l’action dans une période terminée : quel temps convient ?',
          correction: 'presented',
          ruleFr:
            'Avec un moment passé terminé (_last week_, _yesterday_), on emploie le prétérit, pas le present perfect.',
        },
        {
          segment: 'I work',
          start: SEVERAL_ERRORS.indexOf('I work'),
          category: 'temps_verbaux',
          notionId: 'tense-for-since-ago',
          severity: 'medium',
          confidence: 'high',
          hintFr:
            '_Since 2023_ : la situation a commencé dans le passé et dure encore. Le présent simple convient-il ?',
          correction: 'I have worked',
          ruleFr:
            'Pour une situation commencée dans le passé qui dure encore (« depuis »), on emploie le present perfect : _I have worked here since 2023_.',
        },
        {
          segment: 'am agree',
          start: SEVERAL_ERRORS.indexOf('am agree'),
          category: 'calques_du_francais',
          notionId: null,
          severity: 'medium',
          confidence: 'high',
          hintFr: 'En anglais, « être d’accord » se dit avec un seul verbe.',
          correction: 'agree',
          ruleFr: '« Être d’accord » se dit _to agree_ : _I agree_, jamais _I am agree_.',
        },
        {
          segment: 'many advices',
          start: SEVERAL_ERRORS.indexOf('many advices'),
          category: 'indenombrables_pluriels',
          notionId: 'nouns-countable-uncountable',
          severity: 'medium',
          confidence: 'high',
          hintFr: 'Ce nom est indénombrable en anglais.',
          correction: 'a lot of advice',
          ruleFr:
            '_Advice_ est indénombrable : ni pluriel ni _many_. On dit _a lot of advice_ ou _some advice_.',
        },
      ],
      unnatural: [],
      sentences: [
        {
          original: 'Last week I have presented the quarterly results to the board.',
          corrected: 'Last week I presented the quarterly results to the board.',
          meaningFr:
            'La semaine dernière, j’ai présenté les résultats trimestriels au conseil d’administration.',
        },
        {
          original:
            'I work in this team since 2023 and I am agree with my manager about the new strategy.',
          corrected:
            'I have worked in this team since 2023 and I agree with my manager about the new strategy.',
          meaningFr:
            'Je travaille dans cette équipe depuis 2023 et je suis d’accord avec ma responsable sur la nouvelle stratégie.',
        },
        {
          original: 'She gave me many advices.',
          corrected: 'She gave me a lot of advice.',
          meaningFr: 'Elle m’a donné beaucoup de conseils.',
        },
      ],
      correctedText:
        'Last week I presented the quarterly results to the board. I have worked in this team since 2023 and I agree with my manager about the new strategy. She gave me a lot of advice.',
      naturalVersion:
        "Last week I presented the quarterly results to the board. I've been working in this team since 2023, and I agree with my manager on the new strategy. She gave me a lot of advice.",
      targetNotionUses: null,
      expressionOfTheDay: {
        expression: 'to be on the same page',
        meaningFr: 'être sur la même longueur d’onde',
        example: 'My manager and I are on the same page about the new strategy.',
      },
      evaluation: {
        accuracy: 2,
        naturalness: 3,
        complexity: 3,
        level: 'A2',
        commentFr:
          'Ton message est clair et bien organisé. Travaille surtout le choix entre prétérit et present perfect.',
      },
    },
  },
  {
    title:
      'A Thème sentence that is entirely correct, although it differs from the reference: no error',
    module: 'theme',
    instruction: {
      text: 'Tu écris à ton manager : tu attends toujours les résultats trimestriels, qui auraient dû arriver hier. Dis-le-lui en une phrase.',
      language: 'fr',
    },
    reference: {
      meaningFr: 'Je n’ai toujours pas reçu les résultats trimestriels.',
      answers: ["I still haven't received the quarterly results."],
    },
    targetNotionId: 'tense-just-already-yet-still',
    text: NO_ERROR,
    output: {
      intentFr:
        'Les résultats trimestriels étaient attendus hier, mais je ne les ai toujours pas reçus.',
      errors: [],
      unnatural: [],
      sentences: [],
      correctedText: NO_ERROR,
      naturalVersion: NO_ERROR,
      targetNotionUses: ["still haven't got"],
      expressionOfTheDay: null,
      evaluation: {
        accuracy: 5,
        naturalness: 5,
        complexity: 3,
        level: 'B1',
        commentFr: 'Phrase juste et naturelle, différente de la référence : c’est très bien.',
      },
    },
  },
  {
    title:
      'A correct but unnatural phrase (never an error), a minor error, and a present continuous that is right for a temporary situation',
    module: 'path-produce',
    instruction: {
      text: 'Décris ce que tu fais en ce moment dans ton travail, et ce que tu fais d’habitude.',
      language: 'fr',
    },
    reference: null,
    targetNotionId: 'tense-present-simple-vs-continuous',
    text: UNNATURAL,
    output: {
      intentFr:
        'À mon avis, le marché change beaucoup cette année. En ce moment, je travaille sur un nouveau projet, mais d’habitude je prépare les rapports mensuels tous les lundis.',
      errors: [
        {
          segment: 'monday',
          start: UNNATURAL.indexOf('monday'),
          category: 'orthographe',
          notionId: null,
          severity: 'minor',
          confidence: 'high',
          hintFr: 'Vérifie l’écriture des jours de la semaine en anglais.',
          correction: 'Monday',
          ruleFr:
            'En anglais, les jours, les mois, les langues et les nationalités prennent une majuscule.',
        },
      ],
      unnatural: [
        {
          original: 'According to me',
          alternative: 'In my opinion',
          whyFr:
            '_According to me_ se comprend, mais un anglophone dit plutôt _In my opinion_ ou _I think_.',
          category: 'calques_du_francais',
        },
      ],
      sentences: [
        {
          original:
            'At the moment I am working on a new project, but usually I prepare the monthly reports every monday.',
          corrected:
            'At the moment I am working on a new project, but usually I prepare the monthly reports every Monday.',
          meaningFr:
            'En ce moment, je travaille sur un nouveau projet, mais d’habitude je prépare les rapports mensuels tous les lundis.',
        },
      ],
      correctedText:
        'According to me, the market is changing a lot this year. At the moment I am working on a new project, but usually I prepare the monthly reports every Monday.',
      naturalVersion:
        "In my opinion, the market is changing a lot this year. At the moment I'm working on a new project, but I usually prepare the monthly reports every Monday.",
      targetNotionUses: ['is changing', 'I am working', 'I prepare'],
      expressionOfTheDay: {
        expression: 'to keep track of',
        meaningFr: 'suivre, garder une trace de',
        example: 'I use a spreadsheet to keep track of the monthly reports.',
      },
      evaluation: {
        accuracy: 4,
        naturalness: 3,
        complexity: 3,
        level: 'B1',
        commentFr:
          'Bon contraste entre ce qui est temporaire et ce qui est habituel. Pense à _In my opinion_ plutôt qu’à _According to me_.',
      },
    },
  },
];
