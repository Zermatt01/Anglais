import { themeOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { THEME_REVIEW } from './review.ts';

const { item } = themeOf('tense-past-continuous', THEME_REVIEW);

export const THEME: NotionContentInput['theme'] = [
  item(1, {
    sentenceFr: 'Je préparais le dîner quand le téléphone a sonné.',
    situationFr:
      'Un ami te demande pourquoi tu n’as pas décroché tout de suite hier soir. Explique que tu étais aux fourneaux au moment où le téléphone a sonné.',
    instructionEn:
      'A friend asks why you did not answer straight away last night. Explain that the call came in the middle of your cooking.',
    hint: 'Une action en cours dans le passé, interrompue par une action brève.',
    accepted: [
      'I was cooking dinner when the phone rang.',
      'I was making dinner when the phone rang.',
      'I was preparing dinner when the phone rang.',
      'When the phone rang, I was cooking dinner.',
      'When the phone rang, I was making dinner.',
      'When the phone rang, I was preparing dinner.',
      'I was cooking when the phone rang.',
      'I was in the middle of cooking dinner when the phone rang.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'L’action en cours (« je préparais ») : passé continu, _I was cooking_. L’action brève qui l’interrompt : prétérit, _the phone rang_.',
  }),
  item(2, {
    sentenceFr: 'Pendant que je lisais le rapport, mon collègue passait des appels.',
    situationFr:
      'On te demande comment s’est passée ta matinée d’hier au bureau. Décris deux activités en même temps : toi, la lecture du rapport ; ton collègue, des appels téléphoniques.',
    instructionEn:
      'Someone asks about yesterday morning at the office. Describe two activities at the same time: you and the report, your colleague and the phone.',
    hint: 'Deux actions en cours en même temps, dans le passé.',
    accepted: [
      'While I was reading the report, my colleague was making calls.',
      'While I was reading the report, my colleague was making phone calls.',
      'My colleague was making calls while I was reading the report.',
      'My colleague was making phone calls while I was reading the report.',
      'While I was reading the report, my colleague was on the phone.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Deux actions en cours au même moment du passé : passé continu des deux côtés, avec _while_.',
  }),
  item(3, {
    sentenceFr: 'À 20 heures hier soir, je travaillais encore.',
    situationFr:
      'Ta responsable s’étonne que tu aies envoyé un e-mail si tard hier. Explique qu’à 20 heures, ta journée de travail continuait encore.',
    instructionEn:
      'Your manager is surprised that you sent an e-mail so late yesterday. Explain that at 8 pm your working day was not over.',
    hint: 'Une action en cours à un moment précis du passé.',
    accepted: [
      'At 8 pm last night, I was still working.',
      'At 8 p.m. last night, I was still working.',
      'At eight o’clock last night, I was still working.',
      'I was still working at 8 pm last night.',
      'I was still working at 8 p.m. last night.',
      'I was still working at eight o’clock last night.',
      'At 8 pm yesterday evening, I was still working.',
      'I was still working at 8 pm yesterday evening.',
      'I was still working at 8 pm.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une action en cours à une heure précise du passé (_at 8 pm last night_) : passé continu, _I was still working_.',
  }),
  item(4, {
    sentenceFr: 'Qu’est-ce que tu faisais quand je t’ai téléphoné ?',
    situationFr:
      'Ton collègue n’a pas décroché tout à l’heure. Demande-lui ce qu’il était en train de faire au moment de ton appel.',
    instructionEn:
      'Your colleague did not pick up the phone earlier. Ask what he was busy with at the time of your call.',
    hint: 'Une question sur une action en cours dans le passé, interrompue par l’appel.',
    accepted: [
      'What were you doing when I called you?',
      'What were you doing when I called?',
      'What were you doing when I phoned you?',
      'What were you doing when I phoned?',
      'What were you doing when I rang you?',
      'What were you doing when I rang?',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'L’action en cours : passé continu, _What were you doing…?_ L’appel, bref : prétérit, _when I called_.',
  }),
  item(5, {
    sentenceFr: 'Je savais qu’il mentait.',
    situationFr:
      'Après la négociation, ton associé te demande si tu croyais le fournisseur. Réponds que non : pour toi, il était évident qu’il ne disait pas la vérité.',
    instructionEn:
      'After the negotiation, your partner asks whether you believed the supplier. Answer no: it was clear to you that his words were false.',
    hint: '« Savoir » est un verbe d’état ; le mensonge, lui, était en cours.',
    accepted: [
      'I knew he was lying.',
      'I knew that he was lying.',
      'I knew he wasn’t telling the truth.',
      'I knew that he wasn’t telling the truth.',
      'No, I knew he was lying.',
    ],
    knownErrors: ['I was knowing he was lying.', 'I was knowing that he was lying.'],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '_Know_ est un verbe d’état : il reste au prétérit, _I knew_. Le mensonge en cours : passé continu, _he was lying_.',
  }),
  item(6, {
    sentenceFr: 'La coupure de courant s’est produite pendant que nous présentions les résultats.',
    situationFr:
      'Un client a manqué la réunion d’hier et demande pourquoi elle s’est arrêtée. Explique que l’électricité a été coupée en pleine présentation des résultats.',
    instructionEn:
      'A client missed yesterday’s meeting and asks why it stopped. Explain that the electricity went off in the middle of your presentation of the results.',
    hint: 'Un événement bref, pendant une action en cours dans le passé.',
    accepted: [
      'The power cut happened while we were presenting the results.',
      'There was a power cut while we were presenting the results.',
      'The power went out while we were presenting the results.',
      'The power went off while we were presenting the results.',
      'The power outage happened while we were presenting the results.',
      'There was a power outage while we were presenting the results.',
      'While we were presenting the results, there was a power cut.',
      'While we were presenting the results, the power went out.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'L’action en cours (« nous présentions ») : passé continu, _we were presenting_. L’événement bref : prétérit, _the power went out_.',
  }),
];
