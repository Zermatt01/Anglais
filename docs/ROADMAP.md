# Feuille de route

Le travail avance par phases. À la fin de chaque phase, on **s'arrête** et on fait un rapport : ce qui a été fait, les résultats des tests, les décisions, les points à relire par Codex, les actions de l'utilisateur et la phase suivante (PROC-01). On n'enchaîne **jamais** sur la phase suivante sans l'accord de l'utilisateur (NO-08).

Une case n'est cochée que si la fonctionnalité est livrée **et** que toutes les vérifications passent (PROC-05).

**Phase en cours : Phase 0, terminée, en attente de validation.**

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

## Phase 1 — Cœur local

- [ ] Modèle de données Dexie et schémas Zod de toutes les tables locales
- [ ] Couche de répétition espacée autour de ts-fsrs (API vérifiée, interface interne)
- [ ] `isCardSolvable` (fonction pure testée, appliquée à toute création de carte)
- [ ] Moteur de correction locale (normalisation, contractions, variantes)
- [ ] Règles ESLint de dépendance entre couches
- [ ] Squelette d'interface : navigation, accueil, réglages, thèmes clair et sombre, direction visuelle « cahier corrigé »
- [ ] PWA installable (manifeste, icônes, service worker en mode `prompt`, stockage persistant)
- [ ] Brouillons de saisie enregistrés à chaque pause de frappe
- [ ] Export et import JSON complets
- [ ] En-têtes de sécurité Vercel
- [ ] Tests unitaires complets ; e2e (installation, hors ligne)
- [ ] **Arrêt** : expliquer le déploiement sur Vercel et l'installation sur le téléphone

## Phase 2 — Serveur et IA

- [ ] Supabase : migrations SQL versionnées, RLS sur toutes les tables, authentification par code e-mail
- [ ] Synchronisation local-first (file sortante, push/pull, « le plus récent gagne », union des événements)
- [ ] Edge Function mandataire : clé en secret, validation Zod, journal des coûts, plafond mensuel, limite de fréquence, idempotence
- [ ] Contrat IA partagé (`shared/ai`) : tâches, schémas, `models.ts`, `pricing.ts`
- [ ] Client IA typé et écran « Consommation »
- [ ] **Arrêt** : guide pas à pas (compte et projet Supabase, secrets, Anthropic Console et crédit, variables Vercel)

## Phase 3 — Parcours

- [ ] Moteur des cinq étapes, critères de passage et de retour
- [ ] Test de positionnement par piste
- [ ] Frises chronologiques SVG
- [ ] Piste « Temps verbaux » complète, dont « just, already, yet et still » (socle ≥ 10 exercices par étape, doublement relu)
- [ ] Génération d'exercices par l'IA sur demande, validée et conservée
- [ ] Test automatique du socle (bien formé, résoluble, ≥ 1 réponse attendue, relectures)
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

- [ ] Pistes « Structure de la phrase », « Mots pièges » et « Communication professionnelle », avec la même exigence de qualité et le même test du socle
- [ ] **Arrêt**
