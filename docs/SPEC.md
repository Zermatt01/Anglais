# Spécification

Ce document reprend **toutes les exigences** du cahier des charges initial, réorganisées par domaine et numérotées pour pouvoir y faire référence dans le code, les commits et les revues (par exemple « voir CARD-02 »).

- Les identifiants sont **stables**. On ne les renumérote jamais. Une exigence abandonnée est barrée et garde son numéro.
- L'étiquette entre crochets indique la phase de livraison (P0 à P8, voir [ROADMAP.md](ROADMAP.md)).
- Les détails pédagogiques sont dans [PEDAGOGY.md](PEDAGOGY.md), les détails techniques dans [ARCHITECTURE.md](ARCHITECTURE.md) et les arbitrages dans [DECISIONS.md](DECISIONS.md).

## Sommaire

1. [Apprenant et objectif (USR)](#1-apprenant-et-objectif-usr)
2. [Leçons de la première version (LES)](#2-leçons-de-la-première-version-les)
3. [Principes pédagogiques (PED)](#3-principes-pédagogiques-ped)
4. [Taxonomie des erreurs (TAX)](#4-taxonomie-des-erreurs-tax)
5. [Architecture imposée (ARC)](#5-architecture-imposée-arc)
6. [Sécurité et données personnelles (SEC)](#6-sécurité-et-données-personnelles-sec)
7. [Maîtrise des coûts (COST)](#7-maîtrise-des-coûts-cost)
8. [Programme des notions (CUR)](#8-programme-des-notions-cur)
9. [Cartes (CARD)](#9-cartes-card)
10. [Modules (MOD)](#10-modules-mod)
11. [Prompts IA (AI)](#11-prompts-ia-ai)
12. [Estimation du niveau (LVL)](#12-estimation-du-niveau-lvl)
13. [Interface (UI)](#13-interface-ui)
14. [Méthode de travail (PROC)](#14-méthode-de-travail-proc)
15. [Interdits (NO)](#15-interdits-no)

---

## 1. Apprenant et objectif (USR)

Le dépôt ne contient aucune donnée personnelle identifiante (SEC-03). Le profil ci-dessous est volontairement générique ; le profil réel de l'apprenant vit dans les réglages de l'application.

- **USR-01** — Utilisateur unique : adulte francophone, profil finance, data science et IA, qui enseigne l'économie et le droit à des apprentis. Il commence un stage en finance/data en **février 2027** et vise une carrière à l'étranger.
- **USR-02** — Objectif : devenir réellement bilingue en anglais professionnel. Critère concret : **tenir un entretien d'embauche et rédiger des e-mails professionnels correctement en anglais, sans traduction mentale, d'ici février 2027**.
- **USR-03** — Niveau de départ :
  - bonne compréhension écrite ;
  - production orale et écrite très faibles ;
  - traduit facilement de l'anglais vers le français, mais peine énormément dans l'autre sens ;
  - a oublié l'essentiel de la grammaire, en particulier les temps verbaux et les mots comme _yet_, _already_, _still_.
- **USR-04** — Appareil : smartphone Samsung (Android, Chrome), usage surtout mobile, en sessions courtes. Le développement se fait sous Windows avec VS Code.
- **USR-05** — Domaines de contenu : finance (marchés, banque, banques centrales, analyse financière), data science et IA, enseignement, entretiens d'embauche, e-mails et réunions professionnels, vie quotidienne.
- **USR-06** — Le code est relu par un second agent (Codex). Il doit donc être lisible, documenté aux endroits non évidents, avec des commits clairs.

## 2. Leçons de la première version (LES)

Une V1 a été construite comme Artifact claude.ai en trois itérations. Son usage réel a produit les leçons suivantes, qui sont des exigences.

- **LES-01** — **Coût.** La construction et les appels de correction consommaient énormément de tokens. Chaque appel à un modèle doit être justifié, mesuré, plafonné et le moins cher possible. Tout ce qui peut être corrigé localement l'est. → COST-\*
- **LES-02** — **Cartes impossibles à résoudre.** Une carte issue d'une erreur ne montrait que la phrase anglaise fausse, sans la phrase française d'origine. Toute carte doit être résoluble par quelqu'un qui a totalement oublié le contexte. → CARD-01, CARD-02
- **LES-03** — **Absence de parcours.** Faire traduire librement des phrases contenant des notions oubliées revient à sauter les étapes de compréhension et de pratique guidée. Chaque notion est enseignée par étapes progressives avant d'être exigée en production libre. → CUR-\*
- **LES-04** — **Pas de pratique immédiate.** Une explication vue une seule fois ne suffit pas : il faut quelques exercices ciblés tout de suite après l'erreur. → PED-07
- **LES-05** — **Qualité des corrections non mesurée.** L'IA peut signaler à tort des phrases justes ou se tromper de règle. Il faut un banc d'essai mesurable et un bouton de signalement. → MOD-13
- **LES-06** — **Expérience mobile confuse.** L'app doit être une vraie PWA installable, avec une icône, qui s'ouvre en plein écran comme une app native. → ARC-01

## 3. Principes pédagogiques (PED)

- **PED-01** [P3] — **L'output est l'objectif, atteint par un échafaudage.**
  - Chaque notion suit la progression : comprendre, reconnaître, pratiquer de façon contrôlée, traduire de façon guidée, produire librement.
  - Les exercices de reconnaissance et contrôlés sont nécessaires au début, puis l'aide s'estompe (fading).
- **PED-02** [P4] — **Cibler l'asymétrie français → anglais.** La traduction est un échafaudage. Les consignes évoluent avec le niveau en trois paliers :
  1. « traduis cette phrase » ;
  2. « exprime cette situation » : consigne en français, sans phrase à traduire mot à mot ;
  3. consignes entièrement en anglais.
- **PED-03** [P4] — **Lapsus ou lacune.**
  - Un _lapsus_ (la notion est connue) se traite par une carte de révision.
  - Une _lacune_ (notion jamais étudiée, ou ratée au moins deux fois en sept jours) se traite par le parcours de la notion.
  - Règles précises : [PEDAGOGY.md §4](PEDAGOGY.md#4-lapsus-ou-lacune).
- **PED-04** [P4] — **Les erreurs personnelles pilotent le programme.** Chaque erreur est classée dans la taxonomie fixe (TAX-01), rattachée à une notion du programme lorsqu'il y en a une, et engendre des cartes et des priorités.
- **PED-05** [P4] — **Feedback correctif en deux temps.**
  1. Les segments fautifs sont surlignés avec un indice de catégorie, et l'apprenant tente de s'autocorriger.
  2. Viennent ensuite la correction, la règle en français simple et une version naturelle.
  - L'étape d'autocorrection peut être sautée, mais c'est le comportement par défaut.
- **PED-06** [P4] — **Deux niveaux de correction** :
  - ce qui est faux ;
  - ce qui est correct mais pas naturel (calques du français, registre).
  - Une formulation correcte mais différente du modèle n'est **jamais** une erreur.
- **PED-07** [P4] — **Pratique immédiate.** Après une erreur viennent deux ou trois micro-exercices contrôlés sur la notion, puis une nouvelle phrase ciblée, avant de passer à la suite. Cette pratique peut être sautée.
- **PED-08** [P4] — **Répétition espacée et entrelacement.** Les révisions sont mélangées, toujours en production, jamais en reconnaissance pure.
- **PED-09** [P4] — **Difficulté calibrée.** Viser 75 à 85 % de réussite, et ajuster sinon.
- **PED-10** [P4] — **Blocs lexicaux** plutôt que mots isolés.
- **PED-11** [P6] — **Fluidité et exactitude entraînées séparément.** Aucune interruption pendant les exercices de fluidité orale.
- **PED-12** [P4] — **Brièveté.** La séance du jour dure 20 à 25 minutes, et chaque module est utilisable seul en 2 à 5 minutes.
- **PED-13** [P5] — **Motivation sans culpabilisation.** Une série de jours avec un joker hebdomadaire, une progression visible, et aucun message culpabilisant.
- **PED-14** [P0] — **Cadre théorique.** Chaque décision doit pouvoir se justifier par l'ingénierie logicielle ou par la recherche en acquisition des langues secondes :
  - DeKeyser, Corder, Swain, Schmidt, Lyster et Ranta ;
  - les quatre volets de Nation, l'approche lexicale de Lewis ;
  - la pratique de récupération, la répétition espacée, l'entrelacement et les difficultés désirables de Bjork ;
  - le fading, l'activité 4/3/2 et le shadowing.
  - Correspondance théorie → application : [PEDAGOGY.md §1](PEDAGOGY.md#1-cadre-théorique-et-conséquences).

## 4. Taxonomie des erreurs (TAX)

- **TAX-01** [P0] — La taxonomie est fixe et compte 15 catégories :
  - `temps_verbaux`, `accord_sujet_verbe`, `auxiliaires_questions_negations` ;
  - `articles`, `indenombrables_pluriels`, `prepositions`, `ordre_des_mots` ;
  - `faux_amis`, `calques_du_francais`, `choix_lexical_collocations` ;
  - `registre_ton`, `connecteurs_structure`, `orthographe`, `ponctuation`, `prononciation`.
- **TAX-02** [P0] — Chaque catégorie a une définition courte et discriminante, avec les frontières entre catégories voisines (calques ou collocations, faux amis ou collocations, registre ou tournure non naturelle) : [PEDAGOGY.md §7](PEDAGOGY.md#7-taxonomie-des-erreurs).
- **TAX-03** [P4] — Chaque erreur porte exactement une catégorie, plus l'identifiant de la notion du programme qui l'enseigne, s'il y en a une.
- **TAX-04** [P0] — Les erreurs typiques des francophones sont rattachées aux catégories et aux notions : [PEDAGOGY.md §8](PEDAGOGY.md#8-erreurs-typiques-des-francophones).

## 5. Architecture imposée (ARC)

Ces choix sont faits. On ne les remet en cause qu'en cas d'obstacle bloquant, et en l'expliquant avant d'agir (**ARC-10**).

- **ARC-01** [P1] — **Front-end PWA** : Vite, React, TypeScript en mode strict.
  - Installable sur Android : manifeste, service worker via vite-plugin-pwa, icônes, affichage standalone.
  - Utilisable **hors ligne** pour tout ce qui ne demande pas d'IA : parcours, exercices corrigés localement, révisions à réponse déterministe, tableau de bord.
  - Mobile-first, interface en français, contenu en anglais.
- **ARC-02** [P1, P2] — **Local-first.**
  - IndexedDB via Dexie est la source de vérité sur l'appareil, synchronisée avec le serveur.
  - L'app reste pleinement utilisable sans réseau, et la synchronisation reprend au retour du réseau.
- **ARC-03** [P2] — **Serveur Supabase.**
  - Authentification pour un seul utilisateur, connexion par e-mail.
  - Postgres avec Row Level Security activée sur **toutes** les tables.
  - Une Edge Function sert de mandataire vers l'API Anthropic.
- **ARC-04** [P1] — **Hébergement** du front-end sur Vercel, déployé depuis GitHub.
- **ARC-05** [P1] — **Zod** pour tous les schémas : données locales, réponses de l'IA, import.
- **ARC-06** [P1] — **Répétition espacée** avec la bibliothèque ts-fsrs (algorithme FSRS), plutôt qu'une implémentation maison. On vérifie son API actuelle avant de l'utiliser, et on l'encapsule derrière une interface interne.
- **ARC-07** [P0] — **Tests.**
  - Vitest pour la logique, Playwright en émulation mobile pour les parcours principaux.
  - ESLint et Prettier.
  - Vérification de types sans erreur.
- **ARC-08** [P6] — **Parole.**
  - Web Speech API (reconnaissance et synthèse) dans Chrome Android, avec détection de disponibilité et repli vers la dictée du clavier.
  - L'architecture est prévue pour brancher plus tard un service d'évaluation de prononciation (par exemple Azure Speech), sans l'implémenter maintenant.
- **ARC-09** [P2] — **Modèles Anthropic** configurables dans un seul fichier.
  - Défauts : `claude-haiku-4-5-20251001` pour les vérifications simples (réponse libre à une carte, classification de sons), `claude-sonnet-5` pour la correction détaillée, le diagnostic et la génération d'exercices.
  - Identifiants, sortie JSON structurée et cache de prompts ont été vérifiés dans la documentation officielle (DECISIONS D-009 à D-012).
- **ARC-10** — Tout écart à ARC-01 à ARC-09 exige un obstacle bloquant, expliqué avant d'agir.

## 6. Sécurité et données personnelles (SEC)

- **SEC-01** [P2] — La clé API Anthropic n'est **jamais** présente dans le front-end ni dans le dépôt. Elle existe uniquement comme secret de l'Edge Function.
- **SEC-02** [P2] — Row Level Security est activée sur toutes les tables Postgres, et chaque table a des politiques explicites.
- **SEC-03** [P0] — Aucun secret, aucune clé ni aucune donnée personnelle dans le code, les logs, les commits ou les messages.
- **SEC-04** [P0] — Le dossier `import-samples/` (export réel de l'ancienne app) est exclu du dépôt par `.gitignore`.
- **SEC-05** [P2] — L'Edge Function authentifie l'utilisateur et valide chaque requête avec Zod avant tout appel au modèle.

## 7. Maîtrise des coûts (COST)

Exigence de premier rang, pas une optimisation facultative.

- **COST-01** [P2] — **Aucun appel à un modèle sans action explicite de l'utilisateur**, jamais au chargement, en arrière-plan ou en boucle.
- **COST-02** [P1] — **Tout ce qui peut être corrigé localement l'est.**
  - Exercices concernés : choix, formes verbales, positions de mots, phrases à trou.
  - Toute réponse qui correspond à une variante attendue est aussi corrigée localement, par comparaison normalisée (casse, ponctuation, espaces, contractions).
- **COST-03** [P2] — Les prompts système stables et longs sont placés en tête pour bénéficier du cache de prompts. Les parties variables vont à la fin.
- **COST-04** [P2] — Sorties courtes : schémas JSON compacts et plafond de tokens de sortie adapté à chaque tâche.
- **COST-05** [P2] — L'Edge Function enregistre chaque appel :
  - date, tâche, modèle ;
  - tokens d'entrée, de sortie et en cache ;
  - coût estimé d'après un tableau de prix en configuration.
- **COST-06** [P2] — **Plafond mensuel** configurable, 10 USD par défaut. Au-delà, l'Edge Function refuse les appels avec un message clair.
- **COST-07** [P2] — **Limite de fréquence** par minute.
- **COST-08** [P2] — Un écran « Consommation » affiche le coût du jour, du mois et par tâche.
- **COST-09** [P3] — Les exercices générés par l'IA sont conservés et réutilisés, jamais régénérés inutilement.
- **COST-10** — Chaque appel est justifié, mesuré, plafonné et le moins cher possible (LES-01).

## 8. Programme des notions (CUR)

- **CUR-01** [P3] — **Programme = données.** Le programme est rédigé dans le code sous forme de données (TypeScript ou JSON validés par Zod), jamais généré à la volée. Ajouter une notion ne demande **aucune** modification de la logique.
- **CUR-02** [P3, P8] — **Pistes minimales, dans cet ordre pédagogique :**
  1. **Temps verbaux** :
     - présent simple ; présent continu ; présent simple ou continu ;
     - prétérit (réguliers et irréguliers fréquents) ;
     - present perfect (expérience et résultat) ; present perfect ou prétérit ;
     - for, since et ago ; just, already, yet et still ;
     - passé continu ; past perfect ;
     - futur (will, going to, présent continu) ; present perfect continu ;
     - récapitulatif.
  2. **Structure de la phrase** : questions et négations avec do, does et did ; ordre des mots ; questions indirectes ; relatives ; connecteurs.
  3. **Mots pièges** :
     - articles ; indénombrables ;
     - make ou do ; say ou tell ; rise ou raise ; lend ou borrow ;
     - prépositions de temps ; verbes à préposition ;
     - faux amis professionnels.
  4. **Communication professionnelle** : conditionnels et politesse ; modaux ; passif ; discours indirect.
- **CUR-03** [P3] — **Cinq étapes par notion :**
  1. **Comprendre** : une leçon en français, lisible en 2 à 3 minutes, qui contient :
     - l'usage et la forme en tableau ;
     - le contraste avec la notion voisine et les pièges des francophones ;
     - quatre à six exemples tirés des domaines USR-05, avec lecture audio des exemples ;
     - pour les temps verbaux, une frise chronologique en SVG.
  2. **Reconnaître** : choix avec justification (choisir la forme, puis la raison).
  3. **Pratiquer** : compléter avec la forme d'un verbe donné à l'infinitif, transformer, placer un mot au bon endroit.
  4. **Traduire** : phrases du français vers l'anglais ciblant uniquement cette notion, de difficulté croissante, avec un indice sur demande.
  5. **Produire** : deux ou trois phrases personnelles utilisant la notion, corrigées par l'IA.
- **CUR-04** [P3] — **Critère de passage explicite** pour chaque étape (par exemple 8 sur les 10 dernières réponses). Après des échecs répétés, retour à l'étape précédente avec une explication encourageante. Valeurs par défaut : [PEDAGOGY.md §3](PEDAGOGY.md#3-progression-dune-notion-en-cinq-étapes).
- **CUR-05** [P3] — Les étapes 2 et 3 sont corrigées **localement**. L'IA n'intervient qu'aux étapes 4 et 5, ou pour une réponse libre inattendue.
- **CUR-06** [P3] — **Socle** d'au moins dix exercices vérifiés par étape (étapes 2 à 4) pour chaque notion livrée. Chaque réponse attendue et chaque variante acceptable sont relues **deux fois**, car une réponse attendue fausse est le pire défaut possible de l'application.
- **CUR-07** [P3] — Au-delà du socle, l'IA génère des exercices sur demande. Ils sont validés et conservés (COST-09).
- **CUR-08** [P3] — **Test de positionnement** par piste : trois à cinq questions par notion, corrigées localement. Une notion réussie passe « à consolider » et démarre à l'étape 4.
- **CUR-09** [P3] — Une notion terminée entre en répétition espacée et devient disponible dans le Thème.
- **CUR-10** [P3] — **Priorité de rédaction** : la piste « Temps verbaux » complète, y compris la notion « just, already, yet et still », de qualité irréprochable, avant les autres pistes.
- **CUR-11** [P3] — Un test automatique parcourt tout le socle d'exercices et vérifie que chaque exercice est bien formé, résoluble et possède au moins une réponse attendue.
- **CUR-12** [P3] — **États d'une notion** : non commencée, en cours (avec l'étape), à consolider, acquise.
- **CUR-13** [P3] — Tout le contenu pédagogique fait l'objet d'une relecture séparée.

## 9. Cartes (CARD)

- **CARD-01** [P1] — **Règle de résolubilité.** Une fonction pure `isCardSolvable`, testée, est appliquée à **toute** création de carte. Une carte doit contenir assez d'information pour qu'une personne ayant oublié le contexte trouve la réponse sans deviner.
- **CARD-02** [P4] — **Carte issue d'une erreur.** Elle contient :
  - le sens à exprimer : la phrase française d'origine, ou une reformulation française de l'intention pour une production libre ;
  - un indice ciblé sur la notion, qui ne donne pas la réponse ;
  - la tentative précédente, masquée par défaut, avec l'erreur surlignée ;
  - un lien vers la leçon de la notion.
  - Réponse : la phrase correcte et ses variantes acceptables.
- **CARD-03** [P4] — **Autres formats :**
  - phrase à trou, avec le sens en français et le verbe à l'infinitif si nécessaire ;
  - collocation, avec le sens en français et un contexte ;
  - carte de notion ;
  - carte de prononciation.
- **CARD-04** [P4] — Les réponses sont **toujours en production**.
- **CARD-05** [P4] — **Correction d'une réponse.**
  - Si la réponse correspond à une variante, la correction est locale.
  - Sinon, le modèle rapide vérifie et classe la réponse : correcte, acceptable, ou incorrecte avec la raison.
  - L'utilisateur confirme ensuite la note, ou l'ajuste.
- **CARD-06** [P4] — **Statuts** : active, suspendue, maîtrisée. Les cartes maîtrisées reçoivent une révision de maintien occasionnelle.
- **CARD-07** [P4] — Aucune carte non résoluble n'est jamais présentée (NO-03).

## 10. Modules (MOD)

- **MOD-01** [P5] — **Diagnostic initial** (environ 10 minutes, refaisable).
  - Contenu :
    - (a) tests de positionnement des pistes ;
    - (b) cinq à huit phrases du français vers l'anglais, de difficulté croissante ;
    - (c) un court texte libre ;
    - (d) une réponse orale de 60 secondes.
  - Résultat : niveau CECR estimé par compétence (écrit, oral, lexique, grammaire) avec justification, priorités et état initial du parcours.
- **MOD-02** [P4] — **Séance du jour** (20 à 25 minutes).
  - Enchaînement : Reprises, puis Parcours (une étape de la notion en cours, 5 à 8 minutes), puis Thème, puis Oral ou Journal en rotation.
  - L'E-mail remplace le Journal une fois par semaine (fréquence réglable).
  - Chaque module est aussi accessible seul.
- **MOD-03** [P4] — **Reprises** : cartes dues, entrelacées, avec des plafonds réglables de nouvelles cartes et de révisions par jour.
- **MOD-04** [P3] — **Parcours.**
  - Présente les pistes et l'état de chaque notion : non commencée, en cours avec l'étape, à consolider, acquise.
  - Barres de progression.
  - Les leçons sont accessibles à tout moment.
- **MOD-05** [P4] — **Thème** : phrases du français vers l'anglais.
  - Elles ciblent en priorité les notions en étapes 4 et 5, les notions à consolider et les catégories d'erreurs fréquentes.
  - Jamais de notion non étudiée, sauf rarement et avec indice.
  - Plusieurs traductions correctes sont acceptées.
  - Correction en deux temps, pratique immédiate après erreur, rattachement des erreurs aux notions.
- **MOD-06** [P6] — **Oral.**
  - (a) Réponse chronométrée : 5 secondes de préparation, 45 à 90 secondes de réponse, feedback après.
  - (b) 4/3/2 : débit et hésitations mesurés, feedback à la fin.
  - (c) Shadowing : phrase lue, répétée, comparée mot à mot ; les mots manqués sont rattachés à des catégories de sons.
  - (d) Shadowing ciblé sur les sons les plus faibles.
  - (e) Simulation d'entretien de stage en finance/data, avec relances et bilan.
  - (f) Transparence : l'écran indique que la mesure de prononciation est une approximation.
- **MOD-07** [P4] — **Journal** : trois à cinq phrases libres avec une question d'amorce, correction en deux temps, version naturelle, expression du jour.
- **MOD-08** [P7] — **E-mail guidé** (10 à 15 minutes, reprenable).
  - Scénarios professionnels :
    - candidature, relance ;
    - réponse à un recruteur, remerciement après entretien ;
    - report d'échéance, demande à un professeur ;
    - compte rendu, client mécontent, recommandation.
  - Déroulé :
    1. un plan en points, le français étant autorisé ;
    2. un brouillon en anglais, avec objet ;
    3. une révision : correction en deux temps et critères (objet, ouverture, structure, clarté de la demande, registre, clôture) ;
    4. une version modèle commentée.
- **MOD-09** [P4] — **Mon lexique** : expressions, collocations et formules, collectées automatiquement ou ajoutées à la main.
  - Aucun doublon.
  - Chaque entrée a un sens, un exemple, une source et une carte associée.
- **MOD-10** [P4] — **Carnet de règles** : des fiches par catégorie, construites à partir des propres erreurs de l'utilisateur et liées aux leçons.
- **MOD-11** [P5] — **Tableau de bord**, en sections repliables :
  - série, minutes de la semaine, cartes dues demain ;
  - niveau par compétence dans le temps ;
  - catégories d'erreurs en tendance, sons faibles ;
  - progression du parcours, taux de réussite.
- **MOD-12** [P1, puis complété] — **Réglages** :
  - anglais britannique ou américain ;
  - voix et vitesse de lecture ;
  - objectif quotidien et plafonds de cartes ;
  - autocorrection et fréquence du mode e-mail ;
  - thème clair ou sombre ;
  - export et import JSON complets.
- **MOD-13** [P5] — **Qualité des corrections.**
  - (a) Un bouton « Signaler » sur chaque correction et chaque carte : motif, commentaire, suspension de la carte.
  - (b) Un banc d'essai dans un écran développeur :
    - une quinzaine de productions de référence couvrant toute la taxonomie, dont des phrases entièrement correctes, avec les erreurs attendues ;
    - mesure du rappel, de la précision et des faux positifs ;
    - le coût est affiché avant le lancement.
- **MOD-14** [P7] — **Import des données de l'ancienne version.**
  - Importer l'export JSON de l'ancienne app claude.ai. Un exemple réel se trouve dans `import-samples/`, hors dépôt (SEC-04).
  - Déduire le format de ce fichier.
  - Convertir les cartes, les productions, les erreurs et l'historique de série.
  - Réparer les cartes non résolubles quand la production source le permet, et suspendre les autres.

## 11. Prompts IA (AI)

- **AI-01** [P2] — Tous les prompts envoyés au modèle sont centralisés dans un dossier dédié et versionnés, chacun avec son schéma Zod de sortie.
- **AI-02** [P4] — Chaque prompt rappelle qui est l'apprenant, car le modèle n'a aucune mémoire :
  - francophone ;
  - niveau courant et variante d'anglais ;
  - domaines ;
  - catégories et notions en difficulté.
- **AI-03** [P4] — Chaque prompt donne la tâche, les critères, la taxonomie avec ses définitions et la liste des identifiants de notions autorisés.
- **AI-04** [P4] — Chaque prompt contient des exemples complets et contrastés, dont :
  - un cas à erreurs multiples de catégories différentes ;
  - un cas entièrement correct, dont la sortie attendue ne contient aucune erreur.
- **AI-05** [P4] — Exigences de rédaction :
  - des explications en français, courtes et concrètes ;
  - un anglais naturel et idiomatique ;
  - interdiction de signaler une formulation correcte ou d'inventer une règle ;
  - en cas de doute, une confiance faible plutôt qu'une affirmation.
- **AI-06** [P4] — Le prompt demande une vérification finale : les segments sont présents tels quels dans le texte, et les corrections sont justes.
- **AI-07** [P2, P4] — **Côté application :**
  1. validation Zod ;
  2. réparation des positions de segments par recherche dans le texte, sans surlignage si le segment est introuvable ;
  3. une seule nouvelle tentative en cas de sortie invalide ;
  4. à défaut, affichage dégradé mais utilisable.
- **AI-08** [P4] — **Sortie de correction :**
  - segments erronés : texte exact, positions, catégorie, identifiant de notion, indice d'autocorrection, correction, règle, gravité, confiance ;
  - tournures non naturelles : original, alternative, pourquoi ;
  - texte corrigé et version naturelle ;
  - intention en français, pour rendre les cartes résolubles ;
  - expression du jour et cartes proposées ;
  - évaluation : exactitude, naturel, complexité, commentaire.

## 12. Estimation du niveau (LVL)

- **LVL-01** [P5] — Estimation continue, calculée **localement** à partir des évaluations déjà reçues et des résultats aux exercices. Elle est pondérée vers le récent et vers les productions longues.
- **LVL-02** [P5] — Recalibrage par l'IA sur demande, ou **proposé** (jamais lancé automatiquement, COST-01) toutes les deux à trois semaines.
- **LVL-03** [P5] — Le niveau affiché ne bouge que d'un demi-niveau à la fois, et seulement si la tendance est stable.
- **LVL-04** [P5] — Le niveau pilote la difficulté et la bascule des consignes du Thème (PED-02).

## 13. Interface (UI)

- **UI-01** [P1] — **Mobile-first, pensée pour une main :**
  - cibles d'au moins 44 px ;
  - actions principales en bas ;
  - champs jamais masqués par le clavier ;
  - police d'au moins 16 px dans les champs ;
  - zones sûres respectées.
- **UI-02** [P1] — **Direction visuelle** sobre et chaleureuse, inspirée d'un cahier d'école corrigé :
  - papier clair, encre bleue pour les actions ;
  - soulignés de correction colorés selon la gravité, pointillés pour le « correct mais pas naturel » ;
  - une police pour l'interface en français, une autre pour le contenu anglais ;
  - modes clair et sombre.
- **UI-03** [P1] — **Robustesse :**
  - états de chargement explicites ;
  - **aucune saisie perdue** : brouillons enregistrés localement à chaque pause de frappe ;
  - messages d'erreur clairs et actionnables.
- **UI-04** [P1] — **Accessibilité** : contrastes suffisants, libellés, navigation au clavier.
- **UI-05** [tout] — Textes d'interface en français sans faute ; contenu anglais sans faute.

## 14. Méthode de travail (PROC)

- **PROC-01** — **Travail par phases** (voir [ROADMAP.md](ROADMAP.md)), avec un arrêt à la fin de chaque phase. L'arrêt donne :
  - ce qui a été fait et les résultats des tests ;
  - les décisions prises et leurs raisons ;
  - les points que Codex doit relire en priorité ;
  - ce que l'utilisateur doit faire lui-même (comptes, clés, déploiement) ;
  - la phase suivante.
  - On n'enchaîne **jamais** sur la phase suivante sans accord.
- **PROC-02** — **Déroulé d'une phase :**
  1. explorer, planifier, implémenter, tester ;
  2. relire son propre diff comme un relecteur exigeant, corriger ;
  3. mettre à jour la documentation ;
  4. faire des commits Git atomiques, avec des messages clairs en anglais (Conventional Commits).
- **PROC-03** — Avant d'utiliser une bibliothèque ou une API externe, vérifier sa documentation actuelle plutôt que sa mémoire.
- **PROC-04** — **Exigence ambiguë ou contradictoire** : choisir l'option la plus prudente, la noter dans DECISIONS.md et la signaler à l'arrêt de la phase. On ne pose une question que si le choix est irréversible ou coûteux.
- **PROC-05** — Ne jamais désactiver un test, une règle de lint ou une vérification de types pour faire passer une phase. Ne jamais marquer une phase terminée si une vérification échoue.
- **PROC-06** — Fichiers et fonctions de taille raisonnable ; la logique pure (testée) est séparée de l'interface.
- **PROC-07** — Scripts de vérification (`typecheck`, `lint`, `test`, `test:e2e`) et intégration continue GitHub Actions qui les lance.

## 15. Interdits (NO)

- **NO-01** — Aucun appel au modèle non déclenché par l'utilisateur.
- **NO-02** — Aucune clé API côté client ou dans le dépôt.
- **NO-03** — Aucune carte non résoluble présentée.
- **NO-04** — Aucun contenu du socle pédagogique généré à la volée sans relecture.
- **NO-05** — Aucune formulation correcte signalée comme erreur.
- **NO-06** — Aucune perte de saisie ou de données, y compris lors d'une mise à jour de l'app ou d'une migration de schéma.
- **NO-07** — Aucune gamification envahissante.
- **NO-08** — Aucun passage à la phase suivante sans l'accord de l'utilisateur.
