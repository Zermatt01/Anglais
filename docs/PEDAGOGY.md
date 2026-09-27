# Pédagogie

Ce document traduit les principes pédagogiques de [SPEC.md](SPEC.md) (PED, CUR, CARD, TAX) en règles précises et implémentables. Les valeurs chiffrées sont des **valeurs par défaut** : elles vivront dans des constantes nommées du domaine (`src/domain/…`) et pourront être ajustées sans toucher à la logique. Tout changement de valeur par défaut est consigné dans [DECISIONS.md](DECISIONS.md).

## Sommaire

1. [Cadre théorique et conséquences](#1-cadre-théorique-et-conséquences)
2. [Les quatre volets de Nation dans l'application](#2-les-quatre-volets-de-nation-dans-lapplication)
3. [Progression d'une notion en cinq étapes](#3-progression-dune-notion-en-cinq-étapes)
4. [Lapsus ou lacune](#4-lapsus-ou-lacune)
5. [Feedback correctif et pratique immédiate](#5-feedback-correctif-et-pratique-immédiate)
6. [Révisions, entrelacement et calibrage](#6-révisions-entrelacement-et-calibrage)
7. [Taxonomie des erreurs](#7-taxonomie-des-erreurs)
8. [Erreurs typiques des francophones](#8-erreurs-typiques-des-francophones)
9. [Consignes du Thème et niveau](#9-consignes-du-thème-et-niveau)
10. [Séance du jour et motivation](#10-séance-du-jour-et-motivation)

---

## 1. Cadre théorique et conséquences

Chaque mécanisme de l'application doit se justifier par l'une de ces références (PED-14).

| Référence                                  | Idée clé                                                                                                                                         | Conséquence dans l'application                                                                                                                                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DeKeyser** (acquisition des compétences) | La connaissance déclarative devient procédurale par la pratique ciblée, puis automatique par une pratique abondante et variée.                   | Les cinq étapes : leçon (déclaratif) ; reconnaître et pratiquer (procéduralisation) ; traduire et produire (automatisation). Viennent ensuite les révisions espacées et la fluidité orale.                            |
| **Corder** (lapsus ou lacune)              | Un _lapsus_ (mistake) est une défaillance ponctuelle sur une règle connue ; une _lacune_ (error) révèle une règle absente ou fausse.             | Deux traitements distincts : une carte pour le lapsus, le parcours de la notion pour la lacune (§4).                                                                                                                  |
| **Swain** (hypothèse de l'output)          | Produire oblige à remarquer ce qu'on ne sait pas dire, et à tester des hypothèses.                                                               | L'output est l'objectif. Les cartes se révisent toujours en production. Thème, Journal, E-mail et Oral sont au cœur de la séance.                                                                                     |
| **Schmidt** (noticing)                     | On n'apprend que ce que l'on remarque consciemment.                                                                                              | Segments fautifs surlignés. La tentative précédente reste visible (masquée par défaut) sur la carte. Le contraste avec la notion voisine figure dans chaque leçon.                                                    |
| **Lyster et Ranta** (feedback correctif)   | Les incitations à l'autocorrection (indices métalinguistiques, élicitation) produisent plus d'appropriation (uptake) que les reformulations.     | Feedback en deux temps : indice de catégorie et tentative d'autocorrection **avant** la correction (§5).                                                                                                              |
| **Nation** (quatre volets)                 | Un programme équilibré combine l'input centré sur le sens, l'output centré sur le sens, l'étude de la langue et le développement de la fluidité. | Répartition explicite (§2). La fluidité est entraînée à part, sans interruption.                                                                                                                                      |
| **Lewis** (approche lexicale)              | La langue se compose de blocs (collocations, expressions figées, formules) plus que de mots isolés.                                              | « Mon lexique » stocke des blocs, pas des mots. Cartes de collocation. Expression du jour. Formules d'e-mail.                                                                                                         |
| **Pratique de récupération**               | Rappeler une information de mémoire la consolide davantage que la relire.                                                                        | Réponses toujours produites, jamais seulement choisies, dans les révisions (PED-08, CARD-04).                                                                                                                         |
| **Répétition espacée**                     | Des rappels espacés, juste avant l'oubli, sont plus efficaces que des rappels massés.                                                            | FSRS (bibliothèque ts-fsrs) planifie chaque carte (ARC-06).                                                                                                                                                           |
| **Entrelacement**                          | Mélanger des problèmes de types différents oblige à choisir la bonne procédure.                                                                  | Reprises mélangées. Thème multi-notions. Notion « récapitulatif » en fin de piste. Choix entre deux formes voisines (présent simple ou continu, present perfect ou prétérit).                                         |
| **Bjork** (difficultés désirables)         | Une difficulté qui demande un effort de récupération améliore la rétention, à condition de rester surmontable.                                   | Production plutôt que reconnaissance. Calibrage à 75–85 % de réussite (§6). Indice seulement sur demande.                                                                                                             |
| **Estompage de l'aide** (fading)           | L'échafaudage est retiré progressivement à mesure que la compétence augmente.                                                                    | Au fil des cinq étapes, l'aide diminue : choix fermé, puis forme guidée, puis traduction, puis production libre. Les consignes du Thème passent de la traduction, à la situation décrite, puis à l'anglais seul (§9). |
| **4/3/2** (Maurice ; Nation)               | Répéter le même contenu dans un temps de plus en plus court, devant un auditeur, pousse la fluidité.                                             | Module oral 4/3/2 : même sujet en 4, 3 puis 2 minutes (durées adaptables), sans aucune interruption. Feedback seulement à la fin (PED-11).                                                                            |
| **Shadowing**                              | Répéter en décalé un modèle oral travaille la prononciation, la prosodie et l'automatisation.                                                    | Shadowing avec comparaison mot à mot. Les mots manqués sont rattachés à des catégories de sons. Shadowing ciblé sur les sons faibles.                                                                                 |

## 2. Les quatre volets de Nation dans l'application

La compréhension de l'apprenant est déjà bonne (USR-03). L'input reste donc léger ; l'effort porte sur l'output, l'étude de la langue et la fluidité.

| Volet                     | Modules                                                                                | Part visée de la séance |
| ------------------------- | -------------------------------------------------------------------------------------- | ----------------------- |
| Input centré sur le sens  | Exemples des leçons lus à voix haute, modèles d'e-mail commentés, phrases de shadowing | ≈ 10 %                  |
| Output centré sur le sens | Thème (niveaux 2 et 3), Journal, E-mail, réponse chronométrée, simulation d'entretien  | ≈ 35 %                  |
| Étude de la langue        | Parcours, Reprises, Carnet de règles, feedback correctif                               | ≈ 40 %                  |
| Fluidité                  | 4/3/2, réponse chronométrée, shadowing                                                 | ≈ 15 %                  |

## 3. Progression d'une notion en cinq étapes

### 3.1 États d'une notion (CUR-12)

Transitions :

| De                                | Vers                          | Déclencheur                                   |
| --------------------------------- | ----------------------------- | --------------------------------------------- |
| non commencée                     | en cours, étape 1             | L'apprenant ouvre la notion dans le Parcours. |
| non commencée                     | à consolider, étape 4         | Test de positionnement réussi (CUR-08).       |
| en cours ou à consolider, étape 5 | acquise                       | Critère de l'étape 5 atteint (§3.3).          |
| en cours, étape n                 | rappel court de l'étape n − 1 | Échecs répétés (§3.3).                        |
| à consolider ou acquise           | en cours, étape 3             | Lacune détectée (§4.2).                       |

- **Non commencée** : aucune activité.
- **En cours (étape n)** : l'apprenant progresse dans les étapes.
- **À consolider** : le test de positionnement est réussi (CUR-08). La notion démarre à l'étape 4 et devient « acquise » après la réussite de l'étape 5 (DECISIONS D-022).
- **Acquise** : les cinq étapes sont franchies. La notion entre en répétition espacée (cartes de notion) et alimente le Thème (CUR-09).

### 3.2 Les étapes

| Étape          | But (DeKeyser)                    | Exercices                                                                                                                                                           | Correction                                                         | Aide disponible                        |
| -------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------- |
| 1. Comprendre  | Connaissance déclarative          | Leçon en français (2–3 min) : usage, forme en tableau, contraste avec la notion voisine, pièges des francophones, 4–6 exemples avec audio, frise SVG pour les temps | —                                                                  | Tout est affiché                       |
| 2. Reconnaître | Remarquer et discriminer          | Choisir la forme, **puis** la raison (justification)                                                                                                                | Locale                                                             | Leçon accessible                       |
| 3. Pratiquer   | Procéduraliser sous contrôle      | Compléter avec le verbe à l'infinitif donné, transformer une phrase, placer un mot au bon endroit                                                                   | Locale (comparaison normalisée avec les variantes)                 | Leçon accessible                       |
| 4. Traduire    | Produire sous guidage             | Phrases françaises ciblant **uniquement** la notion, de difficulté croissante                                                                                       | Locale si la réponse correspond à une variante ; sinon modèle (IA) | Indice sur demande (compte comme aide) |
| 5. Produire    | Automatiser en contexte personnel | Deux ou trois phrases personnelles utilisant la notion, avec une amorce tirée des domaines de l'apprenant                                                           | IA (correction en deux temps)                                      | Aucune, sauf la leçon                  |

### 3.3 Critères de passage et de retour (CUR-04)

Les valeurs par défaut sont les suivantes.

**Passage d'une étape à la suivante :**

- **Étape 1 → 2** : la leçon a été lue jusqu'au bout. L'apprenant confirme avec « J'ai compris, je passe à la reconnaissance ». Il n'y a pas de test : la vérification se fait à l'étape 2.
- **Étapes 2, 3 et 4 → suivante** : **au moins 8 bonnes réponses sur les 10 dernières** de l'étape, avec au moins 10 réponses données.
  - À l'étape 2, une réponse n'est bonne que si la forme **et** la raison sont justes.
  - À l'étape 4, une réponse compte comme bonne si elle ne contient **aucune erreur sur la notion ciblée** (réponse correcte ou acceptable). Les erreurs d'autres catégories sont traitées normalement (cartes, §4), mais ne bloquent pas la progression de la notion.
  - Une réponse obtenue après avoir demandé un indice compte comme **à moitié bonne** (0,5).
- **Étape 5 → acquise** : **deux productions consécutives** qui emploient effectivement la notion **sans erreur sur cette notion** de gravité moyenne ou majeure. Les tournures « correctes mais pas naturelles » ne comptent jamais comme des erreurs.

**Retour en arrière (échecs répétés) :**

- **Déclencheur** : **au moins 4 échecs parmi les 6 dernières réponses** de l'étape (avec au moins 6 réponses).
- L'apprenant reçoit un message encourageant et concret, par exemple : « Cette forme résiste encore, c'est normal à ce stade. On revoit la pratique guidée quelques minutes, puis tu reviens à la traduction. »
- **Rappel à l'étape précédente** : une série courte de 5 exercices. 4 réussites sur 5 renvoient à l'étape d'origine, dont le compteur est remis à zéro.
- Pas de retour en deçà de l'étape 2 : l'étape 1 reste accessible à tout moment, mais n'est jamais imposée.

## 4. Lapsus ou lacune

Chaque erreur confirmée porte une catégorie et éventuellement un identifiant de notion (TAX-03). Son traitement dépend de l'état de la notion.

### 4.1 Définitions opérationnelles

- **Erreur qualifiante** : une erreur de gravité **moyenne ou majeure** qui remplit trois conditions :
  - sa confiance est **élevée**, ou l'utilisateur l'a confirmée ;
  - elle n'a pas été signalée comme faux positif ;
  - elle n'est pas une tournure « correcte mais pas naturelle ».

  Seules les erreurs qualifiantes peuvent déclencher une lacune. Ainsi, un faux positif de l'IA ne renvoie jamais l'apprenant en arrière (DECISIONS D-024).

- **Notion étudiée** : une notion en cours à l'étape 4 ou au-delà, à consolider, ou acquise. C'est à partir de l'étape 4 que la notion est pratiquée en production, comme sur une carte ou dans le Thème (DECISIONS D-023, D-025).

### 4.2 Règle de décision

| Situation                                                                                                             | Diagnostic                                      | Traitement                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Erreur sans notion associée (par exemple `orthographe`, `ponctuation`)                                                | —                                               | Si la gravité est moyenne ou majeure, une carte est créée. L'erreur est comptée dans les statistiques de catégorie (Carnet de règles, tableau de bord).                                                                                                                                                                                                                              |
| Notion **non commencée**, ou en cours aux étapes 1 à 3                                                                | **Lacune** (pas encore pratiquée en production) | La notion devient prioritaire dans le Parcours. La carte est créée **suspendue** (motif « notion non étudiée ») et s'active automatiquement quand la notion atteint l'étape 4 (DECISIONS D-025) : on ne demande pas de produire une forme jamais enseignée. Pratique immédiate : proposition de découvrir la leçon (2 min), puis les micro-exercices.                                |
| Notion étudiée, et **moins de 2** erreurs qualifiantes sur cette notion dans les 7 derniers jours (celle-ci comprise) | **Lapsus**                                      | Une carte active est créée (CARD-02), suivie de la pratique immédiate (§5.2).                                                                                                                                                                                                                                                                                                        |
| Notion étudiée, et **au moins 2** erreurs qualifiantes sur cette notion dans les 7 derniers jours                     | **Lacune** (notion fragile)                     | Une notion à consolider ou acquise repasse « en cours » à l'étape 3. Une notion déjà en cours (étape 4 ou 5) garde son étape : ses critères de retour s'appliquent (§3.3). La leçon est recommandée. Une carte active est créée, et la pratique immédiate a lieu. Message non culpabilisant : « Cette notion mérite une révision guidée ; elle est remise en tête de ton parcours. » |

Les erreurs d'une même production sur une même notion comptent pour **une seule** occurrence : trois fautes de temps dans un paragraphe relèvent d'un seul épisode, pas de trois.

## 5. Feedback correctif et pratique immédiate

### 5.1 Correction en deux temps (PED-05, PED-06)

1. **Temps 1, autocorrection** (par défaut ; peut être désactivée dans les Réglages, ou sautée au cas par cas).
   - Les segments fautifs sont soulignés d'une couleur qui dépend de la gravité.
   - Chacun porte l'étiquette de sa catégorie (par exemple « Temps verbal ») et un indice d'autocorrection qui ne donne pas la réponse.
   - L'apprenant corrige directement dans le texte.
   - La tentative est vérifiée **localement** : on compare le segment corrigé, après normalisation, à la correction proposée et aux variantes. Il n'y a pas de second appel au modèle (DECISIONS D-026). Une autocorrection différente de la correction proposée n'est pas déclarée fausse : elle est simplement montrée à côté de la correction au temps 2.
2. **Temps 2, correction.** Pour chaque erreur, on affiche :
   - la correction ;
   - la règle, en français simple (une ou deux phrases) ;
   - un lien vers la leçon de la notion.

   Viennent ensuite les **tournures correctes mais pas naturelles**, soulignées en pointillés : l'original, l'alternative et pourquoi. Enfin, la **version naturelle** du texte entier et l'**expression du jour**.

**Gravité** (couleur du soulignement) :

- **mineure** : n'affecte ni la compréhension ni l'image professionnelle (faute de frappe isolée, virgule) ;
- **moyenne** : faute visible, mais le sens reste clair ;
- **majeure** : gêne la compréhension, change le sens, ou fait très mauvaise impression dans un contexte professionnel (par exemple _I have 25 years_ en entretien).

### 5.2 Pratique immédiate (PED-07)

Après une erreur sur une notion étudiée, et si l'apprenant ne la saute pas :

1. **2 ou 3 micro-exercices contrôlés** de l'étape 3 de cette notion, tirés du socle. On choisit en priorité ceux qui n'ont pas été vus récemment, puis les exercices générés conservés.
2. **Une nouvelle phrase ciblée** de l'étape 4 (traduction) sur la même notion.
3. Retour au module d'origine.

Toute la pratique immédiate est corrigée localement, sauf la phrase de l'étape 4 lorsqu'elle ne correspond à aucune variante. Dans ce cas, le modèle n'est appelé que si l'apprenant valide sa réponse : c'est une action explicite (COST-01).

## 6. Révisions, entrelacement et calibrage

### 6.1 Cartes et FSRS (PED-08, CARD-04 à CARD-06)

- Toutes les cartes se révisent **en production** : l'apprenant tape (ou dicte) la réponse, jamais un simple choix.
- **Ordre des cartes dues** : on mélange les notions et les catégories. Deux cartes consécutives de la même notion sont évitées quand c'est possible.
- **Correspondance entre le résultat et la note FSRS :**
  - incorrecte → _Again_ ;
  - acceptable (juste, mais avec une faute mineure ou une forme moins naturelle), ou juste après un indice → _Hard_ ;
  - correcte → _Good_ ;
  - _Easy_ seulement si l'apprenant le choisit.

  L'apprenant peut toujours confirmer ou ajuster la note (CARD-05).

- **Plafonds par défaut** (réglables) : 10 nouvelles cartes par jour, 60 révisions par jour.
- **Carte maîtrisée** : sa stabilité FSRS dépasse 120 jours et ses 3 dernières révisions sont correctes. Elle reste planifiée pour une **révision de maintien**, avec au plus 3 cartes maîtrisées par jour.
- **Carte suspendue** : elle n'est jamais présentée. Elle est suspendue par un signalement, parce que sa notion n'a pas encore été étudiée, ou parce qu'elle est non résoluble à l'import.

### 6.2 Calibrage de la difficulté (PED-09)

La difficulté est calibrée par module, sur le taux de réussite **des 20 derniers items** :

- **au-dessus de 85 %**, on augmente la difficulté : phrases plus longues, moins d'indices, plus d'entrelacement, consigne du Thème au palier suivant si le niveau le permet (§9) ;
- **en dessous de 75 %**, on la baisse : phrases plus courtes, notions plus récemment étudiées, indice proposé, palier de consigne inférieur ;
- **entre les deux**, on ne change rien.

## 7. Taxonomie des erreurs

### 7.1 Deux dimensions distinctes

Chaque erreur est décrite par deux informations indépendantes :

- la **catégorie** (une des 15 ci-dessous) dit **de quelle nature** est l'erreur ;
- l'**identifiant de notion** dit **quelle leçon** du programme enseigne la correction. Il est facultatif, car certaines erreurs n'ont pas de notion (`orthographe`, `ponctuation`, `prononciation`, beaucoup de `calques_du_francais`).

Par exemple, dans _It's been three years that I work here_, la catégorie est `calques_du_francais` et la notion est `tense-for-since-ago`.

### 7.2 Définitions et frontières

**`temps_verbaux`** — Choix ou formation du temps et de l'aspect verbal : présent simple ou continu, prétérit, present perfect (simple et continu), past perfect, futurs, formes du passé des verbes irréguliers. S'y ajoutent **par convention** les marqueurs temporels liés aux temps : _for, since, ago, just, already, yet, still_, y compris leur **choix et leur position**.

- _I work here since 2020_ → _I have worked here since 2020_.
- _I have seen him yesterday_ → _I saw him yesterday_.
- _He buyed shares_ → _He bought shares_.
- _When I will arrive, I call you_ → _When I arrive, I'll call you_.
- **Frontières** :
  - le _-s_ de la 3e personne → `accord_sujet_verbe` ;
  - _do/does/did_ dans les questions et négations → `auxiliaires_questions_negations` ;
  - _since three years_ (au lieu de _for_) → ici, par la convention sur _for/since/ago_.

**`accord_sujet_verbe`** — Accord en personne et en nombre entre le sujet et le verbe conjugué : _-s_ de la 3e personne du singulier au présent, _is/are_, _was/were_, _has/have_, sujets collectifs ou indéfinis.

- _She work in a bank_ → _She works in a bank_.
- _Everyone have finished_ → _Everyone has finished_.
- **Frontières** :
  - le verbe est bien accordé mais au mauvais temps → `temps_verbaux` ;
  - l'erreur est dans la forme construite avec un auxiliaire (_Does she works?_) → `auxiliaires_questions_negations`.

**`auxiliaires_questions_negations`** — Formation des questions, négations, réponses courtes et _question tags_ avec _do/does/did_, _be_, _have_ et les modaux. Couvre aussi la **forme du verbe** après un auxiliaire ou un modal, et le **sens** du modal (obligation, possibilité, conseil).

- _Where you work?_ → _Where do you work?_
- _I didn't went_ → _I didn't go_.
- _He can to come_ → _He can come_.
- _You must not submit it today_, employé pour dire « tu n'es pas obligé » → _You don't have to submit it today_.
- **Frontières** :
  - ordre sujet/verbe dans une question **indirecte** → `ordre_des_mots` ;
  - modal correct mais trop direct pour le contexte (_Can you send me…_ adressé à un recruteur) → `registre_ton`.

**`articles`** — Présence, absence ou choix de _a/an/the_ et de l'article zéro. Couvre aussi la forme _a/an_ selon le son qui suit.

- _The inflation is rising_ → _Inflation is rising_.
- _I am engineer_ → _I am an engineer_.
- _an university_ → _a university_.
- **Frontière** : l'article est faux **parce que le nom est indénombrable** (_an advice_) → `indenombrables_pluriels`.

**`indenombrables_pluriels`** — Nombre dans le groupe nominal :

- noms indénombrables mis au pluriel ou précédés de _a/an_ (_informations, advices, feedbacks, researches, equipments_) ;
- quantifieurs (_much/many, few/little, less/fewer_) ;
- adjectifs accordés à tort ;
- noms composés avec un nombre ;
- pluriels irréguliers.

Exemples :

- _She gave me an advice_ → _She gave me some advice / a piece of advice_.
- _differents options_ → _different options_.
- _a three-years plan_ → _a three-year plan_.
- **Frontière** : nom dénombrable, et seul l'article est en cause → `articles`.

**`prepositions`** — Choix, présence ou absence d'une préposition, y compris après un verbe (_depend on_), un nom ou un adjectif, et les prépositions de temps et de lieu (_in/on/at_). La catégorie s'applique **même si l'erreur vient d'un calque**, dès que la préposition est le seul problème.

- _It depends of the market_ → _It depends on the market_.
- _married with_ → _married to_.
- _arrive to Zurich_ → _arrive in Zurich_.
- _discuss about the results_ → _discuss the results_.
- _explain me_ → _explain to me_.
- **Frontières** :
  - _for/since/ago_ → `temps_verbaux` ;
  - le verbe lui-même est mal choisi → `choix_lexical_collocations` ;
  - toute une structure transposée → `calques_du_francais`.

**`ordre_des_mots`** — Position des mots et des groupes :

- adjectif avant le nom ;
- adverbe de fréquence (avant le verbe principal, après _be_) ;
- pas d'adverbe entre le verbe et son complément d'objet ;
- ordre sujet-verbe dans les questions indirectes ;
- position de _enough_ et de _also_.

Exemples :

- _I like very much this job_ → _I like this job very much_.
- _Can you tell me where is the office?_ → _Can you tell me where the office is?_
- **Frontière** : position de _just/already/yet/still_ → `temps_verbaux` (convention ci-dessus).

**`faux_amis`** — **Un seul mot** anglais, qui existe, employé avec le sens d'un mot français de forme proche.

- _Actually, I work in a bank_ (voulant dire « actuellement ») → _Currently, I work in a bank_.
- _I will eventually call you_ (voulant dire « éventuellement ») → _I may call you_.
- _library_ pour « librairie » → _bookshop_ ; _sensible_ pour « sensible » → _sensitive_ ;
- _assist a meeting_ → _attend a meeting_ ; _attend the bus_ → _wait for the bus_ ;
- _demand_ pour « demander » → _ask_ ; _formation_ pour « formation » → _training_ ; _control_ pour « contrôler » → _check_ ;
- _to precise_ → _to specify_.
- **Frontières** :
  - le mot a le bon sens mais ne s'associe pas avec son voisin → `choix_lexical_collocations` ;
  - l'erreur porte sur une structure de plusieurs mots → `calques_du_francais`.

**`calques_du_francais`** — **Structure ou expression de plusieurs mots** transposée littéralement du français, agrammaticale ou non idiomatique en anglais. L'origine française est identifiable.

- _I am agree_ → _I agree_.
- _I have 25 years_ → _I am 25_.
- _It's been three years that I work here_ → _I have been working here for three years_.
- _According to me_ → _In my opinion_.
- _How do you call this?_ → _What do you call this?_
- **Frontières** :
  - un seul mot à sens trompeur → `faux_amis` ;
  - une association verbe + nom ou adjectif + nom bien construite, dont seul un mot est mal choisi → `choix_lexical_collocations` ;
  - une seule préposition en cause → `prepositions`.

**`choix_lexical_collocations`** — Mot existant, de sens voisin, mais pas celui qu'un anglophone emploierait dans cette association ou ce contexte. Couvre aussi les paires confondues (_make/do, say/tell, rise/raise, lend/borrow, win/earn_) et les mots inexistants.

- _do a mistake_ → _make a mistake_.
- _He said me_ → _He told me_.
- _The central bank rose rates_ → _The central bank raised rates_.
- _Can you borrow me your laptop?_ → _Can you lend me your laptop?_
- _strong rain_ → _heavy rain_.
- **Frontières** : voir `faux_amis` et `calques_du_francais`. Règle de départage : **un mot** mal choisi dans une association (collocation) ; **un mot** trompeur par sa forme (faux ami) ; **une structure** transposée (calque).

**`registre_ton`** — Formulation correcte et naturelle **dans un autre contexte**, mais inadaptée au destinataire ou à la situation (e-mail professionnel, entretien) : trop familière, trop directe, trop sèche, ou trop pompeuse.

- _Hi guys_ (à un recruteur) → _Dear Ms Smith_ / _Hello Ms Smith_.
- _I want a meeting_ → _I would like to schedule a meeting_.
- _Send me the file._ → _Could you send me the file?_
- _wanna_ → _want to_.
- **Frontière** : une tournure qui n'est naturelle **dans aucun contexte** relève d'une autre catégorie (calque, collocation) ou d'une « tournure non naturelle » (§7.3). Le registre dépend **toujours** du contexte.

**`connecteurs_structure`** — Liens logiques et organisation du texte :

- choix et construction des connecteurs (_however, therefore, although_ + proposition, _despite_ + nom) ;
- relatives (_who/which/that/whose_, _what_ employé à tort comme relatif) ;
- phrases trop longues ou décousues ;
- paragraphes et structure d'un e-mail.

Exemples :

- _Despite the market fell, …_ → _Although the market fell, …_
- _the report what I sent_ → _the report that I sent_.
- **Frontière** : si seule la ponctuation est en cause → `ponctuation`.

**`orthographe`** — Graphie d'un mot existant :

- fautes de frappe ;
- majuscules obligatoires (jours, mois, langues, nationalités, _I_) ;
- homophones (_its/it's, your/you're, their/there_) ;
- apostrophe du génitif (_the company's results_).

Exemples :

- _recieve_ → _receive_.
- _monday_ → _Monday_.
- _Its a good idea_ → _It's a good idea_.
- **Frontière** : une forme verbale ou un pluriel faux relève de la catégorie grammaticale correspondante.

**`ponctuation`** — Signes de ponctuation et typographie anglaise :

- pas d'espace avant _? ! : ;_ ;
- guillemets anglais ;
- virgule après un connecteur en tête de phrase ;
- pas de virgule avant une relative déterminative ;
- deux propositions indépendantes séparées par une simple virgule (_comma splice_).

Exemples :

- _Really ?_ → _Really?_
- _The report, that I sent, …_ (relative déterminative) → _The report that I sent …_

**`prononciation`** — Réservée aux modules oraux. Écart observé entre le texte attendu et le texte reconnu. Chaque écart est rattaché à une **catégorie de sons** :

- `th` (/θ/, /ð/) ;
- `h_aspire` ;
- `voyelles_longues_courtes` (/iː/–/ɪ/, /uː/–/ʊ/) ;
- `terminaison_ed` (/t/, /d/, /ɪd/) et `terminaison_s` (/s/, /z/, /ɪz/) ;
- `accent_tonique` ;
- `schwa` ;
- `autre`.

La mesure repose sur la reconnaissance vocale : c'est une **approximation** (MOD-06(f)).

### 7.3 « Correct mais pas naturel »

Une tournure grammaticalement correcte, compréhensible, mais qu'un anglophone ne choisirait pas, n'est **pas une erreur** (PED-06). Elle apparaît dans une liste séparée (soulignés en pointillés), avec l'original, l'alternative et la raison.

- Elle peut porter l'étiquette de la catégorie la plus proche (`calques_du_francais`, `choix_lexical_collocations`, `registre_ton`), à titre indicatif.
- Elle ne compte **jamais** dans le taux d'erreurs, les critères d'étape ni la règle lapsus ou lacune.
- Elle peut alimenter « Mon lexique » si l'apprenant l'accepte.

Une formulation correcte et naturelle, mais **différente du modèle**, n'est ni une erreur ni une tournure non naturelle (NO-05).

### 7.4 Règles de départage (dans l'ordre)

1. **Une erreur = un segment minimal.** Deux problèmes indépendants dans une phrase font deux erreurs. En revanche, un même problème répété dans une production ne compte qu'une fois pour la règle lapsus ou lacune (§4.2).
2. _for, since, ago, just, already, yet, still_ (choix et position) → `temps_verbaux`.
3. **Une seule préposition** en cause → `prepositions`.
4. **Un seul mot** trompeur par sa ressemblance avec le français → `faux_amis`. **Un seul mot** mal associé → `choix_lexical_collocations`. **Une structure** de plusieurs mots transposée → `calques_du_francais`.
5. **Juste dans un autre contexte** → `registre_ton`. **Juste partout mais peu idiomatique** → tournure non naturelle (§7.3), pas une erreur.
6. **Forme d'un mot** : verbe → `temps_verbaux`, `accord_sujet_verbe` ou `auxiliaires_questions_negations` ; nom → `indenombrables_pluriels` ; graphie seule → `orthographe`.
7. **En cas de doute** entre deux catégories : choisir la plus spécifique et abaisser la confiance.

## 8. Erreurs typiques des francophones

Les identifiants de notions (colonne de droite) sont ceux du programme (CUR-02). Ils sont définis dans [ARCHITECTURE.md §5](ARCHITECTURE.md#5-programme-et-contenu).

| Erreur typique                       | Exemple fautif → correct                                                                                                      | Catégorie                         | Notion                                               |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------- |
| Present perfect ou prétérit          | _I have finished the report yesterday_ → _I finished the report yesterday_                                                    | `temps_verbaux`                   | `tense-present-perfect-vs-past-simple`               |
| Présent au lieu du present perfect   | _I know him since 2019_ → _I have known him since 2019_                                                                       | `temps_verbaux`                   | `tense-for-since-ago`                                |
| _since_ au lieu de _for_             | _since three years_ → _for three years_                                                                                       | `temps_verbaux`                   | `tense-for-since-ago`                                |
| Place et sens de _yet/already/still_ | _I have finished already not_ → _I haven't finished yet_                                                                      | `temps_verbaux`                   | `tense-just-already-yet-still`                       |
| Présent simple ou continu            | _I am working in finance every day_ → _I work in finance_                                                                     | `temps_verbaux`                   | `tense-present-simple-vs-continuous`                 |
| Futur après _when/if_                | _when I will have the results_ → _when I have the results_                                                                    | `temps_verbaux`                   | `tense-future`                                       |
| Accord de la 3e personne             | _The model predict_ → _The model predicts_                                                                                    | `accord_sujet_verbe`              | `tense-present-simple`                               |
| Auxiliaire _do_                      | _Why you chose finance?_ → _Why did you choose finance?_                                                                      | `auxiliaires_questions_negations` | `structure-do-questions-negations`                   |
| Indénombrables                       | _informations, advices, feedbacks, researches, equipments_                                                                    | `indenombrables_pluriels`         | `traps-uncountables`                                 |
| Articles                             | _The data science is…_ → _Data science is…_                                                                                   | `articles`                        | `traps-articles`                                     |
| Prépositions après un verbe          | _depend of, married with, arrive to_                                                                                          | `prepositions`                    | `traps-dependent-prepositions`                       |
| Prépositions de temps                | _in Monday, at the morning_ → _on Monday, in the morning_                                                                     | `prepositions`                    | `traps-time-prepositions`                            |
| Questions indirectes                 | _Could you tell me what is the deadline?_ → _… what the deadline is?_                                                         | `ordre_des_mots`                  | `structure-indirect-questions`                       |
| Adverbe mal placé                    | _I read often reports_ → _I often read reports_                                                                               | `ordre_des_mots`                  | `structure-word-order`                               |
| Faux amis professionnels             | _actually, eventually, library, sensible, assist, attend, demand, formation, control_                                         | `faux_amis`                       | `traps-false-friends`                                |
| Calques                              | _I am agree ; it's been three years that ; I have 25 years_                                                                   | `calques_du_francais`             | — (ou la notion du temps concerné)                   |
| _make_ ou _do_                       | _do a mistake, make a research_ → _make a mistake, do research_                                                               | `choix_lexical_collocations`      | `traps-make-do`                                      |
| _say_ ou _tell_                      | _She said me that…_ → _She told me that…_                                                                                     | `choix_lexical_collocations`      | `traps-say-tell`                                     |
| _lend_ ou _borrow_                   | _Can you borrow me…_ → _Can you lend me…_                                                                                     | `choix_lexical_collocations`      | `traps-lend-borrow`                                  |
| _rise_ ou _raise_                    | _The ECB rose rates_ → _The ECB raised rates_                                                                                 | `choix_lexical_collocations`      | `traps-rise-raise`                                   |
| Registre des e-mails                 | _I want to know…_ → _I would like to know…_ ; _Hi guys_ → _Dear…_                                                             | `registre_ton`                    | `pro-conditionals-politeness`                        |
| Connecteurs et relatives             | _despite + proposition_ ; _the thing what_                                                                                    | `connecteurs_structure`           | `structure-connectors`, `structure-relative-clauses` |
| Prononciation : _th_                 | _think_ prononcé _sink_ ou _fink_                                                                                             | `prononciation`                   | — (son `th`)                                         |
| Prononciation : _h_ aspiré           | _hotel_ prononcé sans _h_, ou _h_ ajouté devant _economy_                                                                     | `prononciation`                   | — (son `h_aspire`)                                   |
| Voyelles longues et courtes          | _ship/sheep, live/leave_                                                                                                      | `prononciation`                   | — (son `voyelles_longues_courtes`)                   |
| Terminaisons _-ed_ et _-s_           | _worked_ prononcé en deux syllabes ; _-s_ final muet                                                                          | `prononciation`                   | — (sons `terminaison_ed`, `terminaison_s`)           |
| Accent tonique et schwa              | _develop_ accentué sur la dernière syllabe (_deveLOP_) au lieu de la deuxième (_deVELop_) ; voyelles pleines au lieu du schwa | `prononciation`                   | — (sons `accent_tonique`, `schwa`)                   |

## 9. Consignes du Thème et niveau

### 9.1 Trois paliers de consigne (PED-02, estompage)

| Palier                   | Consigne                                                                                                                 | Exemple                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Traduire              | Une phrase française complète à traduire.                                                                                | « Traduis : _Je n'ai pas encore reçu les résultats trimestriels._ »                                                                  |
| 2. Exprimer la situation | Une situation décrite en français, sans phrase à traduire mot à mot. Plusieurs formulations sont possibles et acceptées. | « Tu écris à ton manager : tu attends toujours les résultats trimestriels, qui auraient dû arriver hier. Dis-le-lui en une phrase. » |
| 3. Anglais seul          | Une consigne entièrement en anglais.                                                                                     | _Tell your manager, in one sentence, that the quarterly results you expected yesterday have not arrived._                            |

**Bascule par défaut** (niveau écrit estimé, LVL-04) :

- palier 1 jusqu'à A2+ ;
- palier 2 à partir de B1 ;
- palier 3 à partir de B2.

Le calibrage (§6.2) peut avancer ou retarder le palier d'un cran.

### 9.2 Choix des notions du Thème (MOD-05)

- **Pool principal** : les notions aux étapes 4 et 5, les notions à consolider, puis les notions acquises. On pondère par les catégories d'erreurs fréquentes et par l'ancienneté de la dernière pratique.
- **Notions non étudiées** : au plus 10 % des phrases, toujours accompagnées d'un indice visible, et jamais deux fois de suite (DECISIONS D-023).
- **Réponses acceptées** : plusieurs traductions correctes sont acceptées. Une réponse qui correspond à une variante est corrigée localement ; sinon, le modèle intervient, sur action explicite.

### 9.3 Niveau (LVL)

- **Échelle numérique** : A1 = 1, A2 = 2, B1 = 3, B2 = 4, C1 = 5, C2 = 6, avec des demi-niveaux (par exemple B1+ = 3,5).
- **Compétences** : écrit, oral, lexique, grammaire.
- **Estimation locale** : moyenne pondérée des évaluations reçues, avec une demi-vie de 14 jours. Chaque production pèse en fonction de sa longueur (plafonnée) ; les taux de réussite aux exercices de la piste correspondante s'y ajoutent.
- **Niveau affiché** : il ne change que d'un demi-niveau à la fois, et seulement si l'estimation reste au-delà du seuil pendant au moins 7 jours et 5 productions (LVL-03).

## 10. Séance du jour et motivation

### 10.1 Composition (MOD-02, PED-12)

| Ordre | Module                         | Durée cible | Remarque                                                            |
| ----- | ------------------------------ | ----------- | ------------------------------------------------------------------- |
| 1     | Reprises                       | 5–7 min     | Cartes dues, entrelacées ; plafonds des Réglages.                   |
| 2     | Parcours                       | 5–8 min     | Une étape de la notion en cours.                                    |
| 3     | Thème                          | 5–6 min     | Environ 4 à 6 phrases.                                              |
| 4     | Oral **ou** Journal (rotation) | 4–5 min     | L'E-mail guidé remplace le Journal une fois par semaine (réglable). |

Chaque module est aussi accessible seul, en 2 à 5 minutes. Une séance interrompue reprend là où elle s'est arrêtée, et rien de ce qui a été saisi n'est perdu (NO-06).

### 10.2 Motivation sans culpabilisation (PED-13, NO-07)

- **Série** : nombre de jours consécutifs avec au moins une activité significative (par défaut 5 minutes, ou un module terminé).
- **Joker hebdomadaire** : un jour manqué par semaine calendaire (du lundi au dimanche) ne casse pas la série. Le joker est appliqué automatiquement, sans message.
- **Progression visible** : notions acquises, cartes maîtrisées, niveau dans le temps.
- **Interdits** : aucun message culpabilisant (« Tu as perdu ta série ! »), aucun point, badge, classement ni notification insistante. Après une interruption, le ton est neutre et tourné vers l'action : « On reprend avec 10 minutes aujourd'hui ? »
