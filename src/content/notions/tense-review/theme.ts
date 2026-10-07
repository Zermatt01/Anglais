import { themeOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { THEME_REVIEW } from './review.ts';

// Mixed tenses: each sentence has one cue that decides its tense.
const { item } = themeOf('tense-review', THEME_REVIEW);

export const THEME: NotionContentInput['theme'] = [
  item(1, {
    sentenceFr: 'Nous utilisons ce logiciel depuis 2018.',
    situationFr:
      'Un client te demande si ton équipe maîtrise ce logiciel. Réponds que oui : vous l’avez adopté en 2018 et vous vous en servez toujours.',
    instructionEn:
      'A client asks whether your team knows this software well. Say yes: you adopted it in 2018 and it is still in daily use.',
    hint: 'Une situation qui a commencé à une date passée et qui dure encore.',
    accepted: [
      'We have used this software since 2018.',
      'We’ve used this software since 2018.',
      'We have been using this software since 2018.',
      'We’ve been using this software since 2018.',
      'Yes, we’ve been using this software since 2018.',
      'Yes, we have used it since 2018.',
      'We’ve been using it since 2018.',
    ],
    knownErrors: ['We use this software since 2018.', 'We are using this software since 2018.'],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '« Depuis » + une date, situation qui dure encore : present perfect (continu) et _since_.',
  }),
  item(2, {
    sentenceFr: 'J’ai obtenu mon diplôme il y a trois ans.',
    situationFr:
      'En entretien, on te demande quand tu as terminé tes études. Réponds que la remise de ton diplôme date d’il y a trois ans.',
    instructionEn:
      'In an interview, you are asked when your studies ended. Place your graduation three years back in time.',
    hint: 'Une action terminée, située par rapport à aujourd’hui.',
    accepted: [
      'I graduated three years ago.',
      'I got my degree three years ago.',
      'I obtained my degree three years ago.',
      'I got my diploma three years ago.',
      'I finished my studies three years ago.',
      'I graduated 3 years ago.',
    ],
    knownErrors: [
      'I have graduated three years ago.',
      'I graduated since three years.',
      'I have got my degree three years ago.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation: '_Ago_ situe une action terminée : prétérit, _I graduated three years ago_.',
  }),
  item(3, {
    sentenceFr: 'Ne fais pas de bruit, le bébé dort.',
    situationFr:
      'Un collègue passe chez toi pendant la sieste du bébé. Demande-lui de rester silencieux, et explique pourquoi.',
    instructionEn:
      'A colleague visits you at home during the baby’s nap. Ask him to keep quiet and give the reason.',
    hint: 'Ce qui se passe en ce moment même.',
    accepted: [
      'Don’t make any noise, the baby is sleeping.',
      'Don’t make any noise, the baby’s sleeping.',
      'Don’t make a noise, the baby is sleeping.',
      'Don’t make noise, the baby is sleeping.',
      'Don’t make any noise: the baby is asleep.',
      'Be quiet, the baby is sleeping.',
      'Please be quiet, the baby is sleeping.',
      'Please be quiet, the baby is asleep.',
    ],
    knownErrors: ['Don’t make any noise, the baby sleeps.', 'Be quiet, the baby sleeps.'],
    knownErrorCategory: 'temps_verbaux',
    explanation: 'Ce qui se passe en ce moment même : présent continu, _the baby is sleeping_.',
  }),
  item(4, {
    sentenceFr: 'J’étais en train de conduire quand j’ai entendu la nouvelle.',
    situationFr:
      'On te demande où tu étais au moment de l’annonce de la fusion. Explique que tu étais au volant quand tu as appris la nouvelle.',
    instructionEn:
      'Someone asks where you were when the merger was announced. Explain that you were behind the wheel when the news reached you.',
    hint: 'Une action en cours dans le passé, interrompue par une action brève.',
    accepted: [
      'I was driving when I heard the news.',
      'When I heard the news, I was driving.',
      'I was driving when I learnt the news.',
      'I was driving when I learned the news.',
      'I was driving when the news came in.',
    ],
    knownErrors: ['I drove when I heard the news.', 'I drove when I was hearing the news.'],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '« J’étais en train de » : passé continu, _I was driving_. L’action brève : prétérit, _I heard_.',
  }),
  item(5, {
    sentenceFr: 'Dès que je recevrai ta facture, je la paierai.',
    situationFr:
      'Un prestataire te demande quand il sera payé. Promets-lui un paiement immédiat, au moment où sa facture te parviendra.',
    instructionEn:
      'A contractor asks when he will be paid. Promise immediate payment, the moment his invoice reaches you.',
    hint: 'Après « dès que », pour l’avenir, l’anglais n’emploie pas le futur.',
    accepted: [
      'As soon as I receive your invoice, I’ll pay it.',
      'As soon as I receive your invoice, I will pay it.',
      'As soon as I get your invoice, I’ll pay it.',
      'I’ll pay your invoice as soon as I receive it.',
      'I’ll pay your invoice as soon as I get it.',
      'I will pay your invoice as soon as I receive it.',
      'As soon as I’ve received your invoice, I’ll pay it.',
      'I’ll pay it as soon as I receive your invoice.',
    ],
    knownErrors: [
      'As soon as I will receive your invoice, I’ll pay it.',
      'As soon as I will get your invoice, I’ll pay it.',
      'I’ll pay your invoice as soon as I will receive it.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Après _as soon as_, le futur s’exprime au présent : _as soon as I receive it_. _Will_ reste dans la principale.',
  }),
  item(6, {
    sentenceFr: 'Quand le directeur est entré, nous avions déjà voté.',
    situationFr:
      'Tu racontes l’assemblée d’hier : le directeur est arrivé en retard, après le vote.',
    instructionEn:
      'You describe yesterday’s general meeting: the director arrived late, after the vote.',
    hint: 'Une action terminée avant un autre moment du passé.',
    accepted: [
      'When the director came in, we had already voted.',
      'When the director arrived, we had already voted.',
      'When the director walked in, we had already voted.',
      'By the time the director came in, we had already voted.',
      'By the time the director arrived, we had already voted.',
      'We had already voted when the director came in.',
      'We had already voted when the director arrived.',
    ],
    knownErrors: [
      'When the director came in, we have already voted.',
      'When the director arrived, we have already voted.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Le vote a eu lieu avant l’arrivée du directeur : past perfect, _we had already voted_.',
  }),
];
