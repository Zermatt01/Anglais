# Feuille de route

Le travail avance par phases. À la fin de chaque phase, on **s'arrête** et on fait un rapport : ce qui a été fait, les résultats des tests, les décisions, les points à relire par Codex, les actions de l'utilisateur et la phase suivante (PROC-01). On n'enchaîne **jamais** sur la phase suivante sans l'accord de l'utilisateur (NO-08).

Une case n'est cochée que si la fonctionnalité est livrée **et** que toutes les vérifications passent (PROC-05).

**Revues** (D-059) : chaque phase reçoit une revue de Codex, puis au plus une contre-revue des corrections, sauf s'il reste un point bloquant.

**Phase en cours : 4, revues traitées.** La phase 4 a été lancée le 2026-10-07 ; ses fonctionnalités sont livrées, les revues de Codex sont traitées (D-088) et toutes les vérifications passent. Le point ouvert de D-088 est tranché (D-089). Restent les contre-revues de Codex et l'accord de l'utilisateur pour la phase 5.

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
- [x] Actions de l'utilisateur : guide suivi (sections 6 à 12) ; connexion par code, synchronisation et test de connexion à l'IA confirmés sur le téléphone le 2026-09-30 (envoi des codes par Resend, D-071 ; clé Anthropic rattachée à un espace de travail)
- [x] Revue de Codex de la phase 2 traitée (D-069) : versions locales perdantes gardées à part, refus non journalisés, comparaison du contenu envoyé, `updatedAt` croissant imposé par `writeRecord`, test e2e instable corrigé
- [x] Contre-revue de Codex traitée (D-070) : historique des versions remplacées côté serveur, éléments mis de côté consultables et retirés seulement après export

## Phase 3 — Parcours

- [x] Moteur des cinq étapes, critères de passage et de retour (D-075) ; étape 5 : règle codée et testée, branchée en phase 4 avec la correction (D-076)
- [x] Mise en conformité de la correction locale avec D-058, avant son premier usage par le socle : traits d'union gardés dans le mot, sauf une liste fermée de graphies ; formes fléchies rapprochées par une liste fermée de familles de mots ; cas négatifs testés (D-072)
- [x] Schéma des exercices dans `src/domain/curriculum`, partagé par le socle et `generatedExercises` (D-043, D-074)
- [x] Lecture audio des exemples, et choix de la voix et de la vitesse dans les Réglages (D-052, D-077)
- [x] Taille du bundle : écrans et notions chargés à la demande (`React.lazy`) ; le plus gros fichier passe de 521 kB à 287 kB, sans relever le seuil (D-078)
- [x] Test de positionnement par piste : 4 questions par notion, réussite si toutes sont justes (D-075)
- [x] Frises chronologiques SVG
- [x] Les 13 notions de phase 3 de la piste « Temps verbaux », dans l'ordre de PEDAGOGY §11, dont « just, already, yet et still » : 13 leçons, 474 exercices (au moins 10 par étape), 52 questions de positionnement, doublement relus (D-074, D-080)
- [x] Références « Pour aller plus loin » : schéma, affichage sous la leçon, test des unités contre `docs/references/murphy-contents.md` et PEDAGOGY §11, rempli pour les 13 notions (CUR-14, D-073)
- [x] Génération d'exercices par l'IA sur demande, validée et conservée (D-079)
- [x] Test automatique du socle (bien formé, résoluble, ≥ 1 réponse attendue, deux relectures ; les deux graphies de `CONTEXT_DEPENDENT_SPELLINGS` exigées dans les variantes, D-057)
- [x] Relecture séparée de tout le contenu pédagogique (D-080)
- [x] **Arrêt** : rapport de fin de phase ; actions de l'utilisateur : pousser le code, redéployer l'Edge Function, relire un échantillon (DEPLOYMENT.md, section 16)
- [x] Revue de Codex du code traitée (D-081) : exercices générés vérifiés aussi à la lecture, combinaisons de raisons relues imposées à l'IA, positionnement qu'un échec d'enregistrement ne vide plus, coût affiché de la génération qui compte la nouvelle tentative
- [x] Revue de Codex dédiée à la justesse de l'anglais traitée (D-081) : présent simple de commentaire, présent continu d'habitude, variantes américaines, leçon du futur
- [x] Relecture par l'utilisateur d'un échantillon d'exercices : rien à signaler (2026-10-07)
- [x] Résultat d'un exercice affiché seulement une fois la réponse enregistrée, brouillon gardé jusque-là (D-081)
- [x] Contre-revues de Codex traitées (D-082) : _It rains!_ en erreur anticipée, brouillon d'une réponse tapée supprimé dans la transaction de la réponse

## Phase 4 — Production écrite

- [x] Prompts de correction versionnés (exemples contrastés, cas entièrement correct) : `correct-production@1` et `check-card-answer@1`, schémas dans les limites des sorties structurées, vérifiés par test (D-083)
- [x] Thème (trois paliers de consigne, 78 phrases relues deux fois) et Journal (24 questions) (D-084)
- [x] Correction en deux temps, tournures non naturelles, version naturelle ; sortie du modèle revue avant tout affichage (D-083)
- [x] Rattachement des erreurs aux notions, règle lapsus ou lacune, pratique immédiate (D-085, D-086)
- [x] Création de cartes résolubles ; Reprises, avec vérification d'une réponse inattendue par le modèle rapide (D-085)
- [x] Étapes 4 et 5 corrigées par l'IA, acquisition des notions et cartes de notion (D-086, remplace D-076)
- [x] Séance du jour, lue dans l'activité du jour (D-084)
- [x] Carnet de règles et Mon lexique (D-085)
- [x] Tests : contrat IA, domaine, dépôts, écrans avec un faux serveur, e2e (journal corrigé puis carte revue, Thème hors ligne)
- [x] **Arrêt** : rapport de fin de phase ; actions de l'utilisateur : pousser le code, redéployer l'Edge Function, essayer une correction (DEPLOYMENT.md, section 17)
- [x] Revue de Codex du code traitée (D-088) : principe général (ce que dit l'IA ne change la progression qu'une fois vérifié par l'app), emploi de la notion de l'étape 5 prouvé par des motifs fermés, erreur introuvable sans effet, cartes faites de phrases entières avec une réponse calculée par l'app, enregistrement réessayé sans nouvel appel, temps d'une traduction compté une fois, coûts maximaux arrondis vers le haut ; prompt `correct-production@2`
- [x] Revue de Codex dédiée à la justesse de l'anglais traitée (D-088) : consigne de for/since/ago t/02, réponse _How long have you been waiting for?_ retirée, virgules entre deux propositions, confiance et titre d'exemple du prompt ; erreurs anticipées avec _at the moment_ gardées
- [x] Essai du Journal par l'utilisateur : rien à signaler (2026-10-08)
- [x] Exercices créés par l'IA : une réussite compte pour passer l'étape, un échec jamais ; il devient un point à vérifier, avec la réponse attendue et « Signaler » (D-089, décision de l'utilisateur)

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
