import { exercisesOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { REVIEW } from './review.ts';

const { choice, fill, transform, place, translate } = exercisesOf(
  'tense-just-already-yet-still',
  REVIEW,
);

const JUST = 'Action qui vient tout juste de se produire';
const ALREADY = 'Action déjà faite, souvent plus tôt que prévu';
const YET = 'Action attendue, pas encore faite (négation ou question)';
const STILL = 'Situation qui continue encore maintenant';
const STILL_NOT = 'Retard ou impatience : toujours pas';

/** Accepted American usage (D-035): the past simple with just, already or yet. */
const AMERICAN_PAST =
  ' En anglais américain courant, le prétérit est aussi accepté (_I just…_, _Did you… yet?_).';

export const EXERCISES: NotionContentInput['exercises'] = [
  // Step 2: recognize
  choice(1, {
    sentence: 'I haven’t received the results ___.',
    options: ['yet', 'already', 'just'],
    answer: 'yet',
    reasons: [YET, ALREADY, JUST],
    reason: YET,
    explanation: 'Négation, action attendue : _yet_, en fin de phrase.',
  }),
  choice(2, {
    sentence: 'Don’t worry, I’ve ___ sent the email — it left a minute ago.',
    options: ['just', 'yet', 'still'],
    answer: 'just',
    reasons: [JUST, YET, STILL],
    reason: JUST,
    explanation:
      '_A minute ago_ : c’est tout récent. _Just_ se place entre _have_ et le participe.',
  }),
  choice(3, {
    sentence: 'The client has ___ paid, two weeks before the deadline.',
    options: ['already', 'yet', 'still'],
    answer: 'already',
    reasons: [ALREADY, YET, STILL],
    reason: ALREADY,
    explanation: 'Payé plus tôt que prévu : _already_, entre _has_ et le participe.',
  }),
  choice(4, {
    sentence: 'I ___ haven’t heard from the bank, and it’s been three weeks.',
    options: ['still', 'already', 'ever'],
    answer: 'still',
    reasons: [STILL_NOT, YET, ALREADY],
    reason: STILL_NOT,
    explanation:
      'Trois semaines d’attente : impatience. _Still_ se place avant l’auxiliaire négatif.',
  }),
  choice(5, {
    sentence: 'He started the job in 2015, and he ___ works there.',
    options: ['still', 'yet', 'already'],
    answer: 'still',
    reasons: [STILL, ALREADY, YET],
    reason: STILL,
    explanation: 'La situation a commencé en 2015 et continue : _still_, avant le verbe.',
  }),
  choice(6, {
    sentence: 'Have you booked the flights ___?',
    options: ['yet', 'still', 'just'],
    answer: 'yet',
    reasons: [YET, STILL, JUST],
    reason: YET,
    explanation: 'Question sur une action attendue : _yet_, en fin de phrase.',
  }),
  choice(7, {
    sentence: 'We’ve ___ finished the migration: the new system went live five minutes ago.',
    options: ['just', 'yet', 'still'],
    answer: 'just',
    reasons: [JUST, YET, STILL],
    reason: JUST,
    explanation: '_Five minutes ago_ : action toute récente, _just_.',
  }),
  choice(8, {
    sentence: 'The meeting ___ hasn’t started, and we’ve been waiting for twenty minutes.',
    options: ['still', 'yet', 'already'],
    answer: 'still',
    reasons: [STILL_NOT, YET, ALREADY],
    reason: STILL_NOT,
    explanation: 'Vingt minutes d’attente : _still hasn’t started_ (toujours pas).',
  }),
  choice(9, {
    sentence: 'I’ve ___ read this report, so I don’t need a copy.',
    options: ['already', 'yet', 'still'],
    answer: 'already',
    reasons: [ALREADY, YET, STILL],
    reason: ALREADY,
    explanation: 'C’est déjà fait : _already_, entre _have_ et le participe.',
  }),
  choice(10, {
    sentence: 'She hasn’t replied to my email ___.',
    options: ['yet', 'already', 'just'],
    answer: 'yet',
    reasons: [YET, ALREADY, JUST],
    reason: YET,
    explanation: 'Négation, réponse attendue : _yet_ en fin de phrase.',
  }),
  choice(11, {
    sentence: 'Prices are ___ rising, even after the rate increase.',
    options: ['still', 'yet'],
    answer: 'still',
    reasons: [STILL, YET],
    reason: STILL,
    explanation: 'La hausse continue malgré tout : _still_, après _be_.',
  }),
  choice(12, {
    sentence: 'I’m sorry, I’ve ___ missed the train, so I’ll be twenty minutes late.',
    options: ['just', 'yet', 'still'],
    answer: 'just',
    reasons: [JUST, YET, STILL],
    reason: JUST,
    explanation: 'Le train vient de partir : _I’ve just missed_.',
  }),

  // Step 3: practise
  place(1, {
    sentence: 'I have received the results.',
    word: 'just',
    meaningFr: 'Je viens de recevoir les résultats.',
    accepted: ['I have just received the results.'],
    knownErrors: ['I just have received the results.'],
    explanation: '_Just_ se place entre _have_ et le participe passé.' + AMERICAN_PAST,
  }),
  place(2, {
    sentence: 'She hasn’t called back.',
    word: 'yet',
    meaningFr: 'Elle n’a pas encore rappelé.',
    accepted: ['She hasn’t called back yet.', 'She hasn’t yet called back.'],
    explanation:
      '_Yet_ se place en fin de phrase ; en style soutenu, on le trouve aussi juste après _hasn’t_.',
  }),
  place(3, {
    sentence: 'We have paid the supplier.',
    word: 'already',
    meaningFr: 'Nous avons déjà payé le fournisseur.',
    accepted: ['We have already paid the supplier.', 'We have paid the supplier already.'],
    explanation:
      '_Already_ se place entre _have_ et le participe ; en fin de phrase, c’est aussi correct.',
  }),
  place(4, {
    sentence: 'He works for the same bank.',
    word: 'still',
    meaningFr: 'Il travaille encore pour la même banque.',
    accepted: ['He still works for the same bank.'],
    knownErrors: ['He works still for the same bank.'],
    explanation: '_Still_ se place avant le verbe principal.',
  }),
  place(5, {
    sentence: 'I haven’t found a solution.',
    word: 'still',
    meaningFr: 'Je n’ai toujours pas trouvé de solution.',
    accepted: ['I still haven’t found a solution.'],
    knownErrors: ['I haven’t still found a solution.'],
    explanation: 'Avec une négation, _still_ se place avant l’auxiliaire : _I still haven’t_.',
  }),
  place(6, {
    sentence: 'Is she in the meeting?',
    word: 'still',
    meaningFr: 'Est-ce qu’elle est encore en réunion ?',
    accepted: ['Is she still in the meeting?'],
    knownErrors: ['Is still she in the meeting?'],
    explanation: 'Dans une question avec _be_, _still_ se place après le sujet.',
  }),
  fill(7, {
    sentence: 'I’ve just ___ the file to the client.',
    verb: 'send',
    meaningFr: 'Je viens d’envoyer le fichier au client.',
    accepted: ['sent'],
    knownErrors: ['send', 'sended'],
    explanation: '_Have just_ + participe passé : _sent_.',
  }),
  fill(8, {
    sentence: 'Has the parcel ___ yet?',
    verb: 'arrive',
    meaningFr: 'Est-ce que le colis est déjà arrivé ?',
    accepted: ['arrived'],
    knownErrors: ['arrive', 'arriving'],
    explanation: 'Question au present perfect avec _yet_ : _Has… arrived yet?_',
  }),
  fill(9, {
    sentence: 'They still ___ the offer.',
    verb: 'accept (present perfect, à la forme négative)',
    meaningFr: 'Ils n’ont toujours pas accepté l’offre.',
    accepted: ['haven’t accepted'],
    knownErrors: ['didn’t accepted', 'haven’t accept'],
    explanation: '_Still_ + négation au present perfect : _still haven’t accepted_.',
  }),
  fill(10, {
    sentence: 'She has already ___ the contract.',
    verb: 'sign',
    meaningFr: 'Elle a déjà signé le contrat.',
    accepted: ['signed'],
    knownErrors: ['sign', 'signing'],
    explanation: '_Has already_ + participe passé : _signed_.',
  }),
  transform(11, {
    source: 'I have finished the report.',
    instructionFr: 'Mets la phrase à la forme négative, avec « yet ».',
    accepted: ['I haven’t finished the report yet.', 'I haven’t yet finished the report.'],
    knownErrors: ['I haven’t finished yet the report.', 'I have finished the report yet.'],
    explanation:
      '_Yet_ se place en fin de phrase (ou, en style soutenu, après _haven’t_), jamais entre le verbe et son complément.',
  }),
  transform(12, {
    source: 'Have you called the client?',
    instructionFr: 'Ajoute « yet » à la bonne place.',
    accepted: ['Have you called the client yet?'],
    knownErrors: ['Have you called yet the client?'],
    explanation: 'Dans une question, _yet_ se place en fin de phrase.',
  }),

  // Step 4: translate
  translate(1, {
    sentenceFr: 'Je viens de recevoir ton message.',
    hint: '« Venir de » + infinitif : une action toute récente.',
    difficulty: 1,
    accepted: [
      'I’ve just received your message.',
      'I’ve just got your message.',
      'I just received your message.',
      'I just got your message.',
    ],
    knownErrors: ['I just have received your message.', 'I come from receiving your message.'],
    explanation: '« Je viens de » se dit _I’ve just_ + participe passé.' + AMERICAN_PAST,
  }),
  translate(2, {
    sentenceFr: 'Je n’ai pas encore fini.',
    hint: '« Pas encore » : une négation, et le mot se place en fin de phrase.',
    difficulty: 1,
    accepted: [
      'I haven’t finished yet.',
      'I haven’t yet finished.',
      'I’m not finished yet.',
      'I’m not done yet.',
      'I didn’t finish yet.',
    ],
    knownErrors: [
      'I have not finished already.',
      'I have finished already not.',
      'I haven’t already finished.',
    ],
    explanation: '« Pas encore » : _not… yet_. _I haven’t finished yet._' + AMERICAN_PAST,
  }),
  translate(3, {
    sentenceFr: 'Est-ce qu’elle travaille encore ici ?',
    hint: 'La situation continue-t-elle maintenant ?',
    difficulty: 1,
    accepted: ['Does she still work here?', 'Is she still working here?'],
    knownErrors: ['Does she work still here?', 'Does she yet work here?'],
    explanation:
      '« Encore », au sens de « toujours maintenant » : _still_, avant le verbe principal.',
  }),
  translate(4, {
    sentenceFr: 'Le client a déjà payé.',
    hint: 'Une action faite plus tôt que prévu.',
    difficulty: 1,
    accepted: [
      'The client has already paid.',
      'The customer has already paid.',
      'The client has paid already.',
      'The customer has paid already.',
      'The client already paid.',
      'The customer already paid.',
    ],
    knownErrors: ['The client has paid yet.', 'The client has yet paid.'],
    explanation: '_Already_ entre _has_ et le participe : _has already paid_.' + AMERICAN_PAST,
  }),
  translate(5, {
    sentenceFr: 'Est-ce que tu as déjà envoyé la facture ?',
    hint: 'Une question sur une action attendue.',
    difficulty: 2,
    accepted: [
      'Have you sent the invoice yet?',
      'Have you already sent the invoice?',
      'Have you sent the invoice already?',
      'Did you send the invoice yet?',
      'Did you already send the invoice?',
      'Have you sent the bill yet?',
    ],
    knownErrors: ['Have you sent yet the invoice?'],
    explanation:
      'Question neutre sur une action attendue : _yet_ en fin de phrase. _Already_ marque la surprise que ce soit déjà fait.' +
      AMERICAN_PAST,
  }),
  translate(6, {
    sentenceFr: 'Nous attendons toujours la réponse de la banque.',
    hint: 'La situation continue maintenant.',
    difficulty: 2,
    accepted: [
      'We’re still waiting for the bank’s answer.',
      'We’re still waiting for the bank’s reply.',
      'We’re still waiting for the bank’s response.',
      'We’re still waiting for an answer from the bank.',
      'We’re still waiting for a reply from the bank.',
      'We’re still waiting for a response from the bank.',
      'We’re still waiting to hear from the bank.',
    ],
    knownErrors: ['We’re yet waiting for the bank’s answer.'],
    explanation: '« Toujours », au sens de « encore maintenant » : _still_, après _be_.',
  }),
  translate(7, {
    sentenceFr: 'Il n’a toujours pas appelé.',
    hint: 'Impatience : l’appel aurait dû avoir lieu.',
    difficulty: 2,
    accepted: [
      'He still hasn’t called.',
      'He still hasn’t phoned.',
      'He has still not called.',
      'He still didn’t call.',
      'He hasn’t called yet.',
    ],
    knownErrors: ['He hasn’t still called.'],
    explanation:
      '« Toujours pas » : _still_ avant _hasn’t_. _He hasn’t called yet_ (pas encore) est aussi juste, sur un ton plus neutre.',
  }),
  translate(8, {
    sentenceFr: 'Je viens juste d’arriver au bureau.',
    hint: 'Une action toute récente.',
    difficulty: 2,
    accepted: [
      'I’ve just arrived at the office.',
      'I’ve just got to the office.',
      'I’ve just gotten to the office.',
      'I just arrived at the office.',
      'I just got to the office.',
    ],
    knownErrors: ['I just have arrived at the office.', 'I’ve just arrived to the office.'],
    explanation:
      '_I’ve just arrived_. On arrive _at_ un lieu précis (et _in_ une ville), jamais _to_.' +
      AMERICAN_PAST,
  }),
  translate(9, {
    sentenceFr: 'La réunion n’a pas encore commencé, mais le directeur est déjà là.',
    hint: '« Pas encore », puis « déjà ».',
    difficulty: 3,
    accepted: [
      'The meeting hasn’t started yet, but the director is already here.',
      'The meeting hasn’t started yet, but the manager is already here.',
      'The meeting hasn’t started yet, but the director is already there.',
      'The meeting hasn’t started yet, but the director has already arrived.',
      'The meeting hasn’t started yet, but the manager has already arrived.',
      'The meeting hasn’t yet started, but the director is already here.',
      'The meeting hasn’t started yet but the director is already here.',
      'The meeting didn’t start yet, but the director is already here.',
      'The meeting didn’t start yet, but the manager is already here.',
    ],
    knownErrors: ['The meeting hasn’t started already, but the director is already here.'],
    explanation: '_Hasn’t started yet_ (pas encore), _is already here_ (déjà).' + AMERICAN_PAST,
  }),
  translate(10, {
    sentenceFr: 'Nous n’avons toujours pas reçu les chiffres, alors que tu les as déjà envoyés.',
    hint: '« Toujours pas », puis « déjà ».',
    difficulty: 3,
    accepted: [
      'We still haven’t received the figures, although you’ve already sent them.',
      'We still haven’t received the figures, even though you’ve already sent them.',
      'We still haven’t received the figures, but you’ve already sent them.',
      'We still haven’t received the figures, though you’ve already sent them.',
      'We still haven’t received the numbers, although you’ve already sent them.',
      'We still haven’t got the figures, although you’ve already sent them.',
      'We have still not received the figures, although you’ve already sent them.',
      'We still haven’t received the figures, although you already sent them.',
      'We still haven’t received the figures, even though you already sent them.',
    ],
    knownErrors: ['We haven’t still received the figures, although you’ve already sent them.'],
    explanation:
      '_Still haven’t received_ (toujours pas), _have already sent_ (déjà).' + AMERICAN_PAST,
  }),
  translate(11, {
    sentenceFr: 'Est-ce que les résultats sont déjà sortis ? — Non, pas encore.',
    hint: 'Une question sur une action attendue, puis une réponse courte.',
    difficulty: 3,
    accepted: [
      'Have the results come out yet? — No, not yet.',
      'Are the results out yet? — No, not yet.',
      'Have the results been published yet? — No, not yet.',
      'Have the results been released yet? — No, not yet.',
      'Are the results out already? — No, not yet.',
      'Have the results already come out? — No, not yet.',
      'Did the results come out yet? — No, not yet.',
      'Did the results already come out? — No, not yet.',
    ],
    knownErrors: ['Have the results come out yet? — No, not already.'],
    explanation:
      'Question avec _yet_ en fin de phrase ; « pas encore » se dit _not yet_.' + AMERICAN_PAST,
  }),
];
