import { themeOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { THEME_REVIEW } from './review.ts';

const { item } = themeOf('tense-past-simple', THEME_REVIEW);

export const THEME: NotionContentInput['theme'] = [
  item(1, {
    sentenceFr: 'Hier, j’ai envoyé le contrat au client.',
    situationFr:
      'Le client te demande où en est le contrat. Rassure-le : tu le lui as envoyé hier.',
    instructionEn:
      'The client asks about the contract. Reassure them: it went out to them yesterday, from you.',
    hint: 'Une action terminée, à un moment passé précis ; le verbe est irrégulier.',
    accepted: [
      'Yesterday I sent the contract to the client.',
      'I sent the contract to the client yesterday.',
      'Yesterday I sent the client the contract.',
      'I sent the client the contract yesterday.',
    ],
    knownErrors: [
      'Yesterday I sended the contract to the client.',
      'I sended the contract to the client yesterday.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation: '_Send_ est irrégulier : _send_, _sent_, _sent_. Moment passé précis : prétérit.',
  }),
  item(2, {
    sentenceFr: 'Nous avons rencontré l’équipe de direction la semaine dernière.',
    situationFr:
      'Ta responsable veut savoir si vous connaissez déjà l’équipe de direction. Réponds que oui : la rencontre a eu lieu la semaine dernière.',
    instructionEn:
      'Your manager wants to know whether your team knows the management team. Say yes: the meeting took place last week.',
    hint: 'Une action terminée, la semaine passée ; le verbe est irrégulier.',
    accepted: [
      'We met the management team last week.',
      'Last week we met the management team.',
      'We met the leadership team last week.',
      'Yes, we met the management team last week.',
    ],
    knownErrors: [
      'We meeted the management team last week.',
      'Last week we meeted the management team.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation: '_Meet_ est irrégulier : _meet_, _met_, _met_. _Last week_ : prétérit.',
  }),
  item(3, {
    sentenceFr: 'Elle a quitté l’entreprise en 2021.',
    situationFr:
      'Un client demande à parler à une ancienne collègue. Explique-lui que cette collègue est partie de l’entreprise en 2021.',
    instructionEn:
      'A client asks to speak to a former colleague of yours. Explain that her departure from the company was in 2021.',
    hint: 'Une date passée ; le verbe « quitter » est irrégulier.',
    accepted: [
      'She left the company in 2021.',
      'She left the firm in 2021.',
      'She left in 2021.',
      'In 2021 she left the company.',
    ],
    knownErrors: ['She leaved the company in 2021.', 'She leaved in 2021.'],
    knownErrorCategory: 'temps_verbaux',
    explanation: '_Leave_ est irrégulier : _leave_, _left_, _left_. Une date passée : prétérit.',
  }),
  item(4, {
    sentenceFr: 'Combien as-tu payé ce logiciel ?',
    situationFr: 'Un ami a acheté le même logiciel que toi. Demande-lui combien il lui a coûté.',
    instructionEn: 'A friend bought the same software as you. Ask about the price he paid.',
    hint: 'Une question sur un achat terminé : l’auxiliaire du passé, puis la base verbale.',
    accepted: [
      'How much did you pay for this software?',
      'How much did you pay for the software?',
      'How much did you pay for it?',
      'How much did this software cost you?',
      'How much did the software cost you?',
      'How much did it cost you?',
      'How much did you spend on this software?',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Question au prétérit : _did_ + sujet + base verbale. On paie _for_ quelque chose : _How much did you pay for it?_',
  }),
  item(5, {
    sentenceFr: 'Elle a ouvert le fichier, a corrigé les chiffres et l’a renvoyé.',
    situationFr:
      'Ton manager demande ce que l’analyste a fait du fichier. Raconte ses trois actions : ouverture du fichier, correction des chiffres, renvoi.',
    instructionEn:
      'Your manager asks what the analyst did with the file. Describe her three steps: opening it, correcting the figures, returning it.',
    hint: 'Une suite d’actions terminées, l’une après l’autre.',
    accepted: [
      'She opened the file, corrected the figures and sent it back.',
      'She opened the file, corrected the figures, and sent it back.',
      'She opened the file, corrected the numbers and sent it back.',
      'She opened the file, corrected the figures and returned it.',
      'She opened the file, fixed the figures and sent it back.',
      'She opened the file, corrected the figures and then sent it back.',
    ],
    knownErrors: [
      'She opened the file, corrected the figures and sended it back.',
      'She opened the file, corrected the numbers and sended it back.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une suite d’actions passées : chaque verbe au prétérit, _opened_, _corrected_, _sent_ (_send_ est irrégulier).',
  }),
  item(6, {
    sentenceFr: 'Pendant mes études, je travaillais le week-end dans un café.',
    situationFr:
      'En entretien, on te demande si tu as une expérience avec la clientèle. Raconte que pendant tes études, ton emploi du week-end était dans un café.',
    instructionEn:
      'In an interview, you are asked about your experience with customers. Explain that your weekend job during your studies was in a café.',
    hint: 'Une habitude passée et terminée.',
    accepted: [
      'During my studies, I worked in a café at weekends.',
      'During my studies, I worked in a café on weekends.',
      'During my studies, I worked in a cafe at weekends.',
      'During my studies, I worked in a cafe on weekends.',
      'When I was a student, I worked in a café at weekends.',
      'When I was a student, I worked in a café on weekends.',
      'When I was a student, I worked in a cafe on weekends.',
      'I worked in a café at weekends during my studies.',
      'I worked in a café on weekends when I was a student.',
      'During my studies, I used to work in a café at weekends.',
      'When I was a student, I used to work in a café at weekends.',
      'When I was a student, I used to work in a cafe on weekends.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une habitude passée et terminée : prétérit, _I worked_, ou _used to_, _I used to work_. Là où le français dit « je travaillais », l’anglais emploie le plus souvent le prétérit.',
  }),
];
