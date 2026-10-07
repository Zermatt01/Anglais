import { themeOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { THEME_REVIEW } from './review.ts';

const { item } = themeOf('tense-present-simple-vs-continuous', THEME_REVIEW);

export const THEME: NotionContentInput['theme'] = [
  item(1, {
    sentenceFr: 'D’habitude, je vais au bureau à vélo, mais cette semaine je prends le bus.',
    situationFr:
      'Une collègue s’étonne de te voir à l’arrêt de bus. Explique que tu viens normalement au bureau à vélo, mais que cette semaine, c’est le bus.',
    instructionEn:
      'A colleague is surprised to see you at the bus stop. Explain that the bike is your normal way to the office, but the bus is your choice for this week.',
    hint: 'Une habitude, puis une situation temporaire : deux temps différents.',
    accepted: [
      'I usually cycle to the office, but this week I’m taking the bus.',
      'Usually I cycle to the office, but this week I’m taking the bus.',
      'I usually go to the office by bike, but this week I’m taking the bus.',
      'Usually I go to the office by bike, but this week I’m taking the bus.',
      'I usually ride my bike to the office, but this week I’m taking the bus.',
      'I usually bike to the office, but this week I’m taking the bus.',
      'I usually cycle to work, but this week I’m taking the bus.',
      'I usually go to work by bike, but this week I’m taking the bus.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'L’habitude (_usually_) : présent simple, _I cycle_. Ce qui est temporaire (_this week_) : présent continu, _I’m taking the bus_.',
  }),
  item(2, {
    sentenceFr: 'Je pense que tu as raison, mais j’y réfléchis encore.',
    situationFr:
      'Ton manager propose de changer de fournisseur. Dis-lui que son idée te semble juste, mais que ta réflexion n’est pas terminée.',
    instructionEn:
      'Your manager suggests changing suppliers. Say that you find the idea right, but your reflection on it is not over yet.',
    hint: 'Une opinion, puis une réflexion en cours : le même verbe, deux sens et deux temps.',
    accepted: [
      'I think you’re right, but I’m still thinking about it.',
      'I think that you’re right, but I’m still thinking about it.',
      'I think you’re right, but I’m still thinking it over.',
      'I think you’re right, but I’m still considering it.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '_Think_ au sens d’« être d’avis » : présent simple, _I think_. Au sens de « réfléchir » en ce moment : présent continu, _I’m thinking about it_.',
  }),
  item(3, {
    sentenceFr: 'Elle parle trois langues, mais en ce moment, elle apprend le japonais.',
    situationFr:
      'Tu présentes une candidate à ton équipe. Précise qu’elle maîtrise trois langues, et que le japonais est la langue qu’elle étudie en ce moment.',
    instructionEn:
      'You are introducing a candidate to your team. Mention that three languages are part of her skills, and that Japanese is her current subject of study.',
    hint: 'Une compétence durable, puis une activité en cours en ce moment.',
    accepted: [
      'She speaks three languages, but at the moment she’s learning Japanese.',
      'She speaks three languages, but she’s learning Japanese at the moment.',
      'She speaks three languages, but she’s currently learning Japanese.',
      'She speaks three languages, but right now she’s learning Japanese.',
      'She speaks three languages, and at the moment she’s learning Japanese.',
      'She speaks three languages, and she’s learning Japanese at the moment.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une compétence durable : présent simple, _she speaks_. Une activité en cours (_at the moment_) : présent continu, _she’s learning_.',
  }),
  item(4, {
    sentenceFr: 'J’habite à Genève, mais en ce moment, je loge chez un ami à Zurich.',
    situationFr:
      'Un client veut te rencontrer à Genève cette semaine. Explique que tu habites bien à Genève, mais que ces jours-ci, un ami t’héberge à Zurich.',
    instructionEn:
      'A client wants to meet you in Geneva this week. Explain that Geneva is your home, but your bed for the next few days is at a friend’s place in Zurich.',
    hint: 'Un lieu de vie permanent, puis une situation temporaire.',
    accepted: [
      'I live in Geneva, but at the moment I’m staying with a friend in Zurich.',
      'I live in Geneva, but I’m staying with a friend in Zurich at the moment.',
      'I live in Geneva, but right now I’m staying with a friend in Zurich.',
      'I live in Geneva, but for the moment I’m staying with a friend in Zurich.',
      'I live in Geneva, but at the moment I’m staying at a friend’s place in Zurich.',
      'I live in Geneva, but at the moment I’m staying at a friend’s in Zurich.',
      'I live in Geneva, but this week I’m staying with a friend in Zurich.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Le lieu de vie permanent : présent simple, _I live_. La situation temporaire (_at the moment_) : présent continu, _I’m staying_.',
  }),
  item(5, {
    sentenceFr:
      'D’habitude, les actions montent quand les taux baissent, mais aujourd’hui, elles baissent aussi.',
    situationFr:
      'Un client s’inquiète. Rappelle-lui qu’en général, les actions montent quand les taux baissent, et explique qu’aujourd’hui, pourtant, elles sont aussi en baisse.',
    instructionEn:
      'A client is worried. Remind them of the usual link between lower rates and higher stocks, and explain that today, the stock market is down as well.',
    hint: 'Une règle générale, puis ce qui se passe aujourd’hui.',
    accepted: [
      'Stocks usually rise when rates fall, but today they’re falling too.',
      'Usually stocks rise when rates fall, but today they’re falling too.',
      'Stocks usually go up when rates go down, but today they’re going down too.',
      'Shares usually rise when rates fall, but today they’re falling too.',
      'Shares usually go up when interest rates go down, but today they’re going down too.',
      'Stocks usually rise when interest rates fall, but today they’re falling too.',
      'Stocks usually rise when rates fall, but today they’re falling as well.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'La règle générale : présent simple, _stocks rise when rates fall_. Ce qui se passe aujourd’hui : présent continu, _they’re falling_.',
  }),
  item(6, {
    sentenceFr: 'Je ne comprends pas pourquoi le serveur plante sans arrêt.',
    situationFr:
      'Le serveur de ton équipe tombe en panne toutes les heures. Dis au service informatique que la cause de ces pannes répétées t’échappe.',
    instructionEn:
      'Your team’s server crashes every hour. Tell the IT department that the reason for these repeated crashes is a mystery to you.',
    hint: '« Comprendre » est un verbe d’état ; les pannes, elles, se répètent.',
    accepted: [
      'I don’t understand why the server keeps crashing.',
      'I don’t understand why the server crashes all the time.',
      'I don’t understand why the server is always crashing.',
      'I don’t understand why the server is crashing all the time.',
      'I don’t understand why the server crashes so often.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '_Understand_ est un verbe d’état : présent simple, _I don’t understand_. Pour une panne qui se répète : _keeps crashing_, ou _crashes all the time_.',
  }),
];
