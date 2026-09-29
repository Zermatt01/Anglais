# Feuille de route

Le travail avance par phases. À la fin de chaque phase, on **s'arrête** et on fait un rapport : ce qui a été fait, les résultats des tests, les décisions, les points à relire par Codex, les actions de l'utilisateur et la phase suivante (PROC-01). On n'enchaîne **jamais** sur la phase suivante sans l'accord de l'utilisateur (NO-08).

Une case n'est cochée que si la fonctionnalité est livrée **et** que toutes les vérifications passent (PROC-05).

**Revues** (D-059) : chaque phase reçoit une revue de Codex, puis au plus une contre-revue des corrections, sauf s'il reste un point bloquant.

**Phase en cours : aucune. La phase 2 est livrée (en attente de la revue de Codex et des actions de l'utilisateur du guide) ; la phase 3 attend l'accord de l'utilisateur.**

---

## Phase 0 — Fondations et documentation (aucune fonctionnalité)

- [x] Dépôt Git, `.gitignore` (dont `.env*` et `import-samples/`), fins de ligne LF
- [x] Projet Vite + React + TypeScript strict (page d'attente)
- [x] ESLint (règles typées, React, accessibilité, interdiction du SDK Anthropic côté client) et Prettier
- [x] Vitest (jsdom, Testing Library) et Playwright (émulation Pixel 7), tests de fumée
- [x] Scan de secrets (`check:secrets`) et script agrégé `check`
- [x] Intégration continue GitHub Actions
- [x] `docs/SPEC.md`, `docs/PEDAGOGY.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`
- [x] `CLAUDE.md` et `AGENTS.md`
- [x] Dépôt GitHub créé et poussé ; CI verte sur GitHub (confirmé par l'utilisateur)
- [x] Revue de Codex traitée (DECISIONS D-032 à D-035)

## Mises à jour entre les phases

- [x] Programme aligné sur les livres de Murphy, en 9 pistes ; notions ajoutées en phase 8 ; références « Pour aller plus loin » ; contenu original (documentation uniquement, DECISIONS D-036 à D-041)
- [x] Revue de Codex de cette mise à jour traitée (DECISIONS D-042)

## Phase 1 — Cœur local

- [x] Modèle de données Dexie et schémas Zod de toutes les tables locales (D-043, D-044) ; migrations de documents ; versions additives vérifiées par un test ; sauvegarde automatique avant montée de version (D-054)
- [x] Couche de répétition espacée autour de ts-fsrs 5.4 (API vérifiée, interface interne, D-048)
- [x] `isCardSolvable` (fonction pure testée, appliquée à toute création de carte, D-047)
- [x] Moteur de correction locale (normalisation, contractions, graphies, nombres, réparation des segments, D-046)
- [x] Règles ESLint de dépendance entre couches, avec leur test (D-050)
- [x] Squelette d'interface : navigation, accueil, réglages, thèmes clair et sombre, direction visuelle « cahier corrigé » (D-049, D-051, D-052)
- [x] PWA installable (manifeste, icônes, service worker en mode `prompt`, stockage persistant, D-055)
- [x] Brouillons de saisie enregistrés à chaque pause de frappe (D-053)
- [x] Export et import JSON complets, avec aperçu (D-054)
- [x] En-têtes de sécurité Vercel, testés sous la CSP de production (D-056)
- [x] Tests unitaires complets ; e2e (installation, hors ligne, réglages, brouillons, export et import)
- [x] **Arrêt** : déploiement sur Vercel et installation sur le téléphone expliqués dans [DEPLOYMENT.md](DEPLOYMENT.md)
- [x] Revue de Codex de la phase 1 traitée (D-057) : graphies attestées seulement, indices fléchis, enregistrements illisibles mis de côté (version 2 de la base), règle de couches par chemins résolus, _'s_ verbal après un nom
- [x] Contre-revue traitée (D-057) ; règles durables décidées par l'utilisateur : règles sur l'anglais (D-058) et processus de revue (D-059)

## Phase 2 — Serveur et IA

- [x] Supabase : migrations SQL versionnées (`sync_documents.id` en texte, D-044), RLS et droits explicites sur toutes les tables, testées dans PGlite (D-064) ; authentification par code e-mail, compte unique, inscriptions fermées (D-060)
- [x] Synchronisation local-first (file sortante alimentée par `writeRecord` et premier envoi complet, D-045 ; push/pull, « le plus récent gagne » arbitré par le serveur, union des événements ; règle pour la clé unique du lexique ; D-063)
- [x] CSP : adresse exacte du projet Supabase dans `connect-src` (`npm run configure:csp`), build refusé si elle manque (D-065) ; l'adresse réelle s'ajoute pendant le guide
- [x] Edge Function mandataire : clé en secret, JWT vérifié par la fonction, e-mail autorisé, CORS, validation Zod, journal des coûts, plafond mensuel, limite de fréquence, idempotence (D-062, D-066)
- [x] Contrat IA partagé (`shared/ai`) : tâches, schémas, `models.ts`, `pricing.ts`, prompts versionnés, copie vérifiée pour Deno (D-061)
- [x] Client IA typé et écran « Consommation », avec le test de connexion (D-066, D-067)
- [x] Tests : SQL dans PGlite, synchronisation de deux appareils, Edge Function avec un faux modèle, vérification Deno en CI, e2e avec un faux serveur
- [x] **Arrêt** : guide pas à pas dans [DEPLOYMENT.md](DEPLOYMENT.md) (compte et projet Supabase, migrations, secrets, Claude Console et crédit, variables Vercel, vérifications)
- [ ] Actions de l'utilisateur : suivre le guide (sections 6 à 12), puis confirmer que la connexion, la synchronisation et le test de connexion à l'IA fonctionnent
- [ ] Revue de Codex de la phase 2

## Phase 3 — Parcours

- [ ] Moteur des cinq étapes, critères de passage et de retour
- [ ] Mise en conformité de la correction locale avec D-058, avant son premier usage par le socle : les traits d'union (aujourd'hui lus comme des espaces, ce qui accepte _follow-up_ pour le verbe _follow up_) et le rapprochement des formes fléchies (terminaisons génériques, qui rapprochent encore _united_ de _unit_), ramenés à des listes fermées avec leurs cas négatifs
- [ ] Schéma des exercices dans `src/domain/curriculum`, partagé par le socle et `generatedExercises` (D-043)
- [ ] Lecture audio des exemples, et choix de la voix et de la vitesse dans les Réglages (D-052)
- [ ] Taille du bundle, à traiter si besoin : à la fin de la phase 1, Vite signale un fichier JavaScript de 502,75 kB (157,5 kB compressé), au-delà de son seuil d'avertissement de 500 kB. En phase 2, le client Supabase est passé dans un fichier séparé (224 kB) et le fichier principal fait 521 kB (163 kB compressé, D-068). Le programme va l'alourdir : découper le code par écran (`React.lazy`) plutôt que relever le seuil (D-057)
- [ ] Test de positionnement par piste
- [ ] Frises chronologiques SVG
- [ ] Les 13 notions de phase 3 de la piste « Temps verbaux », dans l'ordre de PEDAGOGY §11, dont « just, already, yet et still » (socle ≥ 10 exercices par étape, doublement relu)
- [ ] Références « Pour aller plus loin » : schéma, affichage sous la leçon, test des unités contre `docs/references/murphy-contents.md` et PEDAGOGY §11, rempli pour les 13 notions (CUR-14)
- [ ] Génération d'exercices par l'IA sur demande, validée et conservée
- [ ] Test automatique du socle (bien formé, résoluble, ≥ 1 réponse attendue, relectures ; les deux graphies de `CONTEXT_DEPENDENT_SPELLINGS` présentes dans les variantes, D-057)
- [ ] Relecture séparée de tout le contenu pédagogique
- [ ] **Arrêt**
- [ ] Revue de Codex du code
- [ ] Revue de Codex dédiée à la justesse de l'anglais (leçons, exemples, réponses attendues et variantes), distincte de la revue du code (D-059)
- [ ] Relecture par l'utilisateur d'un échantillon d'exercices, avant de clore la phase (D-059)

## Phase 4 — Production écrite

- [ ] Prompts de correction versionnés (exemples contrastés, cas entièrement correct)
- [ ] Thème (trois paliers de consigne) et Journal
- [ ] Correction en deux temps, tournures non naturelles, version naturelle
- [ ] Rattachement des erreurs aux notions, règle lapsus ou lacune, pratique immédiate
- [ ] Création de cartes résolubles ; Reprises
- [ ] Séance du jour
- [ ] Carnet de règles et Mon lexique
- [ ] **Arrêt**

## Phase 5 — Qualité des corrections

- [ ] Banc d'essai (écran développeur, coût affiché avant lancement)
- [ ] Signalements sur les corrections et les cartes
- [ ] Tableau de bord
- [ ] Estimation du niveau (locale, recalibrage sur demande)
- [ ] Diagnostic initial
- [ ] **Arrêt** : expliquer comment lancer le banc d'essai et quoi regarder

## Phase 6 — Oral

- [ ] Réponse chronométrée
- [ ] 4/3/2
- [ ] Shadowing et classification des sons ; shadowing ciblé
- [ ] Simulation d'entretien
- [ ] Repli vers la dictée du clavier
- [ ] **Arrêt**

## Phase 7 — E-mail et import

- [ ] Mode e-mail guidé (scénarios, plan, brouillon, révision, modèle commenté)
- [ ] Import de l'ancienne app à partir de l'exemple de `import-samples/`
- [ ] **Arrêt**

## Phase 8 — Programme complet

Toutes les notions marquées P8 dans PEDAGOGY §11, avec la même exigence de qualité, le même test du socle et leurs références Murphy :

- [ ] Temps verbaux, notions de phase 8 : _have_ et _have got_ ; _used to_ ; futur continu et futur antérieur
- [ ] Passif, modaux et discours indirect
- [ ] Questions et auxiliaires
- [ ] Verbe + _-ing_ ou _to_
- [ ] Noms, pronoms et déterminants
- [ ] Adjectifs, adverbes et ordre des mots
- [ ] Prépositions et _phrasal verbs_
- [ ] Phrases complexes
- [ ] Vocabulaire professionnel
- [ ] Unités Murphy sans notion (PEDAGOGY §11.3) : rattachées ou exclues avec leur raison ; test de couverture complète
- [ ] **Arrêt**
