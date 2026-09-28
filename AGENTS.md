# AGENTS.md — consignes pour l'agent de revue (Codex)

Ce dépôt est développé avec Claude Code et relu par un second agent. Ce fichier donne à la revue les règles essentielles et ses priorités. La documentation complète est dans [docs/](docs/) :

- [SPEC.md](docs/SPEC.md) : exigences numérotées, à citer dans les remarques (par exemple « viole CARD-01 ») ;
- [PEDAGOGY.md](docs/PEDAGOGY.md) : pédagogie, taxonomie, critères de passage ;
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) : modèle de données, synchronisation, flux IA, sécurité, coûts ;
- [ROADMAP.md](docs/ROADMAP.md) : phases ;
- [DECISIONS.md](docs/DECISIONS.md) : arbitrages déjà faits. Ne pas les rediscuter sans argument nouveau.

## Le projet en bref

Une PWA mobile **local-first** d'entraînement à l'anglais professionnel, pour un francophone.

- Front : Vite, React et TypeScript strict. Dexie (IndexedDB) est la source de vérité, et Zod valide toutes les frontières.
- Serveur : Supabase (authentification, Postgres avec RLS). Une Edge Function est le **seul** chemin vers l'API Anthropic.
- Répétition espacée : ts-fsrs.
- Langues : interface en français, contenu en anglais, code et commits en anglais, documentation en français.

## Commandes de vérification

```sh
npm ci
npm run check      # typecheck + lint + format:check + tests unitaires + scan de secrets
npm run build
npm run test:e2e   # nécessite : npx playwright install chromium
```

## Règles essentielles

1. **Aucun appel au modèle sans action explicite de l'utilisateur** (NO-01, COST-01) : pas d'appel dans un `useEffect`, un minuteur, la synchronisation, ni de nouvelle tentative en boucle.
2. **Aucune clé API côté client ni dans le dépôt** (NO-02). Le client n'importe pas le SDK Anthropic et n'envoie jamais de prompt, seulement `{ task, input, requestId }`.
3. **Aucune carte non résoluble** (NO-03) : toute création de carte passe par `isCardSolvable`.
4. **Programme** relu, jamais généré à la volée (NO-04). Les exercices générés par l'IA sont validés et conservés. Le contenu est **original** : aucun texte ni exercice des livres de Murphy n'est repris (CUR-15).
5. **Aucune formulation correcte signalée comme erreur** (NO-05). La correction locale accepte les variantes, les contractions et les graphies britannique et américaine.
6. **Aucune perte de données** (NO-06) :
   - brouillons enregistrés à chaque pause de frappe ;
   - migrations Dexie additives, sauvegarde automatique avant toute montée de version ;
   - toute lecture validée par `parseRecord`, toute écriture par `writeRecord` ; un enregistrement illisible n'est jamais écrasé en silence ;
   - document et file de synchronisation écrits dans la même transaction (à partir de la phase 2) ;
   - service worker mis à jour sur demande seulement.
7. **RLS** activée, avec des politiques explicites, sur toute table Postgres (SEC-02).
8. Aucun test, règle de lint ni vérification de types désactivé (PROC-05).
9. Aucune donnée personnelle dans le code, les logs ou les commits (SEC-03).
10. **Couches** : les dépendances entre dossiers de `src/` sont imposées par `eslint.layers.ts` (ARCHITECTURE §3). Le domaine reste pur, sans horloge implicite.

## Priorités de revue (dans l'ordre)

1. **Exactitude du contenu pédagogique** : chaque réponse attendue et chaque variante acceptable du socle (`src/content`) sont-elles justes, idiomatiques, et les seules à ne pas être rejetées à tort ? Une réponse attendue fausse est le pire défaut possible. Vérifier aussi que l'anglais des exemples est irréprochable, que le français de l'interface est sans faute, que rien n'est repris des livres de Murphy, et que chaque référence « Pour aller plus loin » est identique à PEDAGOGY §11 et à `docs/references/murphy-contents.md` (CUR-14).
2. **Résolubilité des cartes** : chaque carte contient-elle le sens en français, un indice qui ne donne pas la réponse, et assez de contexte pour quelqu'un qui a tout oublié (CARD-01, CARD-02) ?
3. **Coûts** :
   - aucun chemin qui appelle l'IA sans geste de l'utilisateur ;
   - `max_tokens` et modèle fixés par tâche dans `shared/ai/models.ts` ;
   - préfixe de prompt stable avant la partie variable ;
   - journalisation et plafond appliqués côté serveur.
4. **Sécurité** : clé, RLS, validation Zod dans l'Edge Function, CORS, journaux sans texte de l'apprenant.
5. **Intégrité des données** : migrations, fusion « le plus récent gagne », idempotence, gestion hors ligne.
6. **Logique pure** : `src/domain` sans React, Dexie ni réseau, avec des tests qui couvrent les cas limites (horloge injectée).
7. **Lisibilité** : noms clairs, fonctions courtes, commentaires là où la logique n'est pas évidente.

## Format attendu des remarques

Pour chaque remarque :

- un emplacement `fichier:ligne` ;
- une gravité (bloquant, important, mineur) ;
- l'exigence concernée (identifiant SPEC) quand elle existe ;
- un scénario concret qui montre le problème ;
- une correction proposée.

Distinguer les défauts avérés des simples suggestions.
