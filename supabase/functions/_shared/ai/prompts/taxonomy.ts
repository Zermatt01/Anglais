// Generated from shared/ai/prompts/taxonomy.ts by `npm run sync:shared`: do not edit (D-061).
/**
 * The error taxonomy and the notions, as the correction prompt describes them
 * to the model (AI-03). They restate docs/PEDAGOGY.md §7 and §11 in English;
 * PEDAGOGY remains the reference. Read by the Edge Function only (D-017).
 */
import type { ContractErrorCategory, ContractNotionId } from '../curriculum.ts';

/** Definition and boundaries of each category (PEDAGOGY §7.2). */
export const CATEGORY_DEFINITIONS: Readonly<Record<ContractErrorCategory, string>> = {
  temps_verbaux:
    'Choice or form of tense and aspect: present simple or continuous, past simple, present perfect (simple and continuous), past perfect, future forms, past forms of irregular verbs. By convention also the time markers for, since, ago, just, already, yet and still (their choice and their position), used to, have got, and the tense after wish or in an if-sentence. Boundaries: the third-person -s is accord_sujet_verbe; do/does/did in questions and negatives is auxiliaires_questions_negations.',
  accord_sujet_verbe:
    'Agreement in person and number between the subject and the verb: third-person -s, is/are, was/were, has/have, collective or indefinite subjects. Also the agreement of pronouns and possessives with what they refer to (his/her/its/their agree with the possessor, not with the thing possessed). Boundaries: a verb that agrees but is in the wrong tense is temps_verbaux; an error inside a form built with an auxiliary (Does she works?) is auxiliaires_questions_negations.',
  auxiliaires_questions_negations:
    'Questions, negatives, short answers and question tags with do/does/did, be, have and the modals; the form of the verb after an auxiliary or a modal (I didn’t went, He can to come); the meaning of a modal (obligation, possibility, advice). Boundaries: subject-verb order in an indirect question is ordre_des_mots; a correct modal that is too direct for the reader is registre_ton.',
  articles:
    'Presence, absence or choice of a/an/the and of the zero article, the form a/an according to the next sound, and the other determiners: some/any/no and their compounds, each/every/all, both/either/neither, demonstratives. Boundaries: an article that is wrong because the noun is uncountable (an advice) is indenombrables_pluriels; quantifiers such as much/many and few/little are indenombrables_pluriels.',
  indenombrables_pluriels:
    'Number in the noun phrase: uncountable nouns made plural or used with a/an (informations, advices, feedbacks, researches, equipments), quantifiers (much/many, few/little, less/fewer), adjectives wrongly made plural (differents options), compound nouns with or without a number (a three-years plan), irregular plurals. Boundary: a countable noun whose only problem is the article is articles.',
  prepositions:
    'Choice, presence or absence of a preposition, after a verb (depend on), a noun or an adjective, prepositions of time and place (in/on/at), and the particle of a phrasal verb (pick me up). It applies even when the error comes from French, as long as the preposition alone is wrong (discuss about the results, explain me the model). Boundaries: for/since/ago are temps_verbaux; a wrong verb is choix_lexical_collocations; the position of the object of a phrasal verb is ordre_des_mots; a whole transposed structure is calques_du_francais.',
  ordre_des_mots:
    'Position of words and groups: adjective before the noun, frequency adverbs (before the main verb, after be), no adverb between the verb and its object (I like very much this job), subject-verb order in indirect questions (where the office is), position of enough and also, position of the object of a phrasal verb (put it off). Boundary: the position of just, already, yet and still is temps_verbaux.',
  faux_amis:
    'A single English word, which exists, used with the meaning of a French word of similar form: actually for “actuellement”, eventually for “éventuellement”, library for “librairie”, sensible for “sensible”, assist a meeting for “assister à”, demand for “demander”, formation for “formation”, control for “contrôler”, to precise. Boundaries: a word with the right meaning that does not go with its neighbour is choix_lexical_collocations; a structure of several words is calques_du_francais.',
  calques_du_francais:
    'A structure or expression of several words transposed literally from French that becomes ungrammatical in English, or that changes or blurs the meaning: I am agree, I have 25 years, It’s been three years that I work here, We are Monday today, It has many banks in Zurich (for “il y a”). A grammatical and understandable transposition that is merely unidiomatic is not an error: it is an unnatural phrase. Boundaries: one misleading word is faux_amis; a well-built combination with one wrong word is choix_lexical_collocations; a single preposition is prepositions.',
  choix_lexical_collocations:
    'An existing word of close meaning that the combination or the context makes incorrect: a native speaker would call it wrong, not just unusual (otherwise it is an unnatural phrase). Also the confused pairs (make/do, say/tell, rise/raise, lend/borrow, win/earn), non-existent words, constructions governed by a word (verb or adjective + -ing or to, preposition + -ing, purpose expressed with to: I look forward to hearing, I came to learn), and the choice between related forms of one word: adjective or adverb (good/well, bored/boring), comparative and superlative (more better).',
  registre_ton:
    'A phrase that is correct and natural in another context, but unsuited to the reader or the situation (professional e-mail, job interview): too familiar, too direct, too curt or too pompous. Examples: Hi guys to a recruiter; I want a meeting to a client; Send me the file. to a manager; wanna. Register always depends on the context: a phrase that is natural in no context belongs to another category, or is an unnatural phrase.',
  connecteurs_structure:
    'Logical links and organisation of the text: choice and construction of connectors (however, therefore, although + clause, despite + noun), relative pronouns (who/which/that/whose; what wrongly used as a relative: the report what I sent), run-on or disjointed sentences, paragraphs and structure of an e-mail. Boundary: a problem of punctuation only is ponctuation.',
  orthographe:
    'Spelling of an existing word: typing errors, compulsory capitals (days, months, languages, nationalities, I), homophones (its/it’s, your/you’re, their/there), the apostrophe of the genitive (the company’s results). Boundary: a wrong verb form or a wrong plural belongs to the grammatical category.',
  ponctuation:
    'Punctuation and English typography: no space before ? ! : ;, English quotation marks, a comma after a connector at the start of a sentence, no comma before a defining relative clause, two independent clauses joined by a mere comma (comma splice).',
  prononciation: 'Reserved for the oral modules. Never use it for a written text.',
};

/** Rules to classify an error once it is certain (PEDAGOGY §7.4), in order. */
export const TIE_BREAK_RULES: readonly string[] = [
  'One error is one minimal segment: two independent problems in a sentence are two errors.',
  'for, since, ago, just, already, yet and still (their choice and their position) are temps_verbaux.',
  'The form of a verb that completes another (-ing, to + base form, base form) after a verb, an adjective or a preposition, purpose included (for learn → to learn), is choix_lexical_collocations.',
  'A single preposition, or the particle of a phrasal verb, is prepositions.',
  'A single word misleading by its resemblance to French is faux_amis; a single wrongly combined word is choix_lexical_collocations; a transposed structure of several words is calques_du_francais.',
  'Correct in another context is registre_ton; correct everywhere but unidiomatic is an unnatural phrase, not an error.',
  'The form of a word: a verb is temps_verbaux, accord_sujet_verbe or auxiliaires_questions_negations; a noun is indenombrables_pluriels; an adjective or an adverb (form, comparative, superlative) is choix_lexical_collocations; a pronoun or a possessive is accord_sujet_verbe; the spelling only is orthographe.',
  'In doubt between two categories, choose the more specific one and lower the confidence.',
];

/**
 * What each notion's lesson teaches: an error takes the identifier of the
 * notion whose lesson teaches its correction.
 */
export const NOTION_DESCRIPTIONS: Readonly<Record<ContractNotionId, string>> = {
  'tense-present-continuous':
    'present continuous: actions in progress now, temporary situations, changing trends',
  'tense-present-simple':
    'present simple: habits, permanent facts, general truths, state verbs, third-person -s',
  'tense-present-simple-vs-continuous': 'choice between the present simple and the continuous',
  'tense-have-got': 'have and have got',
  'tense-past-simple': 'past simple of regular and common irregular verbs',
  'tense-past-continuous': 'past continuous (was/were + -ing), with when and while',
  'tense-present-perfect':
    'present perfect for experience and present results, irregular past participles',
  'tense-just-already-yet-still': 'just, already, yet and still: meaning and position',
  'tense-for-since-ago':
    'for, since and ago; the present perfect for a situation that continues up to now (French “depuis”)',
  'tense-present-perfect-vs-past-simple': 'choice between the present perfect and the past simple',
  'tense-used-to': 'used to and be used to',
  'tense-future':
    'will, going to, the present continuous for arrangements, the present after when, if, as soon as',
  'tense-present-perfect-continuous': 'present perfect continuous',
  'tense-past-perfect': 'past perfect',
  'tense-future-continuous-perfect': 'future continuous and future perfect',
  'tense-review':
    'mixed review of the tenses: never cite it for an error, cite the specific tense notion',
  'verbs-passive': 'passive voice',
  'verbs-modals': 'modals (can, could, might, must, should, have to…): form and meaning',
  'verbs-polite-requests': 'polite requests and offers (Could you…? Would you like…? I’d like…)',
  'verbs-say-tell': 'say or tell',
  'verbs-reported-speech': 'reported speech',
  'questions-do-negations': 'questions and negatives with do, does and did',
  'questions-there-is-it': 'there is / there are, and it (French “il y a”)',
  'questions-short-answers-tags': 'short answers, so and neither, question tags',
  'questions-indirect': 'indirect questions (Can you tell me where the office is?)',
  'patterns-ing-or-to': 'verb + -ing or to + infinitive (look forward to hearing, suggest that…)',
  'patterns-purpose': 'expressing purpose (to, in order to, so that)',
  'patterns-make-do': 'make or do',
  'nouns-pronouns-possessives': 'pronouns and possessives (I/me, my/mine, myself, -’s)',
  'nouns-articles': 'articles (a/an, the, zero article)',
  'nouns-countable-uncountable': 'countable and uncountable nouns, plurals, compound nouns',
  'nouns-some-any-no': 'some, any, no and their compounds',
  'nouns-all-both-each': 'all, every, each, both, either, neither',
  'nouns-quantity': 'much, many, a lot, few, little',
  'adj-adjectives-adverbs': 'adjectives and adverbs (quick/quickly, good/well, bored/boring)',
  'adj-comparison': 'comparatives and superlatives',
  'adj-too-enough-so-such': 'too, enough, so, such, quite, rather',
  'adj-word-order': 'word order (adverbs, adjectives, enough, also)',
  'prep-time': 'prepositions of time (in, on, at, during…)',
  'prep-place-movement': 'prepositions of place and movement',
  'prep-dependent': 'prepositions after a noun, an adjective or a verb (depend on, married to)',
  'prep-phrasal-verbs-basics': 'phrasal verbs: meaning and construction',
  'prep-phrasal-verbs-common': 'common phrasal verbs',
  'clauses-connectors': 'connectors (because, although, unless, in case, despite…)',
  'clauses-conditionals': 'conditional sentences with if',
  'clauses-relative': 'relative clauses (who, which, that, whose)',
  'clauses-wish': 'wish',
  'vocab-rise-raise': 'rise or raise',
  'vocab-lend-borrow': 'lend or borrow',
  'vocab-false-friends': 'professional false friends (actually, eventually, assist, formation…)',
};
