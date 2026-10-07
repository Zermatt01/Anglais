/**
 * The error categories as the learner reads them (TAX-02, docs/PEDAGOGY.md
 * §7): a short label, a short definition for the rule book, and a reviewed
 * hint that replaces the model's when it gives the correction away. The hints
 * are in French and name no English word: they can never reveal an answer.
 *
 * English words are marked with underscores (RichText).
 */
import type { ErrorCategory } from '../domain/taxonomy.ts';

export interface CategoryTexts {
  readonly label: string;
  readonly definition: string;
  readonly hint: string;
}

export const CATEGORY_TEXTS: Readonly<Record<ErrorCategory, CategoryTexts>> = {
  temps_verbaux: {
    label: 'Temps verbal',
    definition:
      'Le choix ou la forme du temps (présent, prétérit, present perfect, futur…) et les mots qui l’accompagnent : _for_, _since_, _ago_, _just_, _already_, _yet_, _still_.',
    hint: 'Vérifie le temps du verbe : quand se passe l’action, et est-elle terminée ?',
  },
  accord_sujet_verbe: {
    label: 'Accord sujet-verbe',
    definition:
      'L’accord du verbe avec son sujet (_she works_, _there are_) et celui des possessifs avec la personne à qui l’on se réfère (_his_, _her_, _their_).',
    hint: 'Vérifie l’accord : qui fait l’action, et combien sont-ils ?',
  },
  auxiliaires_questions_negations: {
    label: 'Auxiliaire, question ou négation',
    definition:
      'Les questions et les négations avec _do_, _be_, _have_ et les modaux, et la forme du verbe qui les suit (_didn’t go_, _can come_).',
    hint: 'Vérifie l’auxiliaire et la forme du verbe qui le suit.',
  },
  articles: {
    label: 'Article ou déterminant',
    definition:
      '_A_, _an_, _the_ ou aucun article, et les autres déterminants (_some_, _any_, _each_, _both_…).',
    hint: 'Vérifie le petit mot devant le nom : en faut-il un, et lequel ?',
  },
  indenombrables_pluriels: {
    label: 'Indénombrable ou pluriel',
    definition:
      'Les noms qui ne se comptent pas en anglais (_advice_, _information_), les quantités (_much_, _many_, _few_) et les pluriels.',
    hint: 'Ce nom se compte-t-il en anglais ? Vérifie le nombre et la quantité.',
  },
  prepositions: {
    label: 'Préposition',
    definition:
      'Le choix de la préposition (_depend on_, _in_, _on_, _at_) et la particule des _phrasal verbs_ (_pick up_).',
    hint: 'Vérifie la préposition : est-ce celle qu’attend ce mot ?',
  },
  ordre_des_mots: {
    label: 'Ordre des mots',
    definition:
      'La place des mots : adverbes, adjectifs, questions indirectes, complément d’un _phrasal verb_.',
    hint: 'Vérifie la place des mots dans la phrase.',
  },
  faux_amis: {
    label: 'Faux ami',
    definition:
      'Un mot anglais employé au sens d’un mot français qui lui ressemble : _actually_ ne veut pas dire « actuellement ».',
    hint: 'Un mot ressemble au français, mais n’a pas ce sens en anglais.',
  },
  calques_du_francais: {
    label: 'Calque du français',
    definition:
      'Une tournure française traduite mot à mot, qui ne fonctionne pas en anglais : _I am agree_, _I have 25 years_.',
    hint: 'Cette tournure est traduite mot à mot du français : comment le dit-on en anglais ?',
  },
  choix_lexical_collocations: {
    label: 'Choix du mot',
    definition:
      'Un mot qui ne convient pas dans ce contexte ou avec son voisin (_make_ ou _do_, _say_ ou _tell_), ou la forme qu’un mot impose à la suite (_look forward to hearing_).',
    hint: 'Un mot ne convient pas ici : cherche celui qui va avec ce contexte.',
  },
  registre_ton: {
    label: 'Registre',
    definition:
      'Une formulation correcte ailleurs, mais trop familière, trop directe ou trop sèche pour ce destinataire.',
    hint: 'Pense au destinataire : la formulation convient-elle à la situation ?',
  },
  connecteurs_structure: {
    label: 'Connecteur ou structure',
    definition:
      'Les liens logiques (_however_, _although_, _despite_), les pronoms relatifs (_who_, _which_, _that_) et l’organisation du texte.',
    hint: 'Vérifie le lien entre les idées et la construction qui le suit.',
  },
  orthographe: {
    label: 'Orthographe',
    definition:
      'L’écriture des mots : fautes de frappe, majuscules obligatoires (_Monday_, _I_), homophones (_its_ ou _it’s_).',
    hint: 'Vérifie l’écriture d’un mot.',
  },
  ponctuation: {
    label: 'Ponctuation',
    definition:
      'La ponctuation à l’anglaise : pas d’espace avant un point d’interrogation, une virgule après un connecteur en tête de phrase.',
    hint: 'Vérifie la ponctuation.',
  },
  prononciation: {
    label: 'Prononciation',
    definition:
      'Les sons difficiles pour un francophone : _th_, le _h_ aspiré, les voyelles longues et courtes, les terminaisons.',
    hint: 'Écoute bien les sons de ce mot.',
  },
};

/** Reviewed hint of a category, used when the model's hint would give the correction away. */
export function fallbackHintOf(category: ErrorCategory): string {
  return CATEGORY_TEXTS[category].hint;
}
