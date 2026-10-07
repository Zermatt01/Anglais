import { themeOf } from '../../builders.ts';
import type { NotionContentInput } from '../../schema.ts';
import { THEME_REVIEW } from './review.ts';

// When the order of the actions is clear, the past simple is often right too (D-035).
const { item } = themeOf('tense-past-perfect', THEME_REVIEW);

export const THEME: NotionContentInput['theme'] = [
  item(1, {
    sentenceFr: 'À mon arrivée, la réunion avait déjà commencé.',
    situationFr:
      'Ton manager te demande pourquoi tu as manqué l’introduction. Explique que la réunion était lancée avant que tu arrives.',
    instructionEn:
      'Your manager asks why you missed the introduction. Explain that the meeting was under way before your arrival.',
    hint: 'Une action antérieure à un autre moment du passé.',
    accepted: [
      'When I arrived, the meeting had already started.',
      'When I arrived, the meeting had already begun.',
      'The meeting had already started when I arrived.',
      'The meeting had already begun when I arrived.',
      'By the time I arrived, the meeting had already started.',
      'When I got there, the meeting had already started.',
      'When I arrived, the meeting had started.',
    ],
    knownErrors: [
      'When I arrived, the meeting has already started.',
      'The meeting has already started when I arrived.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une action antérieure à un autre moment passé (ton arrivée) : past perfect, _had already started_.',
  }),
  item(2, {
    sentenceFr: 'Avant ce voyage, je n’avais jamais vu autant de neige.',
    situationFr:
      'Tu racontes ton voyage au Canada l’hiver dernier. Explique que jusque-là, tu n’avais jamais vu une telle quantité de neige.',
    instructionEn:
      'You are describing your trip to Canada last winter. Explain that, until that trip, such quantities of snow were completely new to you.',
    hint: 'Une expérience jusqu’à un moment du passé, à la forme négative.',
    accepted: [
      'Before that trip, I had never seen so much snow.',
      'Before this trip, I had never seen so much snow.',
      'I had never seen so much snow before that trip.',
      'I’d never seen so much snow before that trip.',
      'Before that trip, I’d never seen so much snow.',
      'Until that trip, I had never seen so much snow.',
    ],
    knownErrors: [
      'Before that trip, I have never seen so much snow.',
      'I have never seen so much snow before that trip.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Une expérience jusqu’à un moment passé (ce voyage) : past perfect, _I had never seen_. Le present perfect irait jusqu’à aujourd’hui.',
  }),
  item(3, {
    sentenceFr: 'Elle m’a dit qu’elle avait envoyé le contrat.',
    situationFr:
      'Ton manager s’inquiète pour le contrat. Rapporte ce que ta collègue t’a affirmé plus tôt : l’envoi était fait.',
    instructionEn:
      'Your manager is worried about the contract. Report what your colleague told you earlier: the contract was already on its way.',
    hint: 'Une parole rapportée sur une action antérieure.',
    accepted: [
      'She told me she had sent the contract.',
      'She told me that she had sent the contract.',
      'She said she had sent the contract.',
      'She said that she had sent the contract.',
      'She told me she had already sent the contract.',
      'She told me she sent the contract.',
      'She said she sent the contract.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Au discours indirect, une action antérieure passe au past perfect : _She told me she had sent it_.',
  }),
  item(4, {
    sentenceFr: 'Le directeur a changé d’avis parce qu’il avait lu le rapport.',
    situationFr:
      'On te demande pourquoi le directeur a changé d’avis sur le projet. Explique la cause : il avait lu le rapport juste avant sa décision.',
    instructionEn:
      'Someone asks why the director changed his mind about the project. Explain the cause: his reading of the report shortly before his decision.',
    hint: 'Une action antérieure, qui explique une autre action passée.',
    accepted: [
      'The director changed his mind because he had read the report.',
      'The director changed his mind because he’d read the report.',
      'The director changed his mind because he had just read the report.',
      'He changed his mind because he had read the report.',
      'He changed his mind because he had just read the report.',
      'The director changed his mind because he read the report.',
    ],
    knownErrors: [
      'The director changed his mind because he has read the report.',
      'He changed his mind because he has read the report.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'L’action la plus ancienne, qui explique l’autre : past perfect, _because he had read the report_.',
  }),
  item(5, {
    sentenceFr: 'Quand le client a rappelé, nous avions déjà fermé le dossier.',
    situationFr:
      'Explique à ta responsable pourquoi la demande du client n’a pas été traitée : son nouvel appel est arrivé après la clôture du dossier.',
    instructionEn:
      'Explain to your manager why the client’s request was not handled: his second call came after the file was closed.',
    hint: 'Une action terminée avant un autre moment du passé.',
    accepted: [
      'When the client called back, we had already closed the file.',
      'When the client called back, we had already closed the case.',
      'By the time the client called back, we had already closed the file.',
      'We had already closed the file when the client called back.',
      'When the customer called back, we had already closed the file.',
      'When the client rang back, we had already closed the file.',
      'When the client called back, we had closed the file.',
    ],
    knownErrors: [
      'When the client called back, we have already closed the file.',
      'We have already closed the file when the client called back.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      'Le dossier était fermé avant l’appel : past perfect, _we had already closed the file_.',
  }),
  item(6, {
    sentenceFr: 'C’était la première fois que je parlais devant autant de monde.',
    situationFr:
      'Tu racontes ta première conférence à un ami. Explique qu’avant ce jour-là, tu n’avais jamais pris la parole devant une si grande salle.',
    instructionEn:
      'You tell a friend about your first conference. Explain that, before that day, speaking to such a big audience was something new for you. Start with “It was the first time”.',
    hint: 'Après « c’était la première fois que », l’anglais relie l’expérience à ce moment passé.',
    accepted: [
      'It was the first time I had spoken in front of so many people.',
      'It was the first time I’d spoken in front of so many people.',
      'It was the first time that I had spoken in front of so many people.',
      'It was the first time I had spoken to so many people.',
      'It was the first time I had spoken in front of such a big audience.',
      'That was the first time I had spoken in front of so many people.',
    ],
    knownErrors: [
      'It was the first time I have spoken in front of so many people.',
      'It was the first time I have spoken to so many people.',
    ],
    knownErrorCategory: 'temps_verbaux',
    explanation:
      '_It was the first time_ est suivi du past perfect : _It was the first time I had spoken…_, là où le français met l’imparfait.',
  }),
];
