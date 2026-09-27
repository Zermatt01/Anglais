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
  app/            Coquille : routage, fournisseurs, gestion d'erreurs globale, mise à jour du SW
  ui/             Composants visuels réutilisables (boutons, feuilles, surlignage, frises SVG)
  features/       Un dossier par module : review, path, theme, journal, email, oral, lexicon,
                  rules, dashboard, settings, usage, quality, diagnostic, import, session
  domain/         Logique pure, sans React, Dexie ni réseau :
                    srs/          adaptateur ts-fsrs (interface interne)
                    correction/   normalisation, variantes, contractions, réparation de segments
                    cards/        isCardSolvable, fabriques de cartes
                    curriculum/   moteur des cinq étapes, critères de passage, positionnement
                    errors/       règle lapsus/lacune, statistiques de catégories
                    level/        estimation du niveau
                    streak/       série et joker
                    session/      composition de la séance du jour
  data/           Base Dexie, schémas Zod des tables, dépôts (repositories), migrations,
                  sync/ (file sortante, push/pull, fusion)
  content/        Programme rédigé : pistes, notions, leçons, exercices du socle (validés Zod)
  services/       ai-client/ (client typé de l'Edge Function), speech/, storage/ (persistance)
  test/           Configuration et utilitaires de test
shared/
  ai/             Contrat IA partagé client ↔ Edge Function : tâches, schémas d'entrée et de
                  sortie (Zod), prompts versionnés, models.ts, pricing.ts
supabase/
  migrations/     SQL versionné (schéma, RLS, fonctions de synchro)
  functions/ai/   Edge Function mandataire (Deno)
e2e/              Tests Playwright (émulation mobile)
scripts/          Outils du dépôt (scan de secrets…)
docs/             Documentation
```

`shared/ai` est importé par l'Edge Function (Deno) et par le client (schémas uniquement). La faisabilité de cet import depuis Deno est à vérifier en phase 2 ; à défaut, un script copiera le dossier dans `supabase/functions/_shared`, et la CI vérifiera que la copie est à jour (DECISIONS D-030).

## 3. Couches et règles de dépendance

```
features ──► ui
   │
   ├──────► domain ◄── data ◄── services
   │          ▲
   └──────► content (données, validées par des schémas du domaine)
```

- `domain` n'importe **rien** d'autre que lui-même, `zod` et `ts-fsrs` (via l'adaptateur `srs/`). Pas de React, pas de Dexie, pas de `fetch`, pas d'horloge implicite : la date courante est passée en paramètre, pour des tests déterministes.
- `data` et `services` implémentent des interfaces définies dans `domain` (par exemple `CardRepository`, `SpeechRecognizer`).
- `features` orchestre : lit via `data`, calcule via `domain`, affiche via `ui`.
- Ces règles seront imposées par ESLint (`no-restricted-imports` par dossier) dès la phase 1.
- Le SDK Anthropic est interdit dans `src/` (règle ESLint et scan de secrets, déjà actifs).

## 4. Modèle de données

### 4.1 Conventions

| Champ           | Type                  | Rôle                                                                                                   |
| --------------- | --------------------- | ------------------------------------------------------------------------------------------------------ |
| `id`            | `string` (UUID v4)    | Généré sur l'appareil (`crypto.randomUUID()`) : aucun aller-retour serveur pour créer un objet.        |
| `createdAt`     | `number` (epoch ms)   | Création.                                                                                              |
| `updatedAt`     | `number` (epoch ms)   | Dernière modification. Strictement croissant pour un même document : `max(maintenant, précédent + 1)`. |
| `deletedAt`     | `number \| null`      | Suppression logique (tombstone), nécessaire à la synchronisation.                                      |
| `schemaVersion` | `number`              | Version du schéma Zod du document, pour les migrations.                                                |
| dates « jour »  | `string` `YYYY-MM-DD` | Jour **local** de l'appareil (série, minutes de la semaine).                                           |

**Classes de synchronisation :**

- **D** : document, fusionné en « le plus récent gagne » (§7) ;
- **E** : événement, en ajout seul, fusionné par union ;
- **L** : local, jamais synchronisé ;
- **C** : contenu embarqué dans le code, pas en base.

### 4.2 Tables Dexie

| Table                   | Classe | Clé et index principaux                                 | Contenu                                                                                                                                                                                                                                                                                                                                                                                   | Phase |
| ----------------------- | ------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| `settings`              | D      | `id` (singleton `"settings"`)                           | Variante d'anglais (`en-GB`/`en-US`), voix et vitesse de lecture, objectif quotidien, plafonds de cartes, autocorrection activée, fréquence de l'e-mail, thème, profil de l'apprenant (domaines, remarques libres).                                                                                                                                                                       | P1    |
| `notionProgress`        | D      | `notionId`                                              | Statut (`not_started`, `in_progress`, `to_consolidate`, `acquired`), étape courante (1–5), état de rappel, dates d'entrée dans l'étape, d'acquisition et de dernière régression.                                                                                                                                                                                                          | P3    |
| `exerciseAttempts`      | E      | `id` ; `[notionId+step]`, `at`                          | Exercice (`exerciseId`, source `core` ou `generated`), réponse, résultat (`correct`, `acceptable`, `incorrect`), correcteur (`local`, `ai`, `user`), indice utilisé, contexte (`path`, `immediate-practice`, `placement`, `diagnostic`, `theme`), durée.                                                                                                                                  | P3    |
| `generatedExercises`    | D      | `id` ; `[notionId+step]`                                | Exercice généré par l'IA et validé (même schéma que le socle), modèle, version du prompt, statut (`active`, `reported`). Jamais régénéré inutilement (COST-09).                                                                                                                                                                                                                           | P3    |
| `cards`                 | D      | `id` ; `[status+due]`, `notionId`, `sourceErrorId`      | Type (`error`, `cloze`, `collocation`, `notion`, `pronunciation`), recto (sens en français, indice, texte à trou, infinitif, contexte, catégorie de son), tentative précédente et surlignages, réponses (canonique + variantes), lien de leçon, statut (`active`, `suspended`, `mastered`) et motif de suspension, état FSRS sérialisé, `due` (epoch ms, dupliqué pour l'index), origine. | P1/P4 |
| `reviewLogs`            | E      | `id` ; `cardId`, `at`                                   | Réponse, résultat, correcteur, note FSRS (1–4), note ajustée par l'utilisateur, journal FSRS sérialisé, durée.                                                                                                                                                                                                                                                                            | P1/P4 |
| `productions`           | D      | `id` ; `module`, `createdAt`                            | Module (`theme`, `journal`, `email`, `path-produce`, `diagnostic`, `oral`, `interview`), consigne (FR ou EN), texte, intention en français, correction validée (sortie IA versionnée), autocorrection, statut (`draft`, `submitted`, `corrected`, `correction-failed`).                                                                                                                   | P4    |
| `errors`                | D      | `id` ; `productionId`, `[category+at]`, `[notionId+at]` | Catégorie, notion, segment (texte et positions, ou `null` si introuvable), correction, règle, gravité, confiance, diagnostic (`lapsus`, `lacune`, `unstudied`), confirmé ou signalé. Classe D, car le signalement modifie l'erreur.                                                                                                                                                       | P4    |
| `lexicon`               | D      | `id` ; `&key` (clé normalisée unique)                   | Expression, sens en français, exemple, source (correction, expression du jour, manuel, import), carte associée.                                                                                                                                                                                                                                                                           | P4    |
| `ruleNotes`             | D      | `category`                                              | Note personnelle par catégorie. Le Carnet de règles est surtout **calculé** à partir de `errors`.                                                                                                                                                                                                                                                                                         | P4    |
| `activity`              | E      | `id` ; `day`                                            | Minutes d'activité par module et par jour. Série, joker et minutes de la semaine en sont **déduits** (pas stockés).                                                                                                                                                                                                                                                                       | P4    |
| `levelEstimates`        | E      | `id` ; `[skill+at]`                                     | Compétence (`writing`, `speaking`, `lexicon`, `grammar`), valeur (1–6 par demi-niveaux), niveau affiché, source (`local`, `ai`, `diagnostic`), justification.                                                                                                                                                                                                                             | P5    |
| `reports`               | D      | `id` ; `[targetType+targetId]`                          | Signalement : cible (correction, erreur, carte, exercice), motif, commentaire, statut.                                                                                                                                                                                                                                                                                                    | P5    |
| `diagnosticRuns`        | D      | `id`                                                    | Diagnostic en cours ou terminé (reprenable) : étape, réponses, résultat.                                                                                                                                                                                                                                                                                                                  | P5    |
| `pronunciationAttempts` | E      | `id` ; `at`                                             | Texte attendu, texte reconnu, mots manqués et leurs catégories de sons. Les sons faibles en sont **déduits**.                                                                                                                                                                                                                                                                             | P6    |
| `emailSessions`         | D      | `id` ; `updatedAt`                                      | Scénario, étape (`plan`, `draft`, `revision`, `model`, `done`), plan, objet, brouillon, production liée (reprenable).                                                                                                                                                                                                                                                                     | P7    |
| `drafts`                | L      | `key` (par exemple `theme:<itemId>`)                    | Brouillon de saisie, enregistré à chaque pause de frappe (UI-03). Supprimé après envoi réussi.                                                                                                                                                                                                                                                                                            | P1    |
| `syncOutbox`            | L      | `++seq` ; `[table+docId]`                               | Écritures locales en attente d'envoi.                                                                                                                                                                                                                                                                                                                                                     | P2    |
| `syncMeta`              | L      | `key`                                                   | Curseur de lecture, identifiant d'appareil, date de dernière synchronisation.                                                                                                                                                                                                                                                                                                             | P2    |
| `usageSnapshot`         | L      | `id` (singleton)                                        | Dernier état de l'écran Consommation, pour un affichage hors ligne.                                                                                                                                                                                                                                                                                                                       | P2    |

Chaque table a un schéma Zod (`src/data/schemas/<table>.ts`). Toute lecture passe par `schema.parse` : un document invalide est isolé et signalé, jamais propagé silencieusement.

### 4.3 Tables Postgres (phase 2)

```sql
-- Documents fusionnés en « le plus récent gagne » (classe D)
create table sync_documents (
  user_id        uuid   not null default auth.uid() references auth.users on delete cascade,
  collection     text   not null,            -- nom de la table Dexie
  id             uuid   not null,
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
  status             text not null,          -- reserved | ok | invalid_output | error | refused_budget | refused_rate
  attempt            int  not null default 1,
  input_tokens       int, output_tokens int,
  cache_creation_input_tokens int, cache_read_input_tokens int,
  reserved_cost_usd  numeric(10,6) not null default 0,
  cost_usd           numeric(10,6),
  latency_ms         int,
  error_code         text
);
```

- `server_seq` est tiré d'une séquence commune, affectée par un déclencheur à chaque insertion ou mise à jour. Le curseur de lecture est ainsi monotone et indépendant des horloges.
- **RLS** activée sur les trois tables :
  - `sync_documents` et `sync_events` : `select`, `insert` et `update` limités à `user_id = auth.uid()`. Pas de `delete` : on utilise des tombstones.
  - `ai_calls` : `select` seulement pour le propriétaire. Aucune écriture possible depuis le client ; l'Edge Function écrit avec la clé de service.
- **Aucun texte de l'apprenant** dans `ai_calls` : uniquement des métadonnées et des compteurs.

## 5. Programme et contenu

Le programme est **du contenu versionné dans le code** (CUR-01), relu par un humain, jamais généré à la volée (NO-04).

```
src/content/
  schema.ts                 Schémas Zod : Track, Notion, Lesson, Exercise (union discriminée)
  tracks.ts                 Pistes et ordre des notions
  notions/<notion-id>/
    lesson.ts               Étape 1 : usage, tableau de forme, contraste, pièges, exemples, frise
    exercises.ts            Socle des étapes 2 à 4 (≥ 10 exercices par étape, CUR-06)
    placement.ts            3 à 5 questions de positionnement (CUR-08)
  index.ts                  Registre : ajouter une notion = ajouter un dossier + une ligne ici
```

**Types d'exercices** (union discriminée par `kind`) :

| `kind`               | Étape | Contenu                                                                                     | Correction       |
| -------------------- | ----- | ------------------------------------------------------------------------------------------- | ---------------- |
| `choice-with-reason` | 2     | Phrase avec trou, options de forme, forme correcte, options de raison (FR), raison correcte | Locale           |
| `fill-verb`          | 3     | Phrase avec trou, verbe à l'infinitif, sens en français, réponses acceptées                 | Locale           |
| `transform`          | 3     | Phrase source, consigne (FR), réponses acceptées                                            | Locale           |
| `place-word`         | 3     | Phrase, mot à placer, réponses acceptées (phrases complètes)                                | Locale           |
| `translate`          | 4     | Phrase française, réponses acceptées (canonique + variantes), indice, difficulté (1–3)      | Locale, sinon IA |

Chaque exercice porte un identifiant stable (`<notion-id>/s<étape>/<nn>`). Il porte aussi deux marques de relecture (`review: { first, second }`), exigées par le test du socle (CUR-06, CUR-11).

**Identifiants de notions** (stables, en anglais, kebab-case) :

| Piste                                 | Identifiants (dans l'ordre pédagogique)                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tenses` — Temps verbaux              | `tense-present-simple`, `tense-present-continuous`, `tense-present-simple-vs-continuous`, `tense-past-simple`, `tense-present-perfect`, `tense-present-perfect-vs-past-simple`, `tense-for-since-ago`, `tense-just-already-yet-still`, `tense-past-continuous`, `tense-past-perfect`, `tense-future`, `tense-present-perfect-continuous`, `tense-review` |
| `structure` — Structure de la phrase  | `structure-do-questions-negations`, `structure-word-order`, `structure-indirect-questions`, `structure-relative-clauses`, `structure-connectors`                                                                                                                                                                                                         |
| `traps` — Mots pièges                 | `traps-articles`, `traps-uncountables`, `traps-make-do`, `traps-say-tell`, `traps-rise-raise`, `traps-lend-borrow`, `traps-time-prepositions`, `traps-dependent-prepositions`, `traps-false-friends`                                                                                                                                                     |
| `pro` — Communication professionnelle | `pro-conditionals-politeness`, `pro-modals`, `pro-passive`, `pro-reported-speech`                                                                                                                                                                                                                                                                        |

Ces identifiants sont la liste fermée transmise au modèle (AI-03). Toute sortie IA qui cite un autre identifiant est rejetée.

## 6. Correction locale

Corriger localement tout ce qui peut l'être (COST-02) repose sur un moteur pur (`src/domain/correction`), livré en phase 1 :

1. **Normalisation** :
   - minuscules ;
   - apostrophes et guillemets typographiques unifiés ;
   - espaces multiples réduits ;
   - ponctuation finale et ponctuation non significative ignorées.
2. **Contractions** :
   - chaque réponse est développée en un **ensemble** de formes équivalentes (_don't_ ↔ _do not_, _I'm_ ↔ _I am_) ;
   - les contractions ambiguës produisent plusieurs candidats : _'s_ → _is_ / _has_, _'d_ → _would_ / _had_ ;
   - le _'s_ possessif n'est pas développé après un nom.
   - Deux réponses sont équivalentes si leurs ensembles se recoupent.
3. **Variantes** : la réponse est comparée à la réponse canonique et aux variantes acceptables. Les graphies britannique et américaine d'un même mot sont acceptées toutes les deux : une formulation correcte n'est jamais une erreur (NO-05).
4. **Résultat** :
   - `correct` si une variante correspond ;
   - `incorrect` si la réponse correspond à une erreur connue de l'exercice ;
   - sinon `unknown`. Seule une réponse `unknown` peut, **sur action explicite**, être envoyée au modèle (étape 4, cartes, CARD-05).

La **réparation des segments** IA (AI-07) vit aussi dans ce module. Un segment signalé par le modèle est recherché tel quel dans le texte :

- s'il y a plusieurs occurrences, on retient la plus proche de la position proposée ;
- s'il est introuvable, l'erreur est affichée sans surlignage.

## 7. Synchronisation

**Écriture locale** : un dépôt écrit le document (avec `updatedAt` monotone) **et** une entrée dans `syncOutbox`, dans la **même transaction** Dexie. Aucune écriture n'échappe à la file.

**Déclencheurs** (aucun coût IA : la synchronisation n'appelle jamais le modèle) :

- ouverture de l'app ;
- événement `online` ;
- 5 secondes après la dernière écriture ;
- bouton « Synchroniser ».

**Push** : les entrées de la file sont envoyées par lots à une fonction RPC `sync_push` (sécurité invoker, soumise à la RLS).

- Documents : `insert … on conflict do update … where excluded.updated_at > sync_documents.updated_at`, avec départage déterministe à égalité (comparaison du `doc` sérialisé).
- Événements : `insert … on conflict do nothing`.
- Les entrées acquittées sont retirées de la file.

**Pull** : `sync_pull(cursor, limit)` renvoie les lignes dont `server_seq > cursor`, par ordre croissant.

- Documents : appliqués si le document local est absent ou si `remote.updatedAt > local.updatedAt`. Un document local plus récent sera renvoyé au prochain push.
- Événements : insérés s'ils sont absents.
- Le curseur n'avance qu'après une application réussie.

**Conflits** : « le plus récent gagne » par document ; l'historique d'activité est fusionné par union des événements (DECISIONS D-015). Les brouillons ne sont jamais synchronisés.

**Migrations de schéma** (NO-06) :

- Chaque document porte un `schemaVersion`. Des fonctions `upgrade` pures (v1 → v2 → …), testées sur des jeux de données des versions précédentes, sont appliquées à la lecture locale comme à la réception.
- Les versions Dexie sont **additives** : on ajoute des index ou des tables, on ne détruit jamais de données.
- Avant toute montée de version Dexie, un export JSON complet est enregistré localement.
- L'app demande `navigator.storage.persist()` pour éviter la purge d'IndexedDB par Android (DECISIONS D-019).

**Export et import JSON** (MOD-12) :

- enveloppe versionnée `{ app, formatVersion, exportedAt, tables }`, validée par Zod ;
- l'import **fusionne** selon les mêmes règles que la synchronisation, et n'efface jamais ;
- un aperçu est présenté avant la confirmation.

## 8. Flux d'un appel IA

```
Utilisateur          Client (PWA)                    Edge Function « ai »                     Anthropic
    │ touche           │                                   │                                      │
    │ « Corriger » ───►│ 1. production enregistrée         │                                      │
    │                  │    localement (aucune perte)      │                                      │
    │                  │ 2. entrée validée (Zod)           │                                      │
    │                  │── POST {task, input, requestId} ─►│ 3. CORS, JWT, e-mail autorisé        │
    │                  │   + JWT                           │ 4. validation Zod de l'entrée        │
    │                  │                                   │ 5. idempotence (requestId)           │
    │                  │                                   │ 6. limite de fréquence (par minute)  │
    │                  │                                   │ 7. budget : réservation du coût max  │
    │                  │                                   │ 8. prompt versionné : préfixe stable │
    │                  │                                   │    en cache + partie variable ──────►│
    │                  │                                   │◄──────────── JSON structuré + usage ─│
    │                  │                                   │ 9. validation Zod (+ 1 nouvelle      │
    │                  │                                   │    tentative si sortie invalide)     │
    │                  │                                   │10. coût réel → ai_calls              │
    │                  │◄─ {output, usage, promptVersion} ─│                                      │
    │                  │11. validation Zod, réparation des segments,                              │
    │                  │    enregistrement (jamais redemandé), règles du domaine                  │
    │◄── feedback ─────│                                                                          │
```

Détails :

- **Étape 7, budget.** La somme du mois (coûts réels + réservations en cours), augmentée du coût **maximal** de l'appel, ne doit pas dépasser le plafond (COST-06). Le coût maximal se calcule à partir de l'entrée estimée et de `max_tokens`. On insère ensuite une ligne `reserved`. En cas de refus, le message est clair : « Plafond mensuel de 10 USD atteint (9,87 USD utilisés). Les fonctions IA reprendront le 1er octobre. Tout le reste de l'app fonctionne. »
- **Étape 8, appel.** Via `@anthropic-ai/sdk` : `client.messages.parse()` avec `output_config.format = zodOutputFormat(schéma)`, qui garantit un JSON conforme (DECISIONS D-010). La tâche fixe `max_tokens`, le modèle et la réflexion.
  - Le **préfixe stable** du système porte `cache_control` : rôle, taxonomie avec définitions, identifiants de notions, règles, exemples.
  - La **partie variable** vient après : profil de l'apprenant, texte, consigne (COST-03).
- **Étape 9, sortie invalide.** Si la sortie est invalide (`stop_reason` `max_tokens` ou `refusal`, ou échec de validation sémantique), **une seule** nouvelle tentative est faite, sauf pour `max_tokens`, qu'une nouvelle tentative identique ne corrigerait pas. Chaque tentative est journalisée et comptée dans le budget (DECISIONS D-016). Si l'échec persiste, le client affiche une version dégradée utilisable : la production reste enregistrée, avec le statut `correction-failed` et un bouton « Réessayer ».
- **Hors ligne.** Le bouton d'action IA reste visible mais inactif, avec la mention : « Connexion nécessaire pour la correction. Ta réponse est enregistrée. »

## 9. Sécurité

- **Clé Anthropic** (SEC-01) : uniquement dans les secrets de l'Edge Function (`ANTHROPIC_API_KEY`), jamais journalisée. La règle ESLint et `npm run check:secrets` (en CI) interdisent tout accès direct à Anthropic depuis `src/` et toute clé dans le dépôt.
- **Clés Supabase côté client** : la clé publique est publique par conception, et la protection repose sur la RLS. La clé de service n'existe que dans l'environnement de l'Edge Function. Le nom exact des variables (clé « anon » ou « publishable ») sera vérifié en phase 2 (DECISIONS D-031).
- **Authentification** (DECISIONS D-013) :
  - un code à usage unique envoyé par e-mail ;
  - inscriptions désactivées une fois le compte unique créé ;
  - l'Edge Function vérifie en plus que l'e-mail figure dans `AI_ALLOWED_EMAILS` (défense en profondeur contre la dépense).
- **RLS** sur toutes les tables, avec des politiques explicites (SEC-02). Toute nouvelle migration qui crée une table doit activer la RLS : c'est vérifié à la relecture (AGENTS.md).
- **Validation** : l'Edge Function refuse toute requête dont la tâche est inconnue ou dont l'entrée ne passe pas son schéma Zod (tailles maximales incluses). Le client n'envoie **jamais** de prompt, seulement `{ task, input }` (DECISIONS D-017).
- **CORS** : seuls le domaine Vercel de production et `localhost` en développement sont autorisés.
- **Journaux** : aucun texte de l'apprenant ; seulement identifiants, tâche, compteurs de tokens et codes d'erreur.
- **En-têtes** (phase 1, `vercel.json`) : Content-Security-Policy restrictive (`connect-src` limité à Supabase), `Referrer-Policy`, `Permissions-Policy` (micro autorisé pour l'origine seule).
- **Données personnelles** (SEC-03, SEC-04) :
  - `import-samples/` est exclu du dépôt ;
  - aucun traceur ni outil d'analyse ;
  - les exports restent sur l'appareil ;
  - le dépôt ne contient pas de profil identifiant (DECISIONS D-020).

## 10. Coûts

### 10.1 Configuration

- `shared/ai/models.ts` est le **seul** fichier où l'on choisit, par tâche : le modèle, `max_tokens`, la réflexion et l'effort, et la mise en cache (ARC-09).
- `shared/ai/pricing.ts` contient le tableau de prix (USD par million de tokens), vérifié le 2026-09-27 :

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

| Tâche                | Modèle    | `max_tokens` | Réflexion                                    | Cache du préfixe                    | Déclencheur                                                       |
| -------------------- | --------- | ------------ | -------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------- |
| `correct-production` | Sonnet 5  | 2 000        | Désactivée ou effort bas (à calibrer, D-012) | Oui                                 | « Corriger » (Thème, Journal, Produire, E-mail, étape 4 inconnue) |
| `check-card-answer`  | Haiku 4.5 | 300          | —                                            | Non (préfixe < 4 096 tokens, D-011) | « Vérifier » sur une réponse de carte `unknown`                   |
| `classify-sounds`    | Haiku 4.5 | 400          | —                                            | Non                                 | Fin d'un exercice de shadowing, si des mots sont manqués          |
| `generate-exercises` | Sonnet 5  | 3 000        | Effort bas                                   | Oui                                 | « Plus d'exercices » quand le socle est épuisé                    |
| `diagnose`           | Sonnet 5  | 2 500        | Effort bas                                   | Oui                                 | Fin du diagnostic initial                                         |
| `recalibrate-level`  | Sonnet 5  | 1 200        | Effort bas                                   | Oui                                 | « Recalibrer mon niveau »                                         |
| `review-email`       | Sonnet 5  | 2 500        | Effort bas                                   | Oui                                 | « Réviser mon e-mail »                                            |
| `interview-turn`     | Sonnet 5  | 600          | Désactivée                                   | Oui                                 | Réponse de l'apprenant dans la simulation d'entretien             |

**Ordre de grandeur** d'une correction : préfixe de 3 500 tokens en cache, 300 tokens variables, 700 tokens de sortie. Elle coûte environ 0,016 USD au premier appel (écriture en cache), puis environ 0,008 USD dans les 5 minutes suivantes (lecture). Le plafond de 10 USD couvre donc plus de 600 corrections par mois.

### 10.3 Garde-fous

- **Fréquence** : `AI_RATE_LIMIT_PER_MINUTE` (défaut 6), compté sur `ai_calls`.
- **Plafond mensuel** : `AI_MONTHLY_BUDGET_USD` (défaut 10), avec réservation préalable du coût maximal, ce qui garantit le plafond même en cas d'appels concurrents.
- **Idempotence** : un `requestId` déjà vu dans les 10 dernières minutes est refusé. Un double tap ne coûte donc rien.
- **Réutilisation** : les corrections et les exercices générés sont enregistrés localement, et leur résultat n'est jamais redemandé.
- **Écran « Consommation »** (COST-08) : coût du jour, du mois et par tâche, lu dans `ai_calls` (RLS). Hors ligne, le dernier état connu est affiché avec sa date.
- **Vérification du cache** : le journal conserve `cache_read_input_tokens`. Si ce compteur reste à zéro sur des appels rapprochés, un invalidateur silencieux est à chercher.

## 11. PWA et hors ligne

- **vite-plugin-pwa** en mode `generateSW` (Workbox) : précache de l'app et du programme. L'app est entièrement utilisable hors ligne, sauf l'IA et la synchronisation (ARC-01).
- **Manifeste** :
  - nom, nom court, `lang: "fr"`, `start_url` et `scope` à `/` ;
  - `display: "standalone"` ;
  - couleurs de thème et de fond ;
  - icônes 192 et 512 px, dont une version _maskable_.
- **Mises à jour** : `registerType: "prompt"` (DECISIONS D-018). Une nouvelle version s'annonce par un bandeau « Nouvelle version disponible — Mettre à jour ». L'app ne se recharge jamais d'elle-même pendant une saisie, et les brouillons sont enregistrés avant le rechargement.
- **Stockage persistant** : l'app appelle `navigator.storage.persist()` et affiche son état dans les Réglages.

## 12. Parole

Des interfaces du domaine, avec des implémentations interchangeables dans `src/services/speech` :

- **`SpeechRecognizer`** : `isAvailable()`, `start({ lang, continuous })`, événements (partiel, final, fin, erreur), `stop()`.
  - Implémentation `WebSpeechRecognizer` (`SpeechRecognition` / `webkitSpeechRecognition`), avec redémarrage automatique après un silence pendant une réponse chronométrée.
  - Repli : saisie par la **dictée du clavier** Android, via un champ texte accompagné d'une consigne (ARC-08).
- **`SpeechSynthesizer`** : `speak(text, { voice, rate, lang })`, par la synthèse Web Speech, avec des voix filtrées selon la variante choisie.
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

| Niveau                  | Outil                    | Portée                                                                                                                                                                                                       |
| ----------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Logique pure            | Vitest                   | Tout `src/domain`, les contrats de `shared/ai` (schémas, prix, calcul de coût et de budget), le scan de secrets. Horloge injectée, aucun réseau.                                                             |
| Données                 | Vitest + fake-indexeddb  | Dépôts, transactions document + file de synchro, migrations (jeux de données des versions précédentes), export et import.                                                                                    |
| Contenu                 | Vitest                   | **Test du socle** (CUR-11) : chaque exercice est conforme au schéma, résoluble, avec au moins une réponse attendue, deux marques de relecture et un identifiant de notion valide ; ≥ 10 exercices par étape. |
| Composants              | Vitest + Testing Library | Comportements clés de l'interface (brouillons, correction en deux temps).                                                                                                                                    |
| Parcours                | Playwright (Pixel 7)     | Parcours principaux sur le build de production : installation PWA, hors ligne, séance du jour, révision d'une carte. **Le modèle est simulé** : aucun test automatique n'appelle Anthropic.                  |
| Qualité des corrections | Banc d'essai (MOD-13)    | Lancé **manuellement**, depuis l'écran développeur, avec le coût affiché avant lancement. Il ne fait jamais partie de la CI.                                                                                 |

La CI (`.github/workflows/ci.yml`) exécute : vérification des types, lint, format, tests unitaires, scan de secrets, build et tests e2e. Une phase n'est terminée que si tout passe (PROC-05).
