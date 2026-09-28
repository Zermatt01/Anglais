# Feuille de route

Le travail avance par phases. À la fin de chaque phase, on **s'arrête** et on fait un rapport : ce qui a été fait, les résultats des tests, les décisions, les points à relire par Codex, les actions de l'utilisateur et la phase suivante (PROC-01). On n'enchaîne **jamais** sur la phase suivante sans l'accord de l'utilisateur (NO-08).

Une case n'est cochée que si la fonctionnalité est livrée **et** que toutes les vérifications passent (PROC-05).

**Phase en cours : aucune. La phase 1 est terminée ; la phase 2 attend l'accord de l'utilisateur.**

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

## Phase 2 — Serveur et IA

- [ ] Supabase : migrations SQL versionnées (`sync_documents.id` en texte, D-044), RLS sur toutes les tables, authentification par code e-mail
- [ ] Synchronisation local-first (file sortante alimentée par `writeRecord` et premier envoi complet, D-045 ; push/pull, « le plus récent gagne », union des événements ; règle pour la clé unique du lexique, D-044)
- [ ] CSP : ajout de l'adresse Supabase à `connect-src` (D-056)
- [ ] Edge Function mandataire : clé en secret, validation Zod, journal des coûts, plafond mensuel, limite de fréquence, idempotence
- [ ] Contrat IA partagé (`shared/ai`) : tâches, schémas, `models.ts`, `pricing.ts`
- [ ] Client IA typé et écran « Consommation »
- [ ] **Arrêt** : guide pas à pas (compte et projet Supabase, secrets, Anthropic Console et crédit, variables Vercel)

## Phase 3 — Parcours

- [ ] Moteur des cinq étapes, critères de passage et de retour
- [ ] Schéma des exercices dans `src/domain/curriculum`, partagé par le socle et `generatedExercises` (D-043)
- [ ] Lecture audio des exemples, et choix de la voix et de la vitesse dans les Réglages (D-052)
- [ ] Test de positionnement par piste
- [ ] Frises chronologiques SVG
- [ ] Les 13 notions de phase 3 de la piste « Temps verbaux », dans l'ordre de PEDAGOGY §11, dont « just, already, yet et still » (socle ≥ 10 exercices par étape, doublement relu)
- [ ] Références « Pour aller plus loin » : schéma, affichage sous la leçon, test des unités contre `docs/references/murphy-contents.md` et PEDAGOGY §11, rempli pour les 13 notions (CUR-14)
- [ ] Génération d'exercices par l'IA sur demande, validée et conservée
- [ ] Test automatique du socle (bien formé, résoluble, ≥ 1 réponse attendue, relectures ; les deux graphies de `CONTEXT_DEPENDENT_SPELLINGS` présentes dans les variantes, D-057)
- [ ] Relecture séparée de tout le contenu pédagogique
- [ ] **Arrêt**

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
