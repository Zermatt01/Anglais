import { themeOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { THEME_REVIEW } from './review.ts';

const { item } = themeOf('tense-present-simple', THEME_REVIEW);

export const THEME: NotionContentInput['theme'] = [
  item(1, {
    sentenceFr: 'Ma sœur travaille dans une banque à Genève.',
    situationFr:
      'Un recruteur te demande si tu connais le secteur bancaire suisse. Explique que ta sœur y travaille, dans une banque de Genève.',
    instructionEn:
      'A recruiter asks whether you know Swiss banking. Explain that your sister has a job in a bank in Geneva.',
    hint: 'Un emploi stable : un fait permanent, avec un sujet à la 3e personne.',
    accepted: [
      'My sister works in a bank in Geneva.',
      'My sister works at a bank in Geneva.',
      'My sister works for a bank in Geneva.',
      'My sister works in a Geneva bank.',
      'My sister works for a Geneva bank.',
    ],
    knownErrors: ['My sister work in a bank in Geneva.', 'My sister work at a bank in Geneva.'],
    knownErrorCategory: 'accord_sujet_verbe',
    explanation:
      'Un fait permanent : présent simple. Avec _my sister_ (3e personne du singulier), le verbe prend un _-s_ : _works_.',
  }),
  item(2, {
    sentenceFr: 'Nous publions un rapport tous les trimestres.',
    situationFr:
      'Un client veut savoir à quelle fréquence vous communiquez vos résultats. Réponds : un rapport, tous les trois mois.',
    instructionEn:
      'A client wants to know how often your company shares its results. Answer that a report comes out every three months.',
    hint: 'Une habitude qui revient régulièrement.',
    accepted: [
      'We publish a report every quarter.',
      'We publish a report each quarter.',
      'Every quarter we publish a report.',
      'We publish a report every three months.',
      'Every three months we publish a report.',
      'We publish a quarterly report.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation: 'Une habitude régulière (_every quarter_) : présent simple, _we publish_.',
  }),
  item(3, {
    sentenceFr: 'Marc ne boit pas de café.',
    situationFr:
      'Tu commandes des boissons pour la réunion. Explique qu’il ne faut pas de café pour Marc : ce n’est pas une boisson pour lui.',
    instructionEn:
      'You are ordering drinks for a meeting. Explain that coffee is not for Marc: it is simply not part of his habits.',
    hint: 'Une habitude, à la forme négative, avec un sujet à la 3e personne.',
    accepted: [
      'Marc doesn’t drink coffee.',
      'He doesn’t drink coffee.',
      'Marc never drinks coffee.',
      'He never drinks coffee.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Négation du présent simple à la 3e personne : _doesn’t_ + base verbale, _Marc doesn’t drink_.',
  }),
  item(4, {
    sentenceFr: 'Est-ce que ce modèle fonctionne avec des données en temps réel ?',
    situationFr:
      'Un fournisseur te présente son outil d’analyse. Tu veux savoir si son modèle fonctionne avec des données en temps réel. Pose-lui la question.',
    instructionEn:
      'A supplier presents an analytics tool. Ask whether its model is designed for real-time data.',
    hint: 'Une question sur un fait général, avec un sujet à la 3e personne.',
    accepted: [
      'Does this model work with real-time data?',
      'Does the model work with real-time data?',
      'Does your model work with real-time data?',
      'Does this model work with live data?',
      'Does the model work with live data?',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Question au présent simple, 3e personne : _Does_ + sujet + base verbale, _Does this model work…?_',
  }),
  item(5, {
    sentenceFr: 'Je vérifie toujours les chiffres deux fois.',
    situationFr:
      'En entretien, on te demande comment tu évites les erreurs. Réponds que tu as une habitude : vérifier les chiffres deux fois, sans exception.',
    instructionEn:
      'In an interview, you are asked how you avoid mistakes. Answer that a double check of the figures is a habit of yours, without exception.',
    hint: 'Une habitude ; l’adverbe de fréquence se place avant le verbe principal.',
    accepted: [
      'I always check the figures twice.',
      'I always check the numbers twice.',
      'I always double-check the figures.',
      'I always double-check the numbers.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une habitude (_always_) : présent simple. _Always_ se place avant le verbe : _I always check_.',
  }),
  item(6, {
    sentenceFr: 'Ce rapport appartient au service financier.',
    situationFr:
      'Un stagiaire veut emporter un rapport laissé sur la table. Explique-lui à qui il appartient : au service financier.',
    instructionEn:
      'An intern wants to take a report left on the table. Explain that its owner is the finance department.',
    hint: '« Appartenir » est un verbe d’état.',
    accepted: [
      'This report belongs to the finance department.',
      'The report belongs to the finance department.',
      'This report belongs to the finance team.',
      'It belongs to the finance department.',
    ],
    knownErrors: [
      'This report is belonging to the finance department.',
      'The report is belonging to the finance department.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '_Belong_ est un verbe d’état : il reste au présent simple, jamais en _-ing_ : _it belongs_.',
  }),
];
