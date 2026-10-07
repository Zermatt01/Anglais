# Architecture

Ce document décrit l'architecture cible. Chaque phase la met en œuvre progressivement ; ce qui n'existe pas encore est marqué de sa phase de livraison. Les arbitrages sont justifiés dans [DECISIONS.md](DECISIONS.md) et les exigences référencées dans [SPEC.md](SPEC.md).

## Sommaire

1. [Vue d'ensemble](#1-vue-densemble)
2. [Arborescence cible](#2-arborescence-cible)
3. [Couches et règles de dépendance](#3-couches-et-règles-de-dépendance)
4. [Modèle de données](#4-modèle-de-données)
5. [Programme et contenu](#5-programme-et-contenu)
6. [Correction locale](#6-correction-locale)
7. [Synchronisation](#7-synchronisation)
8. [Flux d'un appel IA](#8-flux-dun-appel-ia)
9. [Sécurité](#9-sécurité)
10. [Coûts](#10-coûts)
11. [PWA et hors ligne](#11-pwa-et-hors-ligne)
12. [Parole](#12-parole)
13. [Stratégie de tests](#13-stratégie-de-tests)

---

## 1. Vue d'ensemble

```
┌──────────────────── Téléphone (Chrome Android, PWA installée) ────────────────────┐
│  UI React (src/features, src/ui)                                                   │
│     │                                                                               │
│     ▼                                                                               │
│  Logique pure (src/domain) : FSRS, correction locale, résolubilité, parcours,      │
│     │                         lapsus/lacune, niveau, série                         │
│     ▼                                                                               │
│  Données (src/data) : Dexie / IndexedDB = SOURCE DE VÉRITÉ ── file de synchro      │
│                                                                    │                │
│  Service worker (vite-plugin-pwa) : app + programme en cache → hors ligne          │
└────────────────────────────────────────────────────────────────────┼────────────────┘
          ▲ fichiers statiques                                        │ HTTPS + JWT
          │                                                           ▼
   ┌──────┴──────┐                          ┌──────────────── Supabase ───────────────────┐
   │   Vercel    │                          │ Auth (code à usage unique par e-mail)       │
   │ (build de   │                          │ Postgres + RLS : sync_documents, sync_events│
   │  GitHub)    │                          │                  ai_calls                   │
   └─────────────┘                          │ Edge Function « ai » : validation, budget,  │
                                            │   fréquence, prompts, journal des coûts ────┼──► API Anthropic
                                            └─────────────────────────────────────────────┘      (clé en secret)
```

Principes :

- **L'appareil est la source de vérité.** Le serveur n'est qu'un miroir de synchronisation (et une sauvegarde) et un mandataire IA. Sans réseau, tout fonctionne sauf l'IA et la synchronisation.
- **Aucun appel IA sans geste explicite** de l'utilisateur (COST-01). Toute fonction qui appelle l'IA est déclenchée par un gestionnaire d'événement UI, jamais par un effet, un minuteur ou une synchronisation.
- **Tout passe par Zod aux frontières** : lecture depuis IndexedDB, réponses de l'Edge Function et du modèle, import JSON, données du programme (ARC-05).

## 2. Arborescence cible

```
src/
  app/            Coquille : démarrage (ouverture de la base), routage, barre de navigation,
                  thème, bandeau de mise à jour du SW, gestion d'erreurs globale
  ui/             Composants visuels réutilisables et styles : thème « cahier corrigé »
                  (theme.css), boutons, champs, avis, marques de correction, frises SVG et choix (P3)
  features/       Un dossier par module (P1 : home, settings, data-transfer, not-found ;
                  P2 : account, usage ; P3 : path, speech ; ensuite review, theme, journal, email,
                  oral, lexicon, rules, dashboard, quality, diagnostic, import, session), plus ce que
                  les écrans partagent : app-services.ts (services fournis par la coquille),
                  drafts/ (brouillons), sync/ (contrôleur et déclencheurs de la synchronisation),
                  ai/ (montants et messages d'erreur de l'IA)
  domain/         Logique pure, sans React, Dexie ni réseau :
                    primitives.ts, taxonomy.ts, settings.ts   types et schémas communs
                    speech.ts     interface de synthèse vocale et choix de la voix (P3)
                    srs/          adaptateur ts-fsrs (interface interne), notes, maîtrise
                    correction/   normalisation, contractions, graphies, évaluation, segments
                    cards/        modèle des cartes, isCardSolvable
                    sync/         règles de fusion (import en P1, synchronisation en P2)
                    curriculum/   catalogue fermé des notions, états, schéma des exercices et
                                  checkExercise, moteur des cinq étapes et du positionnement (P3)
                    errors/       règle lapsus/lacune, statistiques de catégories (P4)
                    level/        estimation du niveau (P5)
                    streak/       série et joker (P4)
                    session/      composition de la séance du jour (P4)
  data/           database.ts (versions Dexie), tables.ts (registre des tables), schemas/
                  (un schéma Zod par table ; les tables locales dans local.ts), records.ts
                  (lecture et écriture validées, migrations de documents), repositories/,
                  transfer/ (export et import JSON), backup.ts (sauvegarde avant montée de
                  version), open.ts, sync/ (file sortante, protocole, application des
                  changements reçus, moteur de synchronisation, P2)
  content/        Programme rédigé : titres et références (catalog.ts), leçons, exercices du
                  socle et positionnement par notion, chargés à la demande (validés Zod, P3)
  services/       storage/ (stockage persistant) ; backend/ (client Supabase, compte,
                  transport de synchronisation, P2) ; ai-client/ (client de l'Edge Function, P2) ;
                  speech/ (P3 et P6)
  test/           Configuration et utilitaires de test (base en mémoire, fixtures, rendu)
public/           Icônes de la PWA, générées par scripts/generate-icons.ts
eslint.layers.ts  Règles de dépendance entre couches (§3)
vercel.json       En-têtes de sécurité et réécritures (§9)
shared/
  ai/             Contrat IA partagé client ↔ Edge Function : tasks.ts (tâches, schémas
                  d'entrée et de sortie), protocol.ts (requêtes, réponses, erreurs, consommation),
                  models.ts, pricing.ts, reasons.ts (combinaisons de raisons relues, D-081),
                  prompts/ (versionnés, jamais importés par le client)
supabase/
  config.toml     Réglages de la CLI : fonction « ai », carte d'imports
  migrations/     SQL versionné : synchronisation, journal des appels IA (RLS, droits, fonctions)
  functions/ai/   Edge Function mandataire (Deno) : index.ts (entrée), server.ts (assemblage),
                  handler.ts (traitement), auth.ts, cors.ts, config.ts, ledger.ts (journal),
                  model.ts (appel Anthropic), deno.json (dépendances épinglées)
  functions/_shared/ai/  Copie générée de shared/ai (npm run sync:shared, D-061)
  tests/          Tests des migrations et de la synchronisation dans PGlite (D-064)
e2e/              Tests Playwright (émulation mobile, faux serveur Supabase)
scripts/          Outils du dépôt (scan de secrets, copie de shared/ai, CSP…)
docs/             Documentation
```

`shared/ai` est importé par le client (contrat seulement, jamais les prompts) et, à travers sa copie dans `supabase/functions/_shared/ai`, par l'Edge Function. Un test vérifie que la copie est à jour (DECISIONS D-061).

## 3. Couches et règles de dépendance

```
features ──► ui
   │
   ├──────► domain ◄── data ◄── services
   │          ▲
   └──────► content (données, validées par des schémas du domaine)
```

- `domain` n'importe **rien** d'autre que lui-même, `zod` et `ts-fsrs` (seulement dans l'adaptateur `srs/`). Pas de React, pas de Dexie, pas de `fetch` ni de stockage, pas d'horloge implicite ni de hasard : la date courante est passée en paramètre, pour des tests déterministes.
- `data` et `services` implémentent des interfaces définies dans `domain` (par exemple `SpacedRepetitionScheduler`, plus tard `SpeechRecognizer`). Les types dont la logique pure a besoin (réglages, contenu des cartes, état FSRS) sont définis dans `domain`, et `data` y ajoute l'enveloppe de stockage.
- `data` est la seule couche qui importe Dexie ; `features` lit les données réactives avec `dexie-react-hooks`, à travers les dépôts.
- `ui` n'importe ni `data`, ni `services`, ni `features` ; `content` n'importe que `domain`.
- `features` orchestre : lit via `data`, calcule via `domain`, affiche via `ui`. `app` (la coquille) peut tout importer.
- Ces règles sont imposées par ESLint (`eslint.layers.ts`, DECISIONS D-050 et D-057). Une règle locale, `layers/layer-imports`, résout chaque chemin avant d'en déterminer la couche : aucune écriture du chemin ne lui échappe. Elle vérifie les imports statiques, les `export … from`, les `import()` dynamiques (un chemin calculé est refusé) et les `typeof import()` dans les types. Un test vérifie qu'elle refuse les imports interdits, y compris les contournements connus, et que la configuration réelle l'applique. Les noms de dossiers de couche sont réservés.
- Le SDK Anthropic est interdit dans `src/` (règle ESLint et scan de secrets).
- Hors de `src/` : `shared/` n'importe aucune couche de `src/`, ni le SDK Anthropic, ni React, Dexie ou Supabase, et reste pur comme le domaine ; `supabase/functions/` n'importe aucune couche de `src/`. `src/` n'importe ni `supabase/`, ni les prompts de `shared/ai` (D-017). Les tests de `supabase/tests/` peuvent importer `src/` : ils vérifient la synchronisation du client contre les vraies fonctions SQL.

## 4. Modèle de données

### 4.1 Conventions

| Champ           | Type                  | Rôle                                                                                                                                                                                                                                |
| --------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`            | `string` (UUID v4)    | Généré sur l'appareil (`crypto.randomUUID()`) : aucun aller-retour serveur pour créer un objet. Exceptions : `settings`, `notionProgress` et `ruleNotes` ont une clé naturelle, identique sur tous les appareils (DECISIONS D-044). |
| `createdAt`     | `number` (epoch ms)   | Création.                                                                                                                                                                                                                           |
| `updatedAt`     | `number` (epoch ms)   | Dernière modification. Strictement croissant pour un même document : `max(maintenant, précédent + 1)`.                                                                                                                              |
| `deletedAt`     | `number \| null`      | Suppression logique (tombstone), nécessaire à la synchronisation.                                                                                                                                                                   |
| `schemaVersion` | `number`              | Version du schéma Zod du document, pour les migrations.                                                                                                                                                                             |
| dates « jour »  | `string` `YYYY-MM-DD` | Jour **local** de l'appareil (série, minutes de la semaine).                                                                                                                                                                        |

**Classes de synchronisation :**

- **D** : document, fusionné en « le plus récent gagne » (§7) ;
- **E** : événement, en ajout seul, fusionné par union ;
- **L** : local, jamais synchronisé ;
- **C** : contenu embarqué dans le code, pas en base.

### 4.2 Tables Dexie

| Table                   | Classe | Clé et index principaux                                 | Contenu                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Phase   |
| ----------------------- | ------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `settings`              | D      | `id` (singleton `"settings"`)                           | Variante d'anglais (`en-GB`/`en-US`), voix et vitesse de lecture, objectif quotidien, plafonds de cartes, autocorrection activée, fréquence de l'e-mail, thème, profil de l'apprenant (domaines, remarques libres).                                                                                                                                                                                                                                                                   | P1      |
| `notionProgress`        | D      | `notionId`                                              | Statut (`not_started`, `in_progress`, `to_consolidate`, `acquired`), étape courante (1–5), état de rappel, dates d'entrée dans l'étape, d'acquisition et de dernière régression.                                                                                                                                                                                                                                                                                                      | P3      |
| `exerciseAttempts`      | E      | `id` ; `[notionId+step]`, `at`                          | Exercice (`exerciseId`, source `core` ou `generated`), réponse, résultat (`correct`, `acceptable`, `incorrect`), correcteur (`local`, `ai`, `user`), indice utilisé, contexte (`path`, `immediate-practice`, `placement`, `diagnostic`, `theme`), durée.                                                                                                                                                                                                                              | P3      |
| `generatedExercises`    | D      | `id` ; `[notionId+step]`                                | Exercice généré par l'IA et validé (même schéma que le socle), modèle, version du prompt, statut (`active`, `reported`). Jamais régénéré inutilement (COST-09).                                                                                                                                                                                                                                                                                                                       | P3      |
| `cards`                 | D      | `id` ; `[status+due]`, `notionId`, `sourceErrorId`      | Type (`error`, `cloze`, `collocation`, `notion`, `pronunciation`), recto (sens en français, indice, texte à trou, infinitif, contexte, catégorie de son), tentative précédente et surlignages, réponses (canonique + variantes), lien de leçon, statut (`active`, `suspended`, `mastered`) et motif de suspension, état FSRS sérialisé, `due` (epoch ms, dupliqué pour l'index), origine.                                                                                             | P1/P4   |
| `reviewLogs`            | E      | `id` ; `cardId`, `at`                                   | Réponse, résultat, correcteur, note FSRS (1–4), note ajustée par l'utilisateur, journal FSRS sérialisé, durée.                                                                                                                                                                                                                                                                                                                                                                        | P1/P4   |
| `productions`           | D      | `id` ; `module`, `createdAt`                            | Module (`theme`, `journal`, `email`, `path-produce`, `diagnostic`, `oral`, `interview`), consigne (FR ou EN), texte, intention en français, correction validée (sortie IA versionnée), autocorrection, statut (`draft`, `submitted`, `corrected`, `correction-failed`).                                                                                                                                                                                                               | P4      |
| `errors`                | D      | `id` ; `productionId`, `[category+at]`, `[notionId+at]` | Catégorie, notion, segment (texte et positions, ou `null` si introuvable), correction, règle, gravité, confiance, diagnostic (`lapsus`, `lacune`, `unstudied`), confirmé ou signalé. Classe D, car le signalement modifie l'erreur.                                                                                                                                                                                                                                                   | P4      |
| `lexicon`               | D      | `id` ; `&key` (clé normalisée unique)                   | Expression, sens en français, exemple, source (correction, expression du jour, manuel, import), carte associée.                                                                                                                                                                                                                                                                                                                                                                       | P4      |
| `ruleNotes`             | D      | `category`                                              | Note personnelle par catégorie. Le Carnet de règles est surtout **calculé** à partir de `errors`.                                                                                                                                                                                                                                                                                                                                                                                     | P4      |
| `activity`              | E      | `id` ; `day`                                            | Minutes d'activité par module et par jour. Série, joker et minutes de la semaine en sont **déduits** (pas stockés).                                                                                                                                                                                                                                                                                                                                                                   | P4      |
| `levelEstimates`        | E      | `id` ; `[skill+at]`                                     | Compétence (`writing`, `speaking`, `lexicon`, `grammar`), valeur (1–6 par demi-niveaux), niveau affiché, source (`local`, `ai`, `diagnostic`), justification.                                                                                                                                                                                                                                                                                                                         | P5      |
| `reports`               | D      | `id` ; `[targetType+targetId]`                          | Signalement : cible (correction, erreur, carte, exercice), motif, commentaire, statut.                                                                                                                                                                                                                                                                                                                                                                                                | P5      |
| `diagnosticRuns`        | D      | `id`                                                    | Diagnostic en cours ou terminé (reprenable) : étape, réponses, résultat.                                                                                                                                                                                                                                                                                                                                                                                                              | P5      |
| `pronunciationAttempts` | E      | `id` ; `at`                                             | Texte attendu, texte reconnu, mots manqués et leurs catégories de sons. Les sons faibles en sont **déduits**.                                                                                                                                                                                                                                                                                                                                                                         | P6      |
| `emailSessions`         | D      | `id` ; `updatedAt`                                      | Scénario, étape (`plan`, `draft`, `revision`, `model`, `done`), plan, objet, brouillon, production liée (reprenable).                                                                                                                                                                                                                                                                                                                                                                 | P7      |
| `drafts`                | L      | `key` (par exemple `theme:<itemId>`)                    | Brouillon de saisie, enregistré à chaque pause de frappe (UI-03). Supprimé après envoi réussi ; pour une réponse du Parcours, dans la transaction même de la réponse (D-082).                                                                                                                                                                                                                                                                                                         | P1      |
| `syncOutbox`            | L      | `++seq` ; `[table+docId]`                               | Enregistrements synchronisés écrits localement et pas encore envoyés : une entrée par enregistrement, écrite dans la même transaction que lui (D-063).                                                                                                                                                                                                                                                                                                                                | P2      |
| `syncMeta`              | L      | `key`                                                   | Compte synchronisé, curseur de lecture, signature de schéma de l'app, date de la dernière synchronisation complète.                                                                                                                                                                                                                                                                                                                                                                   | P2      |
| `usageSnapshot`         | L      | `id` (singleton)                                        | Dernier état de l'écran Consommation (plafond, coûts du mois, du jour et par tâche), pour un affichage hors ligne.                                                                                                                                                                                                                                                                                                                                                                    | P2      |
| `quarantine`            | L      | `id` ; `[table+key]`                                    | Enregistrement copié tel quel avant d'être remplacé ou supprimé : enregistrement illisible, enregistrement reçu illisible, ou version locale qu'une version reçue remplace alors qu'aucune autre copie ne la garde (conflit). Table et clé d'origine, enregistrement brut, raison, date. Exporté, jamais synchronisé ni relu par l'application ; listé dans **Réglages → Données**, et retiré du téléphone seulement après un export qui le contient (DECISIONS D-057, D-069, D-070). | P1 (v2) |

Toutes ces tables sont déclarées dès la version 1 de Dexie (DECISIONS D-043). La version 2 ajoute une table locale `quarantine`, exportée : un enregistrement illisible y est copié tel quel avant qu'une écriture le remplace ou le supprime (`setAsideIfUnreadable`, DECISIONS D-057). C'est le cas aujourd'hui pour les brouillons et les réglages.

Chaque table a :

- un schéma Zod (`src/data/schemas/<table>.ts` ; les tables locales sont regroupées dans `local.ts`) ;
- une entrée du registre `src/data/tables.ts` : classe de synchronisation, clé primaire, version du schéma, fonctions de migration, présence dans l'export.

Les enregistrements sont lus avec le type `unknown`, ce qui oblige à les valider. Toute lecture passe par `parseRecord` (`src/data/records.ts`) : l'enregistrement est d'abord monté à la version courante du schéma par les fonctions de migration, puis validé. Un enregistrement illisible est isolé et signalé, jamais propagé silencieusement, et jamais écrasé par une lecture. Toute écriture passe par `writeRecord`, qui refuse un enregistrement invalide.

Les schémas des tables des phases 3 à 7 sont des premières versions, ajustables par leur phase tant qu'aucune donnée n'y est écrite. Les contenus dont le format appartient à une phase ultérieure sont acceptés comme JSON valide (`z.json()`), puis validés par leur schéma définitif dans cette phase.

### 4.3 Tables Postgres (phase 2)

Le SQL de référence est dans `supabase/migrations/` ; en voici l'essentiel (contraintes de format omises).

```sql
-- Documents fusionnés en « le plus récent gagne » (classe D)
create table sync_documents (
  user_id        uuid   not null default auth.uid() references auth.users on delete cascade,
  collection     text   not null,            -- nom de la table Dexie
  id             text   not null,            -- UUID, ou clé naturelle (settings, notionProgress, ruleNotes : D-044)
  doc            jsonb  not null,
  schema_version int    not null,
  updated_at     bigint not null,            -- updatedAt client (epoch ms)
  deleted        boolean not null default false,
  server_seq     bigint not null,            -- séquence globale, curseur de lecture
  primary key (user_id, collection, id)
);

-- Événements en ajout seul (classe E)
create table sync_events (
  user_id     uuid   not null default auth.uid() references auth.users on delete cascade,
  collection  text   not null,
  id          uuid   not null,
  doc         jsonb  not null,
  schema_version int not null,
  occurred_at bigint not null,
  server_seq  bigint not null,
  primary key (user_id, collection, id)
);

-- Journal des appels IA (écrit uniquement par l'Edge Function)
create table ai_calls (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users on delete cascade,
  request_id         uuid not null,          -- idempotence (double tap)
  created_at         timestamptz not null default now(),
  task               text not null,
  model              text not null,
  prompt_version     text not null,
  status             text not null,          -- reserved | ok | invalid_output | truncated | model_refusal
                                             -- | error (refused_budget et refused_rate ne sont plus écrits, D-069)
  attempt            smallint not null default 1,  -- 2 : l'unique nouvelle tentative

  input_tokens       int, output_tokens int,
  cache_creation_input_tokens int, cache_read_input_tokens int,
  reserved_cost_usd  numeric(10,6) not null default 0,
  cost_usd           numeric(10,6),
  latency_ms         int,
  error_code         text,
  unique (user_id, request_id, attempt)
);
```

- `server_seq` est tiré d'une séquence commune, affectée par un déclencheur à chaque insertion ou mise à jour. Le curseur de lecture est ainsi monotone et indépendant des horloges.
- **RLS** activée sur les trois tables, droits accordés explicitement (D-064) :
  - `sync_documents` : `select`, `insert` et `update` limités à `user_id = auth.uid()` ; `sync_events` : `select` et `insert`. Pas de `delete` : on utilise des tombstones.
  - `ai_calls` : `select` seulement pour le propriétaire. Aucune écriture possible depuis le client ; l'Edge Function écrit avec la clé secrète (rôle `service_role`).
  - Le rôle `anon` n'a aucun droit.
- **Historique** (`sync_document_history`, D-070) : un déclencheur copie chaque version d'un document avant qu'un envoi l'écrase ; les dix dernières versions remplacées de chaque document sont gardées. Lecture seule pour le propriétaire, aucune écriture possible depuis le client. La fonction du déclencheur, `private.sync_keep_replaced_version`, s'exécute avec les droits de son propriétaire dans un schéma que l'API n'expose pas.
- **Fonctions SQL** (`security invoker` sauf ce déclencheur, `search_path` vide) :
  - `sync_push(documents, events)` et `sync_pull(cursor, limit)`, appelées par le client connecté (§7) ;
  - `ai_reserve_call`, `ai_complete_call` et `ai_usage_summary`, réservées à `service_role` (§8, §10.3). `ai_reserve_call` a été remplacée par une migration ultérieure : les migrations appliquées ne sont jamais modifiées.
- **Aucun texte de l'apprenant** dans `ai_calls` : uniquement des métadonnées et des compteurs.
- Les migrations sont testées dans PGlite (`supabase/tests/`), avec les rôles de Supabase ; un test général vérifie la RLS de chaque table et l'absence de droits pour `anon` (D-064).

## 5. Programme et contenu

Le programme est **du contenu versionné dans le code** (CUR-01), relu par un humain, jamais généré à la volée (NO-04).

Le schéma des exercices est défini dans `src/domain/curriculum`, et non dans `src/content` : la table `generatedExercises` (couche données) valide les exercices générés avec le même schéma que le socle, et la couche données ne peut pas importer le contenu (DECISIONS D-043).

```
src/content/
  schema.ts                 Schémas Zod : Lesson, Timeline, PlacementQuestion, CoreExercise (exercice
                            du domaine + identifiant + marques de relecture), NotionContent
  books.ts                  Livres de référence : identifiant, titre, édition, libellé affiché, nombre d'unités
  references.ts             Schéma des références et formatReferences
  catalog.ts                Titres des pistes et des 50 notions, références des notions livrées (D-073)
  builders.ts               Fonctions d'écriture des exercices (identifiant, étape, relectures)
  notions/<notion-id>/
    lesson.ts               Étape 1 : usage, tableau de forme, contraste, pièges, exemples, frise
    exercises.ts            Socle des étapes 2 à 4 (≥ 10 exercices par étape, CUR-06)
    placement.ts            4 questions de positionnement (CUR-08)
    review.ts               Dates des deux relectures (CUR-06, CUR-13)
    index.ts                Contenu de la notion, avec ses amorces de l'étape 5
  index.ts                  Registre : ajouter une notion = ajouter un dossier + une ligne ici ; chaque
                            notion est un fichier séparé, chargé à la demande et validé (D-078)
```

Le catalogue (identifiants, pistes, phases) est une liste fermée du domaine (`src/domain/curriculum/notion-id.ts`, D-073) ; les titres et les références sont du contenu. Des tests vérifient l'un et l'autre contre PEDAGOGY §11 et `docs/references/murphy-contents.md`.

**Types d'exercices** (union discriminée par `kind`) :

| `kind`               | Étape | Contenu                                                                                     | Correction       |
| -------------------- | ----- | ------------------------------------------------------------------------------------------- | ---------------- |
| `choice-with-reason` | 2     | Phrase avec trou, options de forme, forme correcte, options de raison (FR), raison correcte | Locale           |
| `fill-verb`          | 3     | Phrase avec trou, verbe à l'infinitif, sens en français, réponses acceptées                 | Locale           |
| `transform`          | 3     | Phrase source, consigne (FR), réponses acceptées                                            | Locale           |
| `place-word`         | 3     | Phrase, mot à placer, réponses acceptées (phrases complètes)                                | Locale           |
| `translate`          | 4     | Phrase française, réponses acceptées (canonique + variantes), indice, difficulté (1–3)      | Locale, sinon IA |

Chaque exercice porte une explication en français, montrée après la réponse, et, sauf pour les choix, des erreurs anticipées : chacune doit être fausse dans toutes les lectures plausibles (D-035). `checkExercise` refuse tout exercice qui pourrait déclarer fausse une réponse juste ; une réponse à trou est remise dans sa phrase avant la comparaison (D-074).

Chaque exercice du socle porte un identifiant stable (`<notion-id>/s<étape>/<nn>`) et deux marques de relecture datées (`review: { first, second }`), exigées par le test du socle (CUR-06, CUR-11). Une réponse qui ne correspond à rien de prévu n'est jamais déclarée fausse : l'apprenant la compare à la réponse de référence (D-074 ; l'IA pourra la vérifier en phase 4, D-076).

**Identifiants de notions.** La liste ordonnée des pistes et des notions, avec leurs identifiants, leur phase et leurs références, est dans [PEDAGOGY.md §11](PEDAGOGY.md#11-programme--pistes-notions-et-références), **source unique**. Les identifiants sont en anglais, en kebab-case, et **stables une fois livrés**. Ils commencent par le préfixe de leur piste, parfois abrégé (`tense-`, `adj-`, `prep-`, `vocab-`…) : la correspondance piste → préfixe est la colonne « Préfixe des notions » de PEDAGOGY §11.1. Ceux des notions hors phase 3 ont été renommés le 2026-09-27, avant toute implémentation (DECISIONS D-036). Ces identifiants forment la liste fermée transmise au modèle (AI-03) : toute sortie IA qui cite un autre identifiant est rejetée.

**Références « Pour aller plus loin »** (CUR-14, DECISIONS D-038, livrées en phase 3) :

```ts
type BookId = 'essential' | 'grammar-in-use'; // libellés : « livre rouge », « livre bleu » (D-039)

interface NotionReference {
  book: BookId;
  units: number[]; // numéros d'unités, triés, sans doublon
}

// Dans Notion : references?: NotionReference[]  (au plus une entrée par livre)
```

- **Validation Zod** : chaque unité est un entier compris entre 1 et le nombre d'unités du livre, triée et sans doublon ; au plus une entrée par livre.
- **Test du contenu** (Vitest, phase 3). Il lit [docs/references/murphy-contents.md](references/murphy-contents.md) et vérifie trois points :
  - chaque unité citée existe dans la section du bon livre ;
  - les libellés et les nombres d'unités de `books.ts` correspondent à l'en-tête de ce fichier ;
  - les références du code sont identiques à celles de PEDAGOGY §11.

  En phase 8, il vérifiera aussi que chaque unité est rattachée à une notion ou listée dans PEDAGOGY §11.3.

- **Affichage** sous la leçon, par une fonction pure `formatReferences` testée :
  - « Pour aller plus loin : » suivi des références, livre rouge d'abord, séparées par « ; » ;
  - une unité : « livre rouge, unité 16 » ; deux unités : « unités 15 et 17 » ;
  - trois unités consécutives ou plus forment une plage : « unités 26 à 29 » ;
  - exemple complet : « Pour aller plus loin : livre rouge, unités 26 à 29 ; livre bleu, unités 19 à 23 et 25 ».
- **Aucun texte des livres** n'est affiché ni stocké : ni titre d'unité, ni extrait, ni exercice (CUR-15).

## 6. Correction locale

Corriger localement tout ce qui peut l'être (COST-02) repose sur un moteur pur (`src/domain/correction`), livré en phase 1 :

1. **Normalisation** (`normalize.ts`) :
   - minuscules et normalisation Unicode (NFKC) ;
   - apostrophes et guillemets typographiques unifiés ;
   - espaces multiples réduits ;
   - ponctuation ignorée, sauf l'apostrophe à l'intérieur d'un mot et le point décimal ;
   - séparateurs de milliers retirés (_6,000_ = _6000_) ;
   - un trait d'union fait partie du mot (_follow-up_ ≠ _follow up_), sauf une liste fermée de graphies soudées (_e-mail_ = _email_, _co-operate_ = _cooperate_) ; un tiret entre deux espaces est de la ponctuation (D-072).
2. **Contractions** (`contractions.ts`) :
   - chaque réponse est développée en un **ensemble** de formes équivalentes (_don't_ ↔ _do not_, _I'm_ ↔ _I am_, _can't_ ↔ _cannot_ ↔ _can not_) ;
   - les contractions ambiguës produisent plusieurs candidats : _'s_ → _is_ / _has_, _'d_ → _would_ / _had_ (et _did_ après un mot interrogatif) ;
   - après un nom, le _'s_ reste possessif, sauf si le mot suivant exclut un possessif (préposition, _not_, article… : _my manager's in the office_) ; après un pronom indéfini (_everyone's_), les deux lectures sont gardées ;
   - le nombre de lectures d'une réponse est borné (64) : au-delà, une réponse peut devenir `unknown`, jamais `incorrect`.
   - Deux réponses sont équivalentes si leurs ensembles se recoupent.
3. **Variantes** : la réponse est comparée à la réponse canonique et aux variantes acceptables. Les graphies britannique et américaine d'un même mot (`spelling.ts`, liste fermée de paires attestées) et les nombres de deux à vingt en lettres ou en chiffres sont ramenés à une forme canonique, **des deux côtés** de la comparaison : une formulation correcte n'est jamais une erreur (NO-05). Aucune règle ne rapproche une faute d'un mot correct (_exercize_ ≠ _exercise_). Les graphies qui dépendent de la fonction grammaticale (_practise_, _licence_, _analyses_) ne sont pas rapprochées : le contenu doit les lister dans ses variantes (`CONTEXT_DEPENDENT_SPELLINGS`). Règles et limites : DECISIONS D-046 et D-057.
4. **Résultat** (`evaluate.ts`) :
   - `correct` si une variante correspond, même si la réponse correspond aussi à une erreur connue (ce serait un défaut du contenu, détecté par ses tests) ;
   - `incorrect` si la réponse correspond à une erreur connue de l'exercice ;
   - sinon `unknown`, réponse vide comprise. Seule une réponse `unknown` peut, **sur action explicite**, être envoyée au modèle (étape 4, cartes, CARD-05).

Le même module fournit `containsInflectedPhrase` (`inflections.ts`), qui vérifie qu'un indice ne contient pas la réponse, même sous une autre forme (_meetings_ pour _meeting_, _go_ pour _went_) ; `isCardSolvable` et `checkExercise` s'en servent (DECISIONS D-047 et D-057). Deux mots ne sont rapprochés que s'ils appartiennent à une même famille d'une liste fermée (`word-families.ts`, D-072) : aucune terminaison n'est retirée par une règle.

La **réparation des segments** IA (AI-07) vit aussi dans ce module. Un segment signalé par le modèle est recherché tel quel dans le texte :

- s'il n'est pas trouvé tel quel, il est cherché en unifiant les apostrophes et guillemets typographiques, ce qui ne décale aucune position ;
- s'il y a plusieurs occurrences, on retient la plus proche de la position proposée ;
- s'il est introuvable, l'erreur est affichée sans surlignage ;
- les positions sont des index en unités UTF-16, ceux des chaînes JavaScript.

## 7. Synchronisation

La synchronisation (`src/data/sync/`) ne fonctionne que si un projet Supabase est configuré et que l'apprenant est connecté ; sinon, tout reste sur l'appareil. Elle n'appelle jamais le modèle (COST-01). Règles et raisons : DECISIONS D-063.

**Écriture locale.** `writeRecord` écrit un enregistrement synchronisé (classes D et E) **et** son entrée dans `syncOutbox`, dans la **même transaction** Dexie ; une transaction englobante doit donc inclure `syncOutbox`, sinon elle échoue. Aucune écriture n'échappe à la file, import JSON compris. Une seule entrée par enregistrement : une nouvelle écriture remplace l'entrée précédente par une entrée de numéro plus élevé. `writeRecord` refuse un document dont `updatedAt` n'augmente pas (D-069). Les tables locales (brouillons, `quarantine`, état de la synchronisation, `usageSnapshot`) ne sont jamais synchronisées.

Les règles de fusion sont des fonctions pures de `src/domain/sync/merge.ts` : `decideDocumentMerge` pour l'import JSON, `decideRemoteVersion` pour la synchronisation.

**Déclencheurs** (`src/features/sync/`) : ouverture de l'app, connexion, événement `online`, 5 secondes après la dernière écriture, bouton « Synchroniser maintenant ». Une seule synchronisation à la fois ; une demande faite pendant une synchronisation en déclenche une seule de plus.

**Compte.** La première synchronisation avec un compte met en file tous les enregistrements existants (D-045) ; un changement de compte remet le curseur à zéro et envoie tout de nouveau.

**Push** : les entrées de la file sont lues par lots de 200, avec les enregistrements qu'elles désignent tels qu'ils sont stockés, puis envoyées à la fonction `sync_push` (soumise à la RLS).

- Documents : `insert … on conflict do update … where excluded.updated_at > stored.updated_at`, ou à égalité si le `doc` sérialisé est plus grand (départage déterministe, le serveur seul arbitre). Les versions qui n'ont pas gagné sont renvoyées (`stale`) ; l'appareil les adopte si sa version n'a pas changé depuis l'envoi (contenu comparé à celui envoyé, D-069).
- Événements : `insert … on conflict do nothing`.
- Les envois d'un même utilisateur passent un par un (verrou consultatif) : les numéros de séquence suivent l'ordre des validations, et une lecture ne saute jamais une modification.
- Les entrées envoyées sont retirées de la file dans la transaction qui applique la réponse. Un enregistrement local illisible n'est jamais envoyé (il reste dans l'export).

**Pull** : `sync_pull(cursor, limit)` renvoie par lots de 200 les lignes dont `server_seq > cursor`, par ordre croissant. Chaque lot est appliqué dans une transaction qui fait aussi avancer le curseur.

- Documents : appliqués si le document local est absent ou illisible (il est alors mis de côté), ou si la version reçue est plus récente ; à `updatedAt` égal et contenu différent, la version du serveur l'emporte, sauf si la version locale attend d'être envoyée (son envoi sera arbitré par le serveur).
- Événements : insérés s'ils sont absents, jamais remplacés.
- Un enregistrement reçu illisible va en `quarantine`. Un enregistrement d'une version plus récente de l'app, ou d'une table inconnue, reste sur le serveur : quand la « signature de schéma » de l'app change (mise à jour), tout est relu depuis le début.
- Une entrée du lexique dont l'expression existe déjà localement sous un autre identifiant va en `quarantine` (clé unique, D-044).
- Avant qu'une version reçue la remplace, une version locale qu'aucune autre copie ne garde (modification pas encore envoyée, ou version concurrente de même `updatedAt`) est copiée dans `quarantine` : avec une horloge en retard, la version perdante peut être la plus récente (D-069). Le rapport les compte et les Réglages l'indiquent.
- Les changements reçus ne sont pas remis dans la file ; l'entrée d'une version locale remplacée en est retirée.
- Côté serveur, chaque version remplacée par un envoi est gardée dans `sync_document_history` (les dix dernières par document) : une version déjà envoyée puis dépassée par celle d'un appareil dont l'horloge avance reste récupérable (D-070).

**Conflits** : « le plus récent gagne » par document ; l'historique d'activité est fusionné par union des événements (DECISIONS D-015). Les brouillons ne sont jamais synchronisés.

**Tests.** Deux appareils (deux bases Dexie) se synchronisent à travers les vraies fonctions SQL dans PGlite (`supabase/tests/sync-engine.test.ts`) : premier envoi, changements d'un appareil à l'autre, égalités, union des événements, écriture pendant un envoi, coupure réseau, lots, changement de compte, enregistrements illisibles ou plus récents.

**Migrations de schéma** (NO-06) :

- Chaque document porte un `schemaVersion`. Des fonctions `upgrade` pures (v1 → v2 → …), testées sur des jeux de données des versions précédentes, sont appliquées à la lecture locale comme à la réception.
- Les versions Dexie sont **additives** : on ajoute des index ou des tables, on ne détruit jamais de données.
- Un test vérifie que chaque version Dexie est additive : aucune table retirée, aucune clé primaire changée, aucun index retiré (`findNonAdditiveChanges`).
- Avant toute montée de version Dexie, la base existante est ouverte telle quelle (mode dynamique de Dexie) et copiée en entier, au format d'export, dans une base séparée `anglais-backups` (`src/data/backup.ts`). Les trois copies les plus récentes sont gardées et téléchargeables depuis les Réglages. Si la copie échoue, la montée de version n'a pas lieu. Au démarrage normal, seule la version est lue (DECISIONS D-054).
- L'app demande `navigator.storage.persist()` au démarrage pour éviter la purge d'IndexedDB par Android, et affiche l'état dans les Réglages (DECISIONS D-019).

**Export et import JSON** (MOD-12, `src/data/transfer/`, DECISIONS D-054) :

- enveloppe versionnée `{ app, formatVersion, exportedAt, databaseVersion, tables }`, validée par Zod ; chaque table y figure telle qu'elle est stockée, enregistrements illisibles compris ;
- l'export contient toutes les tables de données de l'apprenant, brouillons et enregistrements mis de côté (`quarantine`) compris, mais pas l'état technique de la synchronisation ;
- un aperçu est présenté avant la confirmation : ajouts, mises à jour, éléments déjà à jour, illisibles et ignorés, par table ;
- l'import **fusionne** selon les mêmes règles que la synchronisation, dans une seule transaction (tout ou rien) ; il n'efface jamais, n'écrase jamais un enregistrement local illisible, et importe suspendue une carte non résoluble (motif `unsolvable`) ;
- une entrée du lexique dont l'expression existe déjà sous un autre identifiant est laissée de côté (clé unique) ;
- un fichier d'une version plus récente de l'application est refusé avec un message clair.

## 8. Flux d'un appel IA

```
Utilisateur          Client (PWA)                    Edge Function « ai »                     Anthropic
    │ touche           │                                   │                                      │
    │ « Corriger » ───►│ 1. production enregistrée         │                                      │
    │                  │    localement (aucune perte)      │                                      │
    │                  │ 2. entrée validée (Zod)           │                                      │
    │                  │── POST {task, input, requestId} ─►│ 3. CORS, JWT vérifié par la fonction,│
    │                  │   + JWT + clé publique            │    e-mail autorisé                   │
    │                  │                                   │ 4. validation Zod de l'entrée        │
    │                  │                                   │ 5. idempotence (requestId)           │
    │                  │                                   │ 6. limite de fréquence (par minute)  │
    │                  │                                   │ 7. budget : réservation du coût max  │
    │                  │                                   │ 8. prompt versionné : préfixe stable │
    │                  │                                   │    en cache + partie variable ──────►│
    │                  │                                   │◄──────────── JSON structuré + usage ─│
    │                  │                                   │ 9. validation Zod (+ 1 nouvelle      │
    │                  │                                   │    tentative si sortie invalide)     │
    │                  │                                   │10. coût réel → ai_calls              │
    │                  │◄─ {output, costUsd, promptVersion}│                                      │
    │                  │11. validation Zod, réparation des segments,                              │
    │                  │    enregistrement (jamais redemandé), règles du domaine                  │
    │◄── feedback ─────│                                                                          │
```

Code : `supabase/functions/ai/handler.ts` (étapes 3 à 10), `src/services/ai-client/ai-client.ts` (client). Les étapes 5 à 7 sont faites en une transaction par la fonction SQL `ai_reserve_call`, une seule à la fois par utilisateur ; l'étape 10 par `ai_complete_call`.

Détails :

- **Étape 3, identité** (D-062). La fonction vérifie elle-même le JWT de l'utilisateur (`@supabase/server/core` : signature contre les clés du projet, émetteur et audience imposés), puis que son e-mail figure dans `AI_ALLOWED_EMAILS`. La vérification de la plateforme (`verify_jwt`) est désactivée : elle accepte aussi la clé publique et peut bloquer la requête CORS préalable.
- **Étape 5, idempotence.** Un `requestId` déjà reçu est refusé (`duplicate_request`), sans appel ni coût. Le client en fournit un par action de l'utilisateur.
- **Étape 7, budget.** La somme du mois UTC (coûts réels + réservations en cours), augmentée du coût **maximal** de l'appel, ne doit pas dépasser le plafond (COST-06). Le coût maximal se calcule à partir de l'entrée estimée (un token pour deux caractères, plus 1 000 tokens de marge) et de `max_tokens`. On insère ensuite une ligne `reserved`. En cas de refus, le message est clair : « Plafond mensuel de 10 USD atteint (9,87 USD utilisés). Les fonctions IA reprendront le 1er octobre. Tout le reste de l'app fonctionne. »
- **Étape 8, appel.** Via `@anthropic-ai/sdk` : `client.messages.create()` avec `output_config.format = zodOutputFormat(schéma)` (DECISIONS D-010, D-066). La réponse est validée par la fonction plutôt que par `messages.parse()`, qui perdrait le décompte des tokens d'une réponse invalide. La tâche fixe `max_tokens`, le modèle et la réflexion (envoyée explicitement). Pas de nouvelle tentative automatique du SDK (`maxRetries: 0`), délai maximal de 90 secondes.
  - Le **préfixe stable** du système porte `cache_control` : rôle, taxonomie avec définitions, identifiants de notions, règles, exemples.
  - La **partie variable** vient après : profil de l'apprenant, texte, consigne (COST-03).
- **Étape 9, sortie invalide.** Si la sortie est invalide (`stop_reason` `max_tokens` ou `refusal`, ou échec de validation), **une seule** nouvelle tentative est faite, sauf pour `max_tokens`, qu'une nouvelle tentative identique ne corrigerait pas. Chaque tentative est réservée, journalisée et comptée dans le budget (DECISIONS D-016). Si l'échec persiste, le client affiche une version dégradée utilisable : la production reste enregistrée, avec le statut `correction-failed` et un bouton « Réessayer ».
- **Étape 10, coût réel.** Calculé d'après l'usage renvoyé (§10.1). Une erreur renvoyée par l'API coûte zéro ; un appel à l'issue inconnue (délai dépassé, connexion perdue) est compté à son coût maximal. Si le journal ne peut pas être mis à jour, la réservation reste, au coût maximal : le plafond tient toujours.
- **Erreurs.** Chaque refus a un code (`protocol.ts`) et un message en français (`src/features/ai/messages.ts`).
- **Hors ligne.** Le bouton d'action IA reste visible mais inactif, avec la mention : « Connexion nécessaire pour la correction. Ta réponse est enregistrée. »
- **Phase 2.** La tâche `connection-check` : un appel minimal, lancé par le bouton « Tester la connexion » de l'écran Consommation, qui vérifie toute la chaîne (D-066).
- **Phase 3.** La tâche `generate-exercises` (D-079), sur le bouton « Créer 6 exercices avec l'IA », proposé quand tous les exercices d'une étape sont faits. Le client envoie la notion, l'étape, la variante, les domaines et les phrases déjà vues ; il vérifie chaque exercice reçu et ne garde que ceux qui passent `checkExercise`, avec, pour un choix, l'une des combinaisons de raisons relues du socle (D-081). Ils sont stockés dans `generatedExercises` avec le modèle et la version du prompt, et revérifiés à chaque lecture : un exercice importé ou synchronisé qui échoue n'est jamais montré. Le coût affiché avant la demande est son maximum, nouvelle tentative comprise, et la réponse rapporte le coût de toutes les tentatives (D-081).

## 9. Sécurité

- **Clé Anthropic** (SEC-01) : uniquement dans les secrets de l'Edge Function (`ANTHROPIC_API_KEY`), jamais journalisée. La règle ESLint et `npm run check:secrets` (contenu indexé, copie de travail et nouveaux fichiers) interdisent tout accès direct à Anthropic depuis `src/` et toute clé dans le dépôt. En CI, gitleaks analyse en plus **tout l'historique Git** (DECISIONS D-033).
- **Clés Supabase** (DECISIONS D-060) : le client reçoit au build `VITE_SUPABASE_URL` et la clé publique `VITE_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`), publique par conception : la protection repose sur la RLS. Une clé d'une autre forme est refusée. La clé secrète (`sb_secret_…`) n'existe que dans l'environnement de l'Edge Function, fourni par Supabase.
- **Authentification** (DECISIONS D-013, D-060, D-062) :
  - un code à usage unique envoyé par e-mail, jamais un lien ; les e-mails d'authentification passent par Resend en SMTP, avec une clé limitée à l'envoi, enregistrée seulement dans Supabase (D-071) ;
  - le compte unique est créé dans le tableau de bord Supabase, les inscriptions sont fermées dès le départ, et l'app ne crée jamais de compte ;
  - l'Edge Function vérifie elle-même le JWT (clés du projet, émetteur, audience), puis que l'e-mail figure dans `AI_ALLOWED_EMAILS` (défense en profondeur contre la dépense).
- **RLS** sur toutes les tables, avec des politiques et des droits explicites (SEC-02, D-064). Un test vérifie, pour toute migration, la RLS de chaque table, l'absence de droits pour `anon`, le `search_path` de chaque fonction et l'absence de fonction `security definer`.
- **Validation** : l'Edge Function refuse toute requête dont la tâche est inconnue ou dont l'entrée ne passe pas son schéma Zod (tailles maximales incluses). Le client n'envoie **jamais** de prompt, seulement `{ task, input }` (DECISIONS D-017).
- **CORS** : seules les origines de `AI_ALLOWED_ORIGINS` (le domaine Vercel de production et, si besoin, un serveur de développement) reçoivent les en-têtes CORS de l'Edge Function.
- **Journaux** : aucun texte de l'apprenant ; seulement identifiants, tâche, compteurs de tokens et codes d'erreur.
- **En-têtes** (`vercel.json`, DECISIONS D-056) :
  - Content-Security-Policy : `default-src`, `script-src`, `style-src`, `worker-src`, `manifest-src` et `connect-src` limités à `'self'`, sans `unsafe-inline` ni `unsafe-eval` ; `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`. `connect-src` autorise en plus l'adresse **exacte** du projet Supabase, écrite par `npm run configure:csp` ; un build qui appellerait un projet non autorisé échoue (DECISIONS D-065).
  - `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy: same-origin`, `Strict-Transport-Security`.
  - `Permissions-Policy` : micro autorisé pour l'origine seule, caméra et géolocalisation refusées.
  - Réécriture des adresses internes vers `index.html`, sauf `/assets/` (un fichier absent reste une erreur 404) ; `sw.js` jamais mis en cache, fichiers de `/assets/` en cache permanent (noms hachés).
  - `vite preview` envoie les mêmes en-têtes, lus dans `vercel.json` : les tests e2e tournent sous la CSP de production, et une violation les fait échouer. Un test unitaire vérifie le contenu de `vercel.json`.
- **Données personnelles** (SEC-03, SEC-04) :
  - `import-samples/` est exclu du dépôt ;
  - aucun traceur ni outil d'analyse ;
  - les exports restent sur l'appareil ;
  - le dépôt ne contient pas de profil identifiant (DECISIONS D-020).

## 10. Coûts

### 10.1 Configuration

- `shared/ai/models.ts` est le **seul** fichier où l'on choisit, par tâche : le modèle, `max_tokens`, la réflexion et l'effort, et la mise en cache (ARC-09).
- `shared/ai/pricing.ts` contient le tableau de prix (USD par million de tokens), vérifié le 2026-09-29. Les montants sont calculés en millionièmes de dollar et arrondis au-dessus :

| Modèle                      | Entrée | Sortie | Écriture en cache (TTL 5 min) | Lecture en cache | Préfixe minimum cacheable |
| --------------------------- | ------ | ------ | ----------------------------- | ---------------- | ------------------------- |
| `claude-haiku-4-5-20251001` | 1,00   | 5,00   | 1,25 × entrée                 | 0,10 × entrée    | 4 096 tokens              |
| `claude-sonnet-5`           | 2,00   | 10,00  | 1,25 × entrée                 | 0,10 × entrée    | 1 024 tokens              |

Le coût d'un appel se calcule ainsi :

```
coût = entrée non cachée × prix_entrée
     + tokens écrits en cache × prix_entrée × 1,25
     + tokens lus en cache × prix_entrée × 0,10
     + sortie × prix_sortie
```

Les tokens de réflexion sont facturés comme de la sortie.

### 10.2 Tâches prévues (valeurs initiales, calibrées en phases 2 et 5)

Chaque phase ajoute à `shared/ai` les tâches dont elle a besoin. La phase 2 livre `connection-check` : Haiku 4.5, 64 tokens de sortie, sans réflexion ni cache, déclenchée par « Tester la connexion » (D-066). La phase 3 livre `generate-exercises` (D-079).

| Tâche                | Modèle    | `max_tokens` | Réflexion                                    | Cache du préfixe                    | Déclencheur                                                       |
| -------------------- | --------- | ------------ | -------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------- |
| `correct-production` | Sonnet 5  | 2 000        | Désactivée ou effort bas (à calibrer, D-012) | Oui                                 | « Corriger » (Thème, Journal, Produire, E-mail, étape 4 inconnue) |
| `check-card-answer`  | Haiku 4.5 | 300          | —                                            | Non (préfixe < 4 096 tokens, D-011) | « Vérifier » sur une réponse de carte `unknown`                   |
| `classify-sounds`    | Haiku 4.5 | 400          | —                                            | Non                                 | Fin d'un exercice de shadowing, si des mots sont manqués          |
| `generate-exercises` | Sonnet 5  | 4 000        | Effort bas                                   | Oui                                 | « Créer 6 exercices » quand l'étape est épuisée (livrée, D-079)   |
| `diagnose`           | Sonnet 5  | 2 500        | Effort bas                                   | Oui                                 | Fin du diagnostic initial                                         |
| `recalibrate-level`  | Sonnet 5  | 1 200        | Effort bas                                   | Oui                                 | « Recalibrer mon niveau »                                         |
| `review-email`       | Sonnet 5  | 2 500        | Effort bas                                   | Oui                                 | « Réviser mon e-mail »                                            |
| `interview-turn`     | Sonnet 5  | 600          | Désactivée                                   | Oui                                 | Réponse de l'apprenant dans la simulation d'entretien             |

**Ordre de grandeur** d'une correction : préfixe de 3 500 tokens en cache, 300 tokens variables, 700 tokens de sortie. Elle coûte environ 0,016 USD au premier appel (écriture en cache), puis environ 0,008 USD dans les 5 minutes suivantes (lecture). Le plafond de 10 USD couvre donc plus de 600 corrections par mois.

### 10.3 Garde-fous

- **Fréquence** : `AI_RATE_LIMIT_PER_MINUTE` (défaut 6), compté sur `ai_calls`.
- **Plafond mensuel** : `AI_MONTHLY_BUDGET_USD` (défaut 10), avec réservation préalable du coût maximal, ce qui garantit le plafond même en cas d'appels concurrents.
- **Idempotence** : un `requestId` déjà reçu est refusé, quelle que soit sa date (D-066). Le client en fournit un par action de l'utilisateur : la même action envoyée deux fois ne coûte rien.
- **Refus** : les refus pour fréquence ou plafond ne sont pas écrits dans `ai_calls`, qui ne grossit donc qu'avec des appels réels ; ils restent dans les journaux de l'Edge Function (D-069).
- **Réutilisation** : les corrections et les exercices générés sont enregistrés localement, et leur résultat n'est jamais redemandé.
- **Écran « Consommation »** (COST-08, D-067) : coût du jour (fuseau du téléphone), du mois (mois UTC du plafond) et par tâche, avec le plafond configuré, lus par une requête `GET` à l'Edge Function, qui interroge `ai_calls` pour l'utilisateur vérifié ; aucun modèle n'est appelé. Hors ligne, le dernier état connu est affiché avec sa date.
- **Vérification du cache** : le journal conserve `cache_read_input_tokens`. Si ce compteur reste à zéro sur des appels rapprochés, un invalidateur silencieux est à chercher.

## 11. PWA et hors ligne

- **vite-plugin-pwa** en mode `generateSW` (Workbox) : précache de l'app (scripts, styles, `index.html`, manifeste, icônes), y compris les écrans et les notions chargés à la demande, chacun dans son fichier (D-078). Toute adresse interne ouverte hors ligne reçoit `index.html` (`navigateFallback`). L'app est entièrement utilisable hors ligne, sauf l'IA et la synchronisation (ARC-01). Le client Supabase est un fichier séparé, chargé pendant l'ouverture de la base et précaché lui aussi (DECISIONS D-068).
- **Manifeste** :
  - nom, nom court, `lang: "fr"`, `id`, `start_url` et `scope` à `/` ;
  - `display: "standalone"` ;
  - couleurs de thème et de fond (le papier du thème clair) ;
  - icônes 192 et 512 px, dont une version _maskable_, plus une icône Apple et un favicon SVG. Elles sont générées à partir d'un seul dessin par `npm run generate:icons` (`scripts/generate-icons.ts`) et versionnées dans `public/` (DECISIONS D-055).
- **Enregistrement** du service worker par l'application (`virtual:pwa-register/react`), jamais par un script en ligne, que la CSP bloquerait.
- **Mises à jour** : `registerType: "prompt"` (DECISIONS D-018). Une nouvelle version s'annonce par un bandeau « Nouvelle version disponible », avec « Mettre à jour » et « Plus tard ». L'app ne se recharge jamais d'elle-même, et tous les brouillons en cours sont enregistrés avant le rechargement (`flushAllDrafts`). La disponibilité hors ligne n'est pas annoncée par un bandeau, qui masquerait le bas de l'écran (DECISIONS D-055).
- **Stockage persistant** : l'app appelle `navigator.storage.persist()` au démarrage et affiche son état dans les Réglages, avec un bouton pour le redemander.
- **Thème** : clair, sombre ou automatique ; la couleur de la barre du navigateur suit le thème choisi.

## 12. Parole

Des interfaces du domaine, avec des implémentations interchangeables dans `src/services/speech` :

- **`SpeechRecognizer`** : `isAvailable()`, `start({ lang, continuous })`, événements (partiel, final, fin, erreur), `stop()`.
  - Implémentation `WebSpeechRecognizer` (`SpeechRecognition` / `webkitSpeechRecognition`), avec redémarrage automatique après un silence pendant une réponse chronométrée.
  - Repli : saisie par la **dictée du clavier** Android, via un champ texte accompagné d'une consigne (ARC-08).
- **`SpeechSynthesizer`** (livré en phase 3, D-077) : `speak(text, { variant, voiceId, rate })`, par la synthèse Web Speech (`src/services/speech/web-speech-synthesizer.ts`). Le domaine propose les voix anglaises, celles de la variante choisie d'abord, et choisit une voix de repli si la voix enregistrée a disparu. Les exemples des leçons se lisent d'un bouton ; voix et vitesse se règlent dans les Réglages.
- **`PronunciationAssessor`** : interface **non implémentée** pour un futur service d'évaluation phonétique (par exemple Azure Speech).

En attendant, la mesure est une **approximation** (MOD-06(f)) :

- une comparaison mot à mot entre le texte attendu et le texte reconnu ;
- les mots manqués sont rattachés à des catégories de sons, par des règles locales et, si besoin, par `classify-sounds` ;
- débit et hésitations sont estimés à partir des horodatages des résultats de reconnaissance.

**Limites connues sur Chrome Android** (DECISIONS D-028) :

- la reconnaissance passe par les serveurs de Google : il faut du réseau, et l'audio quitte l'appareil ;
- elle s'arrête sur les silences ;
- elle ne fournit pas d'horodatage par mot.

L'écran le dit clairement.

## 13. Stratégie de tests

| Niveau                  | Outil                    | Portée                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logique pure            | Vitest                   | Tout `src/domain`, les contrats de `shared/ai` (schémas, prix, calcul de coût et de budget), le scan de secrets. Horloge injectée, aucun réseau.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Données                 | Vitest + fake-indexeddb  | Dépôts, écriture dans la file de synchronisation dans la même transaction, migrations (jeux de données des versions précédentes), export et import.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Contenu                 | Vitest                   | **Test du socle** (CUR-11) : chaque exercice est conforme au schéma, résoluble, avec au moins une réponse attendue, deux marques de relecture et un identifiant de notion valide ; ≥ 10 exercices par étape ; aucune phrase répétée ; questions de positionnement vérifiées comme les exercices ; les notions livrées sont exactement celles de la phase et celles que l'IA peut compléter. **Test des références** (CUR-14) : unités existantes dans `docs/references/murphy-contents.md` et identiques à PEDAGOGY §11.                                                                                                                                         |
| Serveur                 | Vitest + PGlite, Deno    | Migrations SQL dans PGlite, avec les rôles de Supabase : RLS, droits, `sync_push`/`sync_pull`, réservation, plafond, fréquence, idempotence (`supabase/tests/`). Synchronisation de deux appareils à travers ces fonctions. Edge Function avec un faux modèle : CORS, JWT (clés générées pour le test), refus, nouvelle tentative, coûts journalisés, sous le vrai SQL. `deno check` de la fonction en CI.                                                                                                                                                                                                                                                       |
| Composants              | Vitest + Testing Library | Comportements clés de l'interface : coquille et navigation, réglages, brouillons, export et import, bandeau de mise à jour, connexion par code, état de la synchronisation, écran Consommation (aucun appel au modèle à l'ouverture), Parcours (leçon, lecture audio, exercices, réponse non prévue, retour à la leçon, positionnement, création d'exercices seulement sur demande) ; plus tard, correction en deux temps. Les tests tournent sur une vraie base en mémoire (`src/test/render.tsx`), avec un faux serveur (`src/test/server.ts`).                                                                                                                |
| Configuration           | Vitest                   | Règles de couches ESLint (`scripts/eslint-layers.test.ts`), en-têtes et CSP de `vercel.json`, contrastes des couleurs du thème (`src/ui/theme.test.ts`), versions Dexie additives, copie à jour de `shared/ai` et versions de `deno.json`.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Parcours                | Playwright (Pixel 7)     | Parcours principaux sur le build de production, sous la CSP de production : installabilité vérifiée par Chrome, manifeste et icônes, hors ligne, réglages et brouillons conservés au rechargement, export puis import, connexion par code, synchronisation (envoi, réception, coupure réseau), écran Consommation et test de connexion, Parcours (leçon puis réponse conservée au rechargement, leçon hors ligne, positionnement) ; plus tard, séance du jour et révision d'une carte. Toute erreur de console fait échouer le test. **Le serveur et le modèle sont simulés** (`e2e/supabase-mock.ts`) : aucun test automatique n'appelle Supabase ni Anthropic. |
| Qualité des corrections | Banc d'essai (MOD-13)    | Lancé **manuellement**, depuis l'écran développeur, avec le coût affiché avant lancement. Il ne fait jamais partie de la CI.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

La CI (`.github/workflows/ci.yml`) exécute : vérification des types, lint, format, tests unitaires, scan de secrets, build, scan gitleaks de tout l'historique, vérification de l'Edge Function par Deno et tests e2e. Une phase n'est terminée que si tout passe (PROC-05).
