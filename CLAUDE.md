# CLAUDE.md — aide-mémoire

PWA mobile **local-first** pour qu'un francophone devienne opérationnel en anglais professionnel (entretien d'embauche et e-mails, sans traduction mentale) d'ici février 2027. Interface en français, contenu en anglais.

Référence : [docs/SPEC.md](docs/SPEC.md) (exigences numérotées), [docs/PEDAGOGY.md](docs/PEDAGOGY.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/ROADMAP.md](docs/ROADMAP.md), [docs/DECISIONS.md](docs/DECISIONS.md), [docs/references/murphy-contents.md](docs/references/murphy-contents.md) (tables des matières des deux livres de Murphy qui servent de référence).

## Commandes

```sh
npm ci                  # installation (Node >= 24, voir .nvmrc)
npm run dev             # serveur de développement
npm run check           # typecheck + lint + format:check + tests unitaires + scan de secrets
npm run test:e2e        # Playwright (build de production, émulation Pixel 7)
npm run build           # build de production
npm run format          # formater avec Prettier
```

Détail : `typecheck` (`tsc -b`), `lint` (`eslint . --max-warnings=0`), `test` (`vitest run`), `test:watch`, `check:secrets`. Première exécution des tests e2e : `npx playwright install chromium`.

## Architecture (détails : docs/ARCHITECTURE.md)

- **Stack** : Vite, React, TypeScript strict ; Dexie (IndexedDB) comme **source de vérité** sur l'appareil ; Zod à toutes les frontières ; ts-fsrs encapsulé ; vite-plugin-pwa.
- **Serveur** : Supabase (authentification par code e-mail, Postgres avec RLS) et une Edge Function « ai », seul chemin vers Anthropic. Hébergement du front sur Vercel.
- **Dossiers** :
  - `src/domain` : logique **pure et testée**, sans React, Dexie ni réseau ; horloge injectée ;
  - `src/data` : Dexie, dépôts, synchronisation ;
  - `src/features` : écrans par module ;
  - `src/ui` : composants ;
  - `src/content` : programme en **données** ;
  - `src/services` : IA, parole ;
  - `shared/ai` : contrat IA (tâches, schémas, prompts versionnés, `models.ts`, `pricing.ts`) ;
  - `supabase/` : migrations et Edge Function.
- **Modèles** : `claude-haiku-4-5-20251001` pour les vérifications simples, `claude-sonnet-5` pour la correction, le diagnostic et la génération. Seulement dans `shared/ai/models.ts`.

## Conventions

- Code, identifiants, commentaires et commits en **anglais** ; documentation en **français**. Commits atomiques au format Conventional Commits.
- TypeScript strict, pas de `any`, pas d'assertion non nulle ; imports explicites (pas de globals Vitest).
- Logique pure séparée de l'interface ; fichiers et fonctions de taille raisonnable ; commentaires seulement là où ce n'est pas évident.
- Avant d'utiliser une bibliothèque ou une API externe : **vérifier sa documentation actuelle** (PROC-03).
- Ambiguïté : option la plus prudente, consignée dans docs/DECISIONS.md et signalée à l'arrêt de la phase (PROC-04).

## Règles impératives

1. **Coûts** : aucun appel au modèle sans action explicite de l'utilisateur (jamais au chargement, en arrière-plan, en boucle ou pendant une synchronisation). Tout ce qui peut être corrigé localement l'est. `max_tokens` adapté à chaque tâche ; résultats IA enregistrés et jamais redemandés.
2. **Clé API** : uniquement dans les secrets de l'Edge Function. Jamais dans `src/` ni dans le dépôt : ESLint et `check:secrets` le vérifient. Le client n'envoie jamais de prompt.
3. **Cartes** : toute création passe par `isCardSolvable`. Aucune carte non résoluble n'est présentée.
4. **Programme** : rédigé et relu dans le code, jamais généré à la volée. Une réponse attendue fausse est le pire défaut possible : chaque réponse et chaque variante sont relues deux fois. Ordre, identifiants et références des notions : docs/PEDAGOGY.md §11 uniquement. Contenu **original** : rien n'est repris des livres de Murphy, et leurs numéros d'unités ne viennent que de docs/references/murphy-contents.md, jamais de mémoire (CUR-14, CUR-15).
5. **Corrections** : une formulation correcte n'est jamais signalée comme une erreur.
6. **Données** : aucune perte de saisie ni de données (brouillons, migrations Dexie additives, mises à jour du service worker sur demande). RLS sur toutes les tables.
7. **Vérifications** : ne jamais désactiver un test, une règle de lint ou une vérification de types. Une phase n'est pas terminée tant que `npm run check`, le build et `npm run test:e2e` ne passent pas.
8. **Données personnelles** : aucune dans le code, les logs, les commits ou les messages. `import-samples/` reste hors dépôt.

## Méthode de travail

- Travail **par phases** (docs/ROADMAP.md). À l'intérieur d'une phase : explorer, planifier, implémenter, tester, relire son diff comme un relecteur exigeant, corriger, mettre à jour la documentation, puis commiter.
- À la fin de chaque phase, **s'arrêter** et faire un rapport : ce qui est fait, les tests, les décisions, les points à relire par Codex, les actions de l'utilisateur, la phase suivante.
- **Ne jamais enchaîner sur la phase suivante sans l'accord explicite de l'utilisateur.**

## Reprendre le travail dans une nouvelle session

1. Lire docs/ROADMAP.md (phase en cours, cases cochées) et les dernières entrées de docs/DECISIONS.md.
2. `git status` et `git log --oneline -20` pour voir où en est le travail.
3. `npm ci && npm run check` pour partir d'un état vert.
4. Poursuivre **uniquement** la phase en cours ; si elle est terminée, attendre l'accord de l'utilisateur.
