import { themeOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { THEME_REVIEW } from './review.ts';

const { item } = themeOf('tense-present-perfect-vs-past-simple', THEME_REVIEW);

export const THEME: NotionContentInput['theme'] = [
  item(1, {
    sentenceFr: 'J’ai fini le rapport hier soir.',
    situationFr:
      'Ta responsable demande si le rapport sera prêt pour la réunion. Rassure-la : le travail était bouclé dès hier soir.',
    instructionEn:
      'Your manager asks whether the report will be ready for the meeting. Reassure her: it was done by last night.',
    hint: 'Un moment passé précis et terminé.',
    accepted: [
      'I finished the report last night.',
      'I finished the report yesterday evening.',
      'Last night I finished the report.',
      'I completed the report last night.',
      'I finished it last night.',
      'I finished it yesterday evening.',
    ],
    knownErrors: [
      'I have finished the report last night.',
      'I have finished the report yesterday evening.',
      'I have finished it last night.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Un moment passé précis (_last night_) : prétérit, _I finished_. Le present perfect ne s’emploie pas avec un moment passé daté.',
  }),
  item(2, {
    sentenceFr: 'Est-ce que tu as déjà investi en bourse ?',
    situationFr:
      'Un ami hésite à placer ses économies en actions. Demande-lui si c’est une expérience qu’il a déjà vécue.',
    instructionEn:
      'A friend is unsure about putting his savings into shares. Ask whether the stock market is part of his past experience.',
    hint: 'Une question sur une expérience, à un moment quelconque de la vie.',
    accepted: [
      'Have you ever invested in the stock market?',
      'Have you ever invested in shares?',
      'Have you ever invested in stocks?',
      'Have you invested in the stock market before?',
      'Have you ever put money in the stock market?',
      'Did you ever invest in the stock market?',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation: 'Une expérience, sans moment précis : present perfect, _Have you ever invested…?_',
  }),
  item(3, {
    sentenceFr: 'Quand as-tu commencé ce poste ?',
    situationFr:
      'Tu fais connaissance avec une nouvelle collègue. Demande-lui la date de ses débuts à son poste actuel.',
    instructionEn:
      'You are getting to know a new colleague. Ask about the start date of her current job.',
    hint: 'Une question sur le moment d’une action passée.',
    accepted: [
      'When did you start this job?',
      'When did you start your job?',
      'When did you start your current job?',
      'When did you start in this position?',
      'When did you start this position?',
      'When did you start working here?',
      'When did you begin this job?',
    ],
    knownErrors: [
      'When have you started this job?',
      'When have you started your job?',
      'When have you started your current job?',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une question en _When…?_ porte sur un moment passé : prétérit, _When did you start…?_, jamais le present perfect.',
  }),
  item(4, {
    sentenceFr: 'C’est la première fois que je rencontre un client aussi exigeant.',
    situationFr:
      'Après une réunion difficile, tu te confies à une collègue : de toute ta carrière, aucun client n’a été aussi exigeant. Commence par « C’est la première fois ».',
    instructionEn:
      'After a tough meeting, you confide in a colleague: no client in your career has been this demanding. Start with “It’s the first time”.',
    hint: 'Après « c’est la première fois que », l’anglais relie l’expérience au présent.',
    accepted: [
      'It’s the first time I’ve met such a demanding client.',
      'It is the first time I have met such a demanding client.',
      'This is the first time I’ve met such a demanding client.',
      'It’s the first time I’ve met a client this demanding.',
      'It’s the first time I’ve met a client who is so demanding.',
      'It’s the first time I’ve dealt with such a demanding client.',
      'It’s the first time I’ve had such a demanding client.',
    ],
    knownErrors: [
      'It’s the first time I meet such a demanding client.',
      'It is the first time I meet such a demanding client.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '_It’s the first time_ est suivi du present perfect : _It’s the first time I’ve met…_, là où le français met le présent.',
  }),
  item(5, {
    sentenceFr: 'Nous avons vendu plus cette année que l’année dernière.',
    situationFr:
      'La direction veut savoir si l’année est meilleure que la précédente. Réponds que oui : depuis janvier, les ventes dépassent déjà celles de l’an dernier.',
    instructionEn:
      'Management wants to know whether this year is better than the previous one. Answer yes: sales since January are already above last year’s.',
    hint: 'Une période pas encore terminée, comparée à une période terminée.',
    accepted: [
      'We have sold more this year than last year.',
      'We’ve sold more this year than last year.',
      'This year we have sold more than last year.',
      'We have already sold more this year than last year.',
      'We’ve already sold more this year than last year.',
      'We sold more this year than last year.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation: 'Une période pas encore terminée (_this year_) : present perfect, _we have sold_.',
  }),
  item(6, {
    sentenceFr: 'Elle est partie à 17 heures.',
    situationFr:
      'Un client demande à parler à ta collègue en fin de journée. Explique qu’elle n’est plus là : elle a quitté le bureau à 17 heures.',
    instructionEn:
      'A client asks for your colleague late in the day. Explain that she is gone: 5 pm was the time of her departure.',
    hint: 'Une heure passée précise.',
    accepted: [
      'She left at 5 pm.',
      'She left at 5 p.m.',
      'She left at five pm.',
      'She left at five o’clock.',
      'She left at 5 o’clock.',
      'She left the office at 5 pm.',
      'She left the office at five o’clock.',
    ],
    knownErrors: [
      'She has left at 5 pm.',
      'She has left at five o’clock.',
      'She has left the office at 5 pm.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une heure passée précise (_at 5 pm_) : prétérit, _she left_. Avec un moment daté, pas de present perfect.',
  }),
];
