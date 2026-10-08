# Journal des décisions

Chaque décision est numérotée, datée, et classée par ordre numérique. Une décision remplacée n'est pas effacée : on ajoute une nouvelle entrée qui la cite (« remplace D-0xx »). Les décisions **à vérifier** ou **à calibrer** seront confirmées ou révisées dans la phase indiquée.

Format : **Contexte**, **Décision**, **Raison**, **Alternatives écartées** (les rubriques sans objet sont omises).

## Index

| ID    | Sujet                                                    | Thème       | Statut                  |
| ----- | -------------------------------------------------------- | ----------- | ----------------------- |
| D-001 | Langues du projet                                        | Outillage   | Actée                   |
| D-002 | npm et Node 24                                           | Outillage   | Actée                   |
| D-003 | TypeScript 6.0.x plutôt que 7                            | Outillage   | Actée                   |
| D-004 | ESLint plutôt qu'oxlint, fork d'accessibilité            | Outillage   | Actée                   |
| D-005 | Vitest 5 et jsdom 29                                     | Outillage   | Actée                   |
| D-006 | Options TypeScript                                       | Outillage   | Actée                   |
| D-007 | Playwright sur le build de production                    | Outillage   | Actée                   |
| D-008 | Scan de secrets en plus d'ESLint                         | Sécurité    | Actée                   |
| D-009 | Identifiants de modèles et prix                          | IA et coûts | Actée                   |
| D-010 | Sortie JSON garantie                                     | IA et coûts | Actée                   |
| D-011 | Cache de prompts                                         | IA et coûts | Actée                   |
| D-012 | Réflexion de Sonnet 5 réglée par tâche                   | IA et coûts | À calibrer (P5)         |
| D-013 | Authentification par code à usage unique                 | Serveur     | Vérifiée (D-060)        |
| D-014 | Magasin de documents générique côté serveur              | Serveur     | Actée                   |
| D-015 | Résolution des conflits                                  | Données     | Actée                   |
| D-016 | Réservation budgétaire et nouvelle tentative             | IA et coûts | Actée                   |
| D-017 | Prompts uniquement côté serveur                          | IA et coûts | Actée                   |
| D-018 | Mise à jour du service worker sur demande                | PWA         | Actée                   |
| D-019 | Stockage persistant et migrations sûres                  | Données     | Actée                   |
| D-020 | Aucune donnée personnelle identifiante dans le dépôt     | Sécurité    | Actée                   |
| D-021 | Taxonomie à deux dimensions et règles de départage       | Pédagogie   | Actée                   |
| D-022 | Notion « à consolider »                                  | Pédagogie   | Actée                   |
| D-023 | Notions admises dans le Thème                            | Pédagogie   | Actée                   |
| D-024 | Seules les erreurs qualifiantes déclenchent une lacune   | Pédagogie   | Actée                   |
| D-025 | Erreur sur une notion non étudiée                        | Pédagogie   | Actée                   |
| D-026 | Autocorrection vérifiée localement                       | Pédagogie   | Actée                   |
| D-027 | Critères de passage par défaut                           | Pédagogie   | Précisée (D-075)        |
| D-028 | Limites de la reconnaissance vocale                      | Parole      | À revoir (P6)           |
| D-029 | Mise en pause des projets Supabase gratuits              | Serveur     | Vérifiée (P2)           |
| D-030 | Code partagé entre le client et l'Edge Function          | Serveur     | Tranchée (D-061)        |
| D-031 | Nom des clés Supabase côté client                        | Serveur     | Tranchée (D-060)        |
| D-032 | Profil générique renforcé, historique conservé           | Sécurité    | Actée                   |
| D-033 | Scan de l'index Git et gitleaks sur tout l'historique    | Sécurité    | Actée                   |
| D-034 | Serveur e2e dédié, jamais réutilisé                      | Outillage   | Actée                   |
| D-035 | Critère décisif : erreur ou non                          | Pédagogie   | Actée                   |
| D-036 | Programme aligné sur Murphy, en 9 pistes                 | Pédagogie   | Actée                   |
| D-037 | Ajouts de phase 8 dans la piste Temps verbaux            | Pédagogie   | Actée                   |
| D-038 | Références « Pour aller plus loin », livrées en phase 3  | Pédagogie   | Actée                   |
| D-039 | Libellés des livres : rouge et bleu                      | Pédagogie   | Actée                   |
| D-040 | Taxonomie : définitions élargies aux nouvelles notions   | Pédagogie   | Actée                   |
| D-041 | Contenu original, sans reprise des livres                | Pédagogie   | Actée                   |
| D-042 | Revue de la mise à jour Murphy                           | Pédagogie   | Actée                   |
| D-043 | Toutes les tables locales déclarées dès la version 1     | Données     | Actée                   |
| D-044 | Clés naturelles communes à tous les appareils            | Données     | Vérifiée (D-063)        |
| D-045 | File de synchronisation alimentée à partir de la phase 2 | Données     | Actée                   |
| D-046 | Règles d'équivalence de la correction locale             | Pédagogie   | Actée                   |
| D-047 | Résolubilité des cartes : règles et prudence             | Pédagogie   | Actée                   |
| D-048 | Paramètres de répétition espacée                         | Pédagogie   | À calibrer (usage réel) |
| D-049 | React Router 8 et adresses en français                   | Outillage   | Actée                   |
| D-050 | Règles de couches par `no-restricted-imports`            | Outillage   | Actée                   |
| D-051 | Direction visuelle : polices système et `light-dark()`   | Interface   | Actée                   |
| D-052 | Réglages livrés en phase 1                               | Interface   | Actée                   |
| D-053 | Brouillons de saisie                                     | Données     | Actée                   |
| D-054 | Export, import et sauvegardes automatiques               | Données     | Actée                   |
| D-055 | PWA : icônes générées, pas d'annonce « hors ligne »      | PWA         | Actée                   |
| D-056 | En-têtes de sécurité, tests sous la CSP de production    | Sécurité    | Actée                   |
| D-057 | Revue de la phase 1                                      | Transverse  | Actée                   |
| D-058 | Règles sur l'anglais : listes fermées et cas négatifs    | Pédagogie   | Actée                   |
| D-059 | Revues : une par phase, revue de l'anglais en phase 3    | Processus   | Actée                   |
| D-060 | Compte : clé publique, code par e-mail, compte unique    | Serveur     | Actée                   |
| D-061 | Contrat IA copié dans `supabase/functions/_shared`       | Serveur     | Actée                   |
| D-062 | Authentification et CORS de l'Edge Function              | Sécurité    | Actée                   |
| D-063 | Protocole de synchronisation                             | Données     | Actée                   |
| D-064 | Droits SQL explicites, migrations testées avec PGlite    | Serveur     | Actée                   |
| D-065 | CSP : adresse exacte du projet Supabase                  | Sécurité    | Actée                   |
| D-066 | Chaîne d'appel IA et test de connexion                   | IA et coûts | Actée                   |
| D-067 | Écran « Consommation »                                   | IA et coûts | Actée                   |
| D-068 | Client Supabase dans un fichier JavaScript séparé        | Outillage   | Actée                   |
| D-069 | Revue de la phase 2                                      | Transverse  | Actée                   |
| D-070 | Contre-revue de la phase 2                               | Transverse  | Actée                   |
| D-071 | Envoi des codes de connexion par Resend                  | Serveur     | Actée                   |
| D-072 | Correction locale : traits d'union et familles de mots   | Pédagogie   | Actée                   |
| D-073 | Catalogue fermé des notions, contenu par notion          | Pédagogie   | Actée                   |
| D-074 | Exercices : schéma, correction locale et relectures      | Pédagogie   | Actée                   |
| D-075 | Moteur du parcours et test de positionnement             | Pédagogie   | À ajuster (P5)          |
| D-076 | Étapes 4 et 5 avant la correction par l'IA               | Pédagogie   | Remplacée (D-086)       |
| D-077 | Lecture audio des exemples                               | Parole      | Actée                   |
| D-078 | Écrans et notions chargés à la demande                   | Outillage   | Actée                   |
| D-079 | Génération d'exercices par l'IA                          | IA et coûts | À calibrer (P5)         |
| D-080 | Relecture séparée du socle de la phase 3                 | Pédagogie   | Précisée (D-081)        |
| D-081 | Revues de la phase 3                                     | Transverse  | Actée                   |
| D-082 | Contre-revues de la phase 3                              | Transverse  | Actée                   |
| D-083 | Correction d'une production et vérification d'une carte  | IA et coûts | À calibrer (P5)         |
| D-084 | Thème, Journal et séance du jour                         | Pédagogie   | Actée                   |
| D-085 | Erreurs, cartes, Reprises, lexique et carnet de règles   | Pédagogie   | Précisée (D-088)        |
| D-086 | Étapes 4 et 5 corrigées par l'IA, pratique immédiate     | Pédagogie   | Précisée (D-088)        |
| D-087 | Données de la phase 4                                    | Données     | Actée                   |
| D-088 | Sorties de l'IA vérifiées par l'app ; revues de phase 4  | Transverse  | Actée (un point ouvert) |

---

### D-001 — Langues du projet (2026-09-27)

- **Décision.** Documentation en français. Code, identifiants, commentaires et messages de commit en anglais (Conventional Commits). Interface en français, contenu d'apprentissage en anglais.
- **Raison.** L'utilisateur est francophone et pilote le produit à partir de la documentation. L'anglais est la norme pour le code et facilite la relecture par Codex.

### D-002 — npm et Node 24 (2026-09-27)

- **Décision.** npm comme gestionnaire de paquets et Node ≥ 24 (`.nvmrc`). Les scripts du dépôt sont écrits en TypeScript et exécutés directement par Node (suppression native des types).
- **Raison.** pnpm n'est pas installé sur le poste. npm suffit pour un projet à un seul paquet. Node 24 est la LTS active.

### D-003 — TypeScript 6.0.x plutôt que 7 (2026-09-27)

- **Contexte.** La version `latest` de TypeScript est la 7.0.2, le portage natif en Go. Or typescript-eslint 8.70 déclare `typescript >=4.8.4 <6.1.0`.
- **Décision.** Épingler `typescript@~6.0.3`.
- **Raison.** Les règles de lint typées (`strictTypeChecked`) sont essentielles à la qualité. On passera à la 7 quand typescript-eslint la supportera.

### D-004 — ESLint plutôt qu'oxlint, et fork d'accessibilité (2026-09-27)

- **Contexte.** Le modèle `create-vite` actuel propose oxlint. Par ailleurs, `eslint-plugin-jsx-a11y` n'est plus publié depuis 2024 et ne supporte pas ESLint 10.
- **Décision.** ESLint 10 (imposé par ARC-07) avec typescript-eslint `strictTypeChecked` et `stylisticTypeChecked`, react-hooks, react-refresh et **`eslint-plugin-jsx-a11y-x`**, le fork maintenu par es-tooling (préfixe de règles `jsx-a11y-x/`).
- **Alternatives écartées.** Rester sur ESLint 9 pour garder le plugin original : c'était régresser pour un plugin non maintenu.

### D-005 — Vitest 5 et jsdom 29 (2026-09-27)

- **Décision.** Vitest 5 avec l'environnement jsdom par défaut. Les globals sont désactivés : imports explicites, et nettoyage de Testing Library fait dans `src/test/setup.ts`.
- **Raison.** jsdom 30 exige Node ≥ 24.15 et le poste a Node 24.14 ; npm a donc résolu jsdom 29, entièrement suffisant.

### D-006 — Options TypeScript (2026-09-27)

- **Décision.** `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `verbatimModuleSyntax`. **Pas** de `exactOptionalPropertyTypes`.
- **Raison.** `noUncheckedIndexedAccess` protège l'accès aux listes d'exercices et de réponses, là où une erreur coûte le plus cher. `exactOptionalPropertyTypes` crée beaucoup de friction avec React et Zod pour un gain faible. Or une vérification activée ne doit jamais être retirée ensuite (PROC-05) : on ne l'active donc pas.

### D-007 — Playwright sur le build de production, sans nouvelle tentative (2026-09-27)

- **Décision.** Les tests e2e tournent sur `vite preview` (build de production), dans Chromium en émulation Pixel 7, avec `retries: 0`.
- **Raison.** Le service worker et la PWA n'existent qu'en production. Une nouvelle tentative masquerait un test instable au lieu de le faire corriger.

### D-008 — Scan de secrets en plus d'ESLint (2026-09-27)

- **Décision.** `npm run check:secrets` (lancé en CI) inspecte les fichiers suivis et les nouveaux fichiers non ignorés. Il cherche :
  - clés Anthropic et Supabase secrètes, clés privées PEM ;
  - variables `VITE_*ANTHROPIC*` ;
  - tout accès direct à Anthropic depuis `src/`.

  Une règle ESLint `no-restricted-imports` bloque aussi l'import du SDK dans `src/`.

- **Raison.** ESLint ne voit ni les imports dynamiques, ni les URL brutes, ni les fichiers non-code. La règle « aucune clé côté client ni dans le dépôt » est non négociable (NO-02).

### D-009 — Identifiants de modèles et prix (2026-09-27)

- **Décision.**
  - `claude-haiku-4-5-20251001` (instantané daté de Haiku 4.5) pour les vérifications simples ;
  - `claude-sonnet-5` pour la correction détaillée, le diagnostic et la génération.
  - Prix vérifiés dans la documentation Anthropic : Haiku 4.5 à 1 / 5 USD par million de tokens (entrée / sortie), Sonnet 5 à 2 / 10.
- **Raison.** Ce sont les défauts demandés, vérifiés. L'instantané daté de Haiku rend le banc d'essai reproductible ; Sonnet 5 n'a pas d'instantané daté publié. Les prix vivent dans `shared/ai/pricing.ts`, à mettre à jour si Anthropic les change.

### D-010 — Sortie JSON garantie (2026-09-27)

- **Décision.** `client.messages.parse()` du SDK TypeScript, avec `output_config.format = zodOutputFormat(schéma)`. C'est la méthode recommandée, disponible sur Haiku 4.5 et Sonnet 5, et le SDK accepte Zod 4.
- **Conséquences.**
  - Le sous-ensemble de JSON Schema accepté exclut `minLength`, `maxLength`, `minimum`, `maximum` et les schémas récursifs, et exige `additionalProperties: false`. Les schémas de sortie restent donc **plats** ; le SDK retire les contraintes non supportées et les vérifie côté client.
  - La garantie porte sur la **forme** : les positions de segments et l'exactitude sont toujours validées et réparées par l'application (AI-07).
  - `stop_reason` `max_tokens` ou `refusal` restent possibles et sont traités (ARCHITECTURE §8).

### D-011 — Cache de prompts (2026-09-27)

- **Contexte.**
  - Le préfixe minimum cacheable est de **4 096 tokens pour Haiku 4.5** et de 1 024 tokens pour Sonnet 5.
  - Le TTL est de 5 minutes par défaut.
  - Une écriture en cache coûte 1,25 × le prix d'entrée, une lecture 0,1 ×.
- **Décision.**
  - Cache activé (`cache_control` sur le préfixe système stable) pour les tâches Sonnet.
  - Pas de cache pour les tâches Haiku, dont les prompts restent courts.
  - TTL de 5 minutes.
- **Raison.** Gonfler un prompt Haiku jusqu'à 4 096 tokens pour le mettre en cache coûterait plus cher que de ne pas le cacher. Les séances courtes enchaînent plusieurs corrections en quelques minutes, ce qui rend le TTL de 5 minutes adapté ; le TTL d'une heure double le coût d'écriture. L'efficacité réelle est suivie par `cache_read_input_tokens` dans `ai_calls`.

### D-012 — Réflexion de Sonnet 5 réglée par tâche (2026-09-27, à calibrer en phase 5)

- **Contexte.** Sonnet 5 raisonne par défaut (réflexion adaptative). Ces tokens sont facturés comme de la sortie et comptent dans `max_tokens`.
- **Décision.** Chaque tâche fixe explicitement la réflexion dans `shared/ai/models.ts` : désactivée, ou effort bas. Les valeurs initiales figurent dans ARCHITECTURE §10.2 et seront calibrées avec le banc d'essai (rappel, précision et coût).
- **Raison.** Sans réglage explicite, le plafond de sortie peut tronquer la réponse et le coût déraper.

### D-013 — Authentification par code à usage unique (2026-09-27, à vérifier en phase 2)

- **Contexte.** Un lien magique reçu par e-mail s'ouvre dans Chrome, pas forcément dans la PWA installée.
- **Décision.**
  - Connexion par **code à 6 chiffres envoyé par e-mail** (OTP Supabase). C'est toujours une « connexion par e-mail » (ARC-03).
  - Inscriptions désactivées une fois le compte unique créé.
  - L'Edge Function vérifie en plus que l'e-mail figure dans la liste `AI_ALLOWED_EMAILS`.
- **Alternatives écartées.** Lien magique : risque de session ouverte dans le mauvais contexte, et de connexion qui semble échouer.
- **Suite (2026-09-29).** Vérifiée et précisée par D-060 : le compte est créé dans le tableau de bord, et les inscriptions sont fermées dès le départ.

### D-014 — Magasin de documents générique côté serveur (2026-09-27)

- **Décision.** Deux tables génériques, plutôt qu'une table par entité :
  - `sync_documents` (jsonb, « le plus récent gagne ») ;
  - `sync_events` (en ajout seul).

  Une séquence globale `server_seq` sert de curseur. S'y ajoute une table typée `ai_calls`. La RLS s'applique sur `user_id = auth.uid()`.

- **Raison.**
  - Un seul mécanisme de push/pull.
  - Aucune migration SQL quand le modèle local évolue : Zod valide côté client, et les migrations de documents sont des fonctions pures testées.
  - La séquence rend le curseur indépendant des horloges.
- **Alternatives écartées.** Une table par entité : plus de SQL et de RLS à maintenir, pour des requêtes serveur dont l'app n'a pas besoin.

### D-015 — Résolution des conflits (2026-09-27)

- **Décision.**
  - Documents : « le plus récent gagne », selon l'`updatedAt` client, rendu monotone par document (`max(maintenant, précédent + 1)`). En cas d'égalité, départage déterministe côté serveur.
  - Événements (tentatives, révisions, activité) : fusion par union des identifiants.
  - Brouillons : jamais synchronisés.
- **Raison.** C'est l'exigence de la spécification (P2). Un seul utilisateur, sur un ou deux appareils : les conflits réels sont rares, et l'historique ne perd rien.

### D-016 — Réservation budgétaire et nouvelle tentative côté serveur (2026-09-27)

- **Décision.**
  - Avant chaque appel, l'Edge Function réserve le coût **maximal** (entrée estimée + `max_tokens`), puis le remplace par le coût réel.
  - L'unique nouvelle tentative autorisée en cas de sortie invalide (AI-07) est faite par l'Edge Function, journalisée et comptée dans le budget. Pas de nouvelle tentative après `max_tokens`.
- **Raison.** C'est la seule façon de garantir le plafond mensuel, même avec des appels concurrents. Ainsi, chaque dépense est visible.

### D-017 — Prompts uniquement côté serveur (2026-09-27)

- **Décision.** Le client envoie `{ task, input, requestId }` et jamais de prompt. Les prompts versionnés vivent dans `shared/ai/prompts` et sont assemblés par l'Edge Function.
- **Raison.** Le mandataire ne peut pas servir de proxy générique vers Anthropic, et les prompts restent versionnés et testables.

### D-018 — Mise à jour du service worker sur demande (2026-09-27)

- **Décision.** `registerType: "prompt"` : un bandeau propose la mise à jour, qui n'est jamais forcée.
- **Raison.** Une mise à jour automatique pourrait recharger l'app en pleine saisie (NO-06).

### D-019 — Stockage persistant et migrations sûres (2026-09-27)

- **Décision.**
  - Appel à `navigator.storage.persist()`.
  - Versions Dexie additives uniquement.
  - Export JSON automatique avant toute montée de version.
  - Fonctions de migration de documents testées sur des jeux de données des versions précédentes.
- **Raison.** Android peut purger IndexedDB, qui est la source de vérité, et aucune donnée ne doit être perdue (NO-06).

### D-020 — Aucune donnée personnelle identifiante dans le dépôt (2026-09-27)

- **Décision.** La documentation décrit un profil d'apprenant générique : pas de nom, d'âge, de région ni d'établissement. Le profil réel (domaines, remarques) est saisi dans les Réglages et envoyé aux prompts depuis les données locales.
- **Raison.** SEC-03 interdit toute donnée personnelle dans le code et les commits. Cette interprétation est la plus prudente.

### D-021 — Taxonomie à deux dimensions et règles de départage (2026-09-27)

- **Décision.** La catégorie décrit la **nature** de l'erreur ; l'identifiant de notion dit **quelle leçon** l'enseigne (facultatif). Les conventions sont les suivantes (PEDAGOGY §7) :
  - _for/since/ago_ et _just/already/yet/still_ (choix et position) → `temps_verbaux` ;
  - une seule préposition en cause → `prepositions` ;
  - un mot trompeur → `faux_amis` ; un mot mal associé → `choix_lexical_collocations` ; une structure transposée → `calques_du_francais`.
- **Raison.** Des frontières nettes rendent la classification du modèle plus stable et le banc d'essai mesurable.

### D-022 — Notion « à consolider » (2026-09-27)

- **Décision.** Une notion réussie au positionnement démarre à l'étape 4. Elle devient « acquise » après la réussite de l'étape 5.
- **Raison.** C'est la lecture littérale de CUR-08 ; l'étape 5 garantit la production libre avant l'acquisition.

### D-023 — Notions admises dans le Thème (2026-09-27)

- **Contexte.** CUR-09 rend une notion disponible dans le Thème une fois terminée. MOD-05 cible pourtant en priorité les notions aux étapes 4 et 5.
- **Décision.** Le Thème puise dans les notions aux étapes 4 et 5, à consolider et acquises. Les notions non étudiées représentent au plus 10 % des phrases, toujours avec un indice visible, et jamais deux fois de suite.
- **Raison.** À l'étape 4, la notion a déjà été comprise et pratiquée, ce qui concilie les deux exigences.

### D-024 — Seules les erreurs qualifiantes déclenchent une lacune (2026-09-27)

- **Décision.** Une erreur ne compte pour la règle « au moins deux fois en sept jours » que si toutes ces conditions sont réunies :
  - sa gravité est moyenne ou majeure ;
  - sa confiance est élevée, ou l'utilisateur l'a confirmée ;
  - elle n'a pas été signalée ;
  - ce n'est pas une tournure non naturelle.

  Plusieurs erreurs sur la même notion dans une même production comptent pour une seule.

- **Raison.** Un faux positif de l'IA ne doit jamais renvoyer l'apprenant en arrière (NO-05, LES-05).

### D-025 — Erreur sur une notion non étudiée (2026-09-27)

- **Décision.** La carte est créée **suspendue** (motif « notion non étudiée »). Elle s'active automatiquement quand la notion atteint l'étape 4. La notion devient prioritaire dans le Parcours.
- **Raison.** Demander de produire une forme jamais enseignée contredirait LES-03. Aucune information n'est perdue pour autant.

### D-026 — Autocorrection vérifiée localement (2026-09-27)

- **Décision.** La tentative d'autocorrection (temps 1) est comparée localement à la correction proposée et à ses variantes. Aucun second appel au modèle n'a lieu. Une autocorrection différente n'est pas déclarée fausse : elle est montrée à côté de la correction.
- **Raison.** Maîtrise des coûts (COST-02). Une formulation correcte ne doit jamais être déclarée fausse (NO-05).

### D-027 — Critères de passage par défaut (2026-09-27, à ajuster en phase 3)

- **Décision.**
  - Étapes 2 à 4 : 8 bonnes réponses sur les 10 dernières, avec au moins 10 réponses. Une réponse avec indice compte 0,5.
  - Étape 5 : deux productions consécutives sans erreur, de gravité moyenne ou majeure, sur la notion.
  - Retour en arrière : 4 échecs sur les 6 dernières réponses déclenchent un rappel court de l'étape précédente (4 réussites sur 5 pour revenir).
  - Détail dans PEDAGOGY §3.3.
- **Raison.** 80 % correspond au haut de la zone de calibrage (75 à 85 %). Les valeurs sont des constantes nommées, ajustables sans toucher à la logique.

### D-028 — Limites de la reconnaissance vocale (2026-09-27, à revoir en phase 6)

- **Contexte.** Sur Chrome Android, la reconnaissance passe par les serveurs de Google (réseau requis, l'audio quitte l'appareil), s'arrête sur les silences et ne fournit pas d'horodatage par mot.
- **Décision.**
  - Redémarrage automatique pendant les réponses longues.
  - Mesures de débit, d'hésitations et de prononciation présentées comme des **approximations**.
  - Repli vers la dictée du clavier.
  - Interface `PronunciationAssessor` réservée à un futur service d'évaluation phonétique.

### D-029 — Mise en pause des projets Supabase gratuits (2026-09-27, à vérifier en phase 2)

- **Contexte.** Le plan gratuit met en pause un projet inactif pendant environ une semaine.
- **Décision.** Documenter ce comportement dans le guide de la phase 2. Pendant une pause, l'app reste utilisable hors ligne ; la synchronisation et l'IA reprennent après réactivation dans le tableau de bord Supabase.
- **Vérification (2026-09-29).** Un projet gratuit sans activité de base de données pendant sept jours est mis en pause ; Supabase prévient par e-mail environ une semaine avant. Les données sont conservées, et le projet peut être relancé pendant un an (**Resume project**). Une synchronisation compte comme une activité : un usage régulier de l'app suffit. Voir [DEPLOYMENT.md](DEPLOYMENT.md).

### D-030 — Code partagé entre le client et l'Edge Function (2026-09-27, à vérifier en phase 2)

- **Décision.** Le contrat IA (`shared/ai`) est importé par les deux côtés. Si Deno ne peut pas importer un dossier situé hors de `supabase/functions`, un script copie le dossier dans `supabase/functions/_shared`, et la CI vérifie que la copie est à jour.

### D-031 — Nom des clés Supabase côté client (2026-09-27, à vérifier en phase 2)

- **Décision.** Le nom et le format de la clé publique Supabase (« anon » ou « publishable ») seront vérifiés dans la documentation au moment de la phase 2. Aucun `.env.example` n'est publié avant.

### D-032 — Profil générique renforcé, historique conservé (2026-09-27, complète D-020)

- **Contexte.** La revue de la phase 0 (Codex) signale que le profil de USR-01 restait assez précis pour être relié au nom de l'auteur des commits.
- **Décision.**
  - USR-01 est réduit à ce qui sert au produit ; les domaines restent en USR-05 et l'échéance en USR-02.
  - L'identité d'auteur Git est conservée, et l'historique n'est pas réécrit : pas de push forcé. L'ancienne formulation reste visible dans le commit `76d071b`.
- **Raison.** C'est le choix de l'utilisateur. Le dépôt est privé, signer ses commits de son nom est l'usage normal, et une réécriture de l'historique publié est irréversible.

### D-033 — Scan de l'index Git et gitleaks sur tout l'historique (2026-09-27, complète D-008)

- **Contexte.** La revue de la phase 0 signale deux trous : le scan ne lisait que les fichiers sur le disque (une clé indexée puis retirée du fichier y échappait), et il ne reconnaissait que peu de formats.
- **Décision.**
  - `check:secrets` scanne le **contenu indexé** de chaque fichier suivi (`git ls-files --stage` et `git cat-file --batch`), la copie de travail quand elle diffère, et les fichiers non suivis non ignorés.
  - Il reconnaît davantage de formats : OpenAI, GitHub, AWS, Google, Stripe, Slack, Supabase, JWT, clés privées, et les affectations génériques de secrets à valeur d'allure aléatoire.
  - Il refuse tout fichier `.env*` (sauf `.env.example`) ou de clé privée suivi par Git.
  - Un test d'intégration reproduit le scénario de la revue dans un dépôt Git temporaire.
  - En CI, une tâche **gitleaks** (`gitleaks/gitleaks-action@v3`, historique complet, sans commentaire de PR ; aucune licence n'est requise pour un compte personnel) couvre des centaines de formats et **tous les commits**, y compris une clé ajoutée puis retirée dans le même push.
- **Raison.** Défense en profondeur. gitleaks est la référence pour l'historique, et un contrôle positif local a confirmé qu'il détecte une fausse clé Anthropic. Le script maison reste la barrière locale rapide et porte les règles propres au projet, comme l'accès à Anthropic depuis `src/`.
- **Alternatives écartées.** gitleaks seul : il n'est pas installé sur le poste et ne connaît pas les règles du projet. Un hook pre-commit : il ajouterait une dépendance, et pourra être reconsidéré plus tard.

### D-034 — Serveur e2e dédié, jamais réutilisé (2026-09-27, complète D-007)

- **Contexte.** La revue de la phase 0 signale qu'en local Playwright réutilisait un serveur déjà présent sur le port 4173 : un ancien build pouvait être testé à la place du code courant.
- **Décision.** Les tests e2e utilisent un port dédié (4193), avec `reuseExistingServer: false` et `--strictPort`. Playwright reconstruit et démarre toujours son propre serveur ; un port occupé fait échouer les tests explicitement (vérifié).

### D-035 — Critère décisif : erreur ou non (2026-09-27, complète D-021)

- **Contexte.** La revue de la phase 0 signale que _I am working in finance every day_ était présenté comme faux, alors que le présent continu est juste pour une situation temporaire. La relecture qui a suivi a trouvé d'autres exemples fautifs seulement selon le contexte (_married with_, _when I will have the results_, _The inflation is rising_…).
- **Décision.**
  - Une forme n'est une erreur que si elle est incorrecte **dans toutes les interprétations plausibles**, compte tenu de la consigne, de la phrase française ou de l'intention. En cas de doute, ce n'est pas une erreur (PEDAGOGY §7.3).
  - Un calque ou une collocation n'est une erreur que s'il est agrammatical, s'il change le sens ou s'il serait jugé faux ; sinon, c'est une tournure non naturelle.
  - Tous les exemples de PEDAGOGY ont été rendus univoques ou contextualisés.
- **Raison.** NO-05 est une exigence absolue. Ce critère sera repris tel quel dans les prompts de correction (AI-05) et mesuré par le banc d'essai (MOD-13).

### D-036 — Programme aligné sur Murphy, en 9 pistes (2026-09-27, remplace l'organisation initiale de CUR-02)

- **Contexte.** L'utilisateur étudie en parallèle avec deux livres de Raymond Murphy (USR-07) et demande d'aligner l'ordre des pistes et des notions sur leur progression : le livre élémentaire d'abord, puis son approfondissement intermédiaire. Les anciennes pistes « Structure de la phrase », « Mots pièges » et « Communication professionnelle » mélangeaient des unités du début et de la fin des livres : aucun simple réordonnancement ne pouvait suivre Murphy. Le conflit a été signalé et l'utilisateur a tranché.
- **Décision.**
  - Neuf pistes calquées sur les blocs du livre rouge : Temps verbaux ; Passif, modaux et discours indirect ; Questions et auxiliaires ; Verbe + -ing ou to ; Noms, pronoms et déterminants ; Adjectifs, adverbes et ordre des mots ; Prépositions et phrasal verbs ; Phrases complexes ; Vocabulaire professionnel (hors Murphy, en dernier).
  - Dans une piste, les notions sont classées selon la première unité du livre rouge qu'elles citent, puis viennent les notions propres au livre bleu.
  - « Conditionnels et politesse » est scindée en « Conditionnels » (Phrases complexes) et « Demandes polies et offres » (Passif, modaux…), comme dans Murphy.
  - Notions ajoutées, toutes en phase 8 :
    - demandées par l'utilisateur : _used to_, _have got_, _there is/there are_, verbe + -ing ou to, _some/any/no_, _much/many/few/little_, comparatifs et superlatifs, adjectifs et adverbes, question tags et réponses courtes, prépositions de lieu et de mouvement, phrasal verbs, _wish_ ;
    - ajoutées pour couvrir les livres : futur continu et futur antérieur, exprimer le but, pronoms et possessifs, _all/every/each/both_, _too/enough/so/such_ ; les phrasal verbs sont scindés en deux notions.
  - Le programme compte désormais 50 notions, dont 13 en phase 3. PEDAGOGY §11 est la **source unique** (ordre, identifiants, phases, références) ; un script a vérifié que chaque unité des deux livres est soit rattachée, soit listée en §11.3 avec sa raison.
  - Les identifiants des notions hors phase 3 sont renommés avec le préfixe de leur nouvelle piste (`traps-articles` → `nouns-articles`, etc.). Aucune donnée ni aucun code ne les utilise encore ; les identifiants de phase 3 (`tense-*`) sont inchangés.
- **Raison.** C'est le choix de l'utilisateur. Suivre la même progression que ses livres rend l'étude parallèle cohérente, et les renvois d'unités ont du sens.
- **Alternatives écartées.** Garder les 4 pistes et réordonner seulement à l'intérieur : l'ordre global n'aurait suivi Murphy qu'approximativement.

### D-037 — Ajouts de phase 8 dans la piste Temps verbaux (2026-09-27)

- **Contexte.** Suivre Murphy place _have got_, _used to_ et le futur continu/futur antérieur dans la piste Temps verbaux, entre des notions de phase 3. Or la phase 3 doit livrer la piste « complète », sans changer de contenu. Le conflit a été signalé et l'utilisateur a tranché.
- **Décision.** Ces trois notions gardent leur place Murphy dans la piste, mais ne sont livrées qu'en phase 8. La phase 3 livre exactement ses 13 notions d'origine. CUR-10 et la feuille de route parlent désormais des « 13 notions de phase 3 de la piste Temps verbaux ». L'ordre interne de la piste suit Murphy : le présent continu passe avant le présent simple, le passé continu avant le present perfect, et _just/already/yet/still_ avant _for/since/ago_.
- **Raison.** L'alignement sur Murphy est respecté sans alourdir la phase 3. Le moteur de parcours traite chaque notion indépendamment : une notion livrée plus tard apparaîtra simplement comme « non commencée ».
- **Alternatives écartées.** Une piste séparée « Autres formes verbales » : elle aurait gardé la piste strictement identique, mais au prix d'un écart à l'ordre Murphy.

### D-038 — Références « Pour aller plus loin », livrées en phase 3 (2026-09-27)

- **Contexte.** Le champ de référence fait partie de la structure des notions, construite en phase 3. Le conflit avec « le contenu de la phase 3 ne change pas » a été signalé et l'utilisateur a tranché.
- **Décision.**
  - Champ facultatif `references?: { book, units[] }[]`, avec au plus une entrée par livre, validé par Zod.
  - Affichage sous la leçon : « Pour aller plus loin : livre rouge, unité 16 ».
  - Les unités sont renseignées **uniquement** à partir de `docs/references/murphy-contents.md`. Un test de phase 3 vérifie que chaque unité existe dans ce fichier et que le code reprend exactement PEDAGOGY §11.
  - Livré en phase 3 et rempli pour ses 13 notions. Les leçons et les exercices de la phase 3 ne changent pas ; seul ce petit élément s'ajoute.
  - Les unités sans notion (PEDAGOGY §11.3) seront réexaminées en phase 8.
- **Raison.** Ajouter le champ plus tard aurait obligé à migrer le schéma, et l'exemple de l'utilisateur (just, already, yet) concerne justement une notion de phase 3.

### D-039 — Libellés des livres : rouge et bleu (2026-09-27)

- **Contexte.** Le fichier de référence fourni appelait _Essential Grammar in Use_ « livre bleu » et _English Grammar in Use_ « livre rouge ». Ce point a été signalé comme possiblement inversé, sans certitude.
- **Décision.** Sur choix de l'utilisateur : _Essential Grammar in Use_ = **livre rouge**, _English Grammar in Use_ = **livre bleu**. Le fichier `docs/references/murphy-contents.md` a été corrigé en conséquence ; seuls les libellés ont changé, pas les unités. L'exemple de la demande, « livre bleu, unité 16 » (just/already/yet dans le livre élémentaire), s'affiche donc « livre rouge, unité 16 ».
- **Raison.** Les libellés doivent correspondre aux couvertures des exemplaires de l'utilisateur. Ils ne sont définis qu'à un seul endroit (`books.ts`, en phase 3), ce qui les rend faciles à corriger.

### D-040 — Taxonomie : définitions élargies aux nouvelles notions (2026-09-27, complète D-021)

- **Contexte.** La taxonomie est fixe (TAX-01). Plusieurs nouvelles notions n'avaient pas de catégorie évidente : possessifs, déterminants, verbe + -ing ou to, formes des adjectifs et adverbes, particules des phrasal verbs.
- **Décision.** Les 15 catégories restent inchangées ; seules leurs définitions sont élargies (PEDAGOGY §7.2 et §7.4) :
  - `accord_sujet_verbe` couvre l'accord des pronoms et possessifs avec leur référent (_his/her_) ;
  - `articles` couvre les autres déterminants (_some/any/no_, _each/every_, _both/either/neither_) ;
  - `choix_lexical_collocations` couvre les constructions régies par un mot (verbe + -ing ou to, but exprimé par _to_) et le choix entre formes voisines (_good/well_, _bored/boring_, comparatifs) ;
  - `prepositions` couvre les particules des phrasal verbs, et `ordre_des_mots` la place de leur complément ;
  - `temps_verbaux` couvre _used to_, _have got_ et le temps après _wish_ ou dans une phrase en _if_.

  Une nouvelle règle de départage n° 3 classe la forme d'un verbe complément. Les exemples ajoutés respectent le critère décisif (D-035).

- **Raison.** C'est le seul moyen d'accueillir les notions ajoutées sans toucher à la taxonomie fixe.

### D-041 — Contenu original, sans reprise des livres (2026-09-27)

- **Décision.** Explications, exemples et exercices de l'app sont entièrement originaux (CUR-15). Aucun texte ni aucun exercice des livres de Murphy n'est reproduit, ni dans l'app ni dans le code. Le fichier `docs/references/murphy-contents.md` ne contient que des titres d'unités, et l'app n'affiche que le libellé du livre et les numéros d'unités. La revue vérifie ce point (AGENTS.md).
- **Raison.** C'est une exigence de l'utilisateur, et le respect du droit d'auteur. Les livres restent une lecture complémentaire, pas une source.

### D-042 — Revue de la mise à jour Murphy (2026-09-27, complète D-035, D-036 et D-038)

- **Contexte.** La revue de Codex (commits `f41379b` à `b447cb4`) relève trois exemples dont l'intention n'était pas fixée (D-035), le rattachement de l'unité bleue 80 (« Noun + noun ») à une notion dont l'intitulé ne couvrait pas les noms composés, et des préfixes d'identifiants abrégés non documentés.
- **Décision.**
  - Exemples contextualisés dans PEDAGOGY : le regret porte sur la situation présente (_I wish I had more time_) ; Anna utilise _she/her_ et parle de sa propre mère ; _pick me up_ signifie « venir me chercher ».
  - L'unité bleue 80 reste rattachée à `nouns-countable-uncountable` (identifiant inchangé). La notion devient « Dénombrables, indénombrables, pluriels et noms composés », et la catégorie `indenombrables_pluriels` couvre explicitement les noms composés, avec ou sans nombre (_a bus driver_, _a three-year plan_).
  - Le préfixe des identifiants de chaque piste est documenté dans une colonne de PEDAGOGY §11.1 (`tense-`, `adj-`, `prep-`, `vocab-`…), et ARCHITECTURE §5 y renvoie. Un contrôle par script a vérifié les 50 identifiants.
- **Raison.** Les noms composés posent un vrai problème de nombre aux francophones (_a documents list_ → _a document list_) : les rattacher à cette notion est plus utile que de laisser l'unité sans notion.

### D-043 — Toutes les tables locales déclarées dès la version 1 (2026-09-28)

- **Contexte.** La feuille de route demande en phase 1 le modèle de données et les schémas Zod de **toutes** les tables locales, alors que la plupart ne servent qu'à partir des phases 3 à 7.
- **Décision.**
  - Les vingt tables d'ARCHITECTURE §4.2 sont déclarées dans la version 1 de Dexie. Chacune a son schéma Zod et une entrée du registre `src/data/tables.ts` : classe de synchronisation, clé primaire, version du schéma, fonctions de migration, présence dans l'export.
  - Les schémas des tables des phases 3 à 7 sont des **premières versions**. Tant qu'aucune donnée n'y est écrite, leur phase peut les modifier sans migration. Dès qu'une phase les remplit, tout changement passe par `schemaVersion` et une fonction de migration testée.
  - Les contenus dont le format appartient à une phase ultérieure sont acceptés comme JSON valide (`z.json()`), puis validés par leur schéma définitif dans cette phase : l'exercice généré (P3), la sortie de correction (P2 et P4), les réponses du diagnostic (P5).
  - Conséquence pour la phase 3 : `generatedExercises` (couche données) doit valider un exercice avec le même schéma que le socle. Ce schéma vivra donc dans `src/domain/curriculum`, et non dans `src/content/schema.ts`, car la couche données ne peut pas importer le contenu (ARCHITECTURE §3).
- **Raison.** Les versions Dexie restent additives, et l'export est complet dès maintenant.

### D-044 — Clés naturelles communes à tous les appareils (2026-09-28, à vérifier en phase 2)

- **Décision.** Trois tables gardent une clé naturelle, identique sur tous les appareils, plutôt qu'un UUID :
  - `settings`, avec la clé fixe `"settings"` ;
  - `notionProgress`, avec l'identifiant de notion ;
  - `ruleNotes`, avec la catégorie.

  Deux appareils modifient ainsi le **même** document, que la synchronisation fusionne, au lieu d'en créer deux.

- **Conséquences pour la phase 2.**
  - La colonne `sync_documents.id` d'ARCHITECTURE §4.3 doit être de type `text`, et non `uuid`.
  - La clé unique du lexique (`key`) peut entrer en conflit entre deux appareils. La phase 2, ou la phase 4 qui remplit le lexique, doit choisir une règle, par exemple dériver l'identifiant de la clé.
- **Raison.** Une clé primaire Dexie ne peut pas être changée après coup sans créer une nouvelle table : il fallait trancher avant la première donnée écrite.
- **Suite (2026-09-29).** Vérifiée en phase 2 : voir D-063 (colonne `text`, règle du lexique).

### D-045 — File de synchronisation alimentée à partir de la phase 2 (2026-09-28)

- **Décision.** En phase 1, les écritures passent par `writeRecord` (validation Zod) et par des dépôts qui calculent un `updatedAt` monotone, mais n'écrivent pas encore dans `syncOutbox`. La phase 2 ajoutera l'écriture dans la file, dans la même transaction, et un **premier envoi complet** des données existantes.
- **Raison.** Le format de la file dépend du protocole de synchronisation (P2). Un premier envoi complet est de toute façon nécessaire pour un appareil qui se connecte pour la première fois.
- **Précaution associée.** La lecture des réglages n'écrit jamais les valeurs par défaut. Sinon, un nouvel appareil enregistrerait des réglages par défaut récents, qui écraseraient ceux d'un autre appareil à la première synchronisation.

### D-046 — Règles d'équivalence de la correction locale (2026-09-28)

- **Décision.** Deux réponses sont équivalentes si elles ont une lecture normalisée commune (`src/domain/correction`). La normalisation ignore :
  - la casse, les apostrophes et guillemets typographiques, les espaces, la ponctuation, les séparateurs de milliers ;
  - les traits d'union entre les mots (_three-year_ = _three year_), et soude quelques mots (_e-mail_ = _email_).

  Chaque réponse est ensuite développée :
  - toutes les lectures des contractions (_he's_ → _he is_ ou _he has_ ; _I'd_ → _I would_ ou _I had_ ; _can't_ = _cannot_ = _can not_), sans développer le _'s_ possessif après un nom ;
  - les graphies britannique et américaine, ramenées à une forme canonique **des deux côtés** (_organise_ = _organize_, _colour_ = _color_, _learnt_ = _learned_) ;
  - les nombres de zéro à vingt, en lettres ou en chiffres.

  Le résultat est « correct » si une réponse acceptée correspond, « incorrect » seulement si une erreur connue correspond, et « inconnu » sinon. Une réponse inconnue n'est **jamais** déclarée fausse (NO-05).

- **Raison.** Une règle appliquée des deux côtés ne peut rapprocher que des formes que l'apprenant n'écrirait pas. Les règles génériques sont bornées pour ne jamais confondre deux vrais mots : _four_ et _for_, _prise_ et _prize_ restent distincts, tests à l'appui.
- **Limite connue.** _analyses_ (nom) et _analyzes_ (verbe) deviennent équivalents. Cette indulgence porte sur l'orthographe ; elle ne rejette jamais une réponse juste.

### D-047 — Résolubilité des cartes : règles et prudence (2026-09-28)

- **Décision.** `isCardSolvable` (`src/domain/cards/solvability.ts`) refuse une carte :
  - sans sens en français, ou dont le « sens en français » est en fait une réponse anglaise ;
  - sans réponse, ou avec une variante vide ;
  - dont l'indice contient une réponse acceptée (mot entier, contractions comprises) ;
  - issue d'une erreur, sans indice ou sans tentative précédente, ou dont la tentative précédente est elle-même une réponse acceptée (ce n'était pas une erreur, NO-05) ;
  - dont la phrase à trou ou le contexte de collocation ne contient pas exactement un trou (`___`).

  Le schéma Zod d'une carte ne contrôle que sa **forme**. Une carte non résoluble peut donc être stockée, mais seulement suspendue : c'est le cas à l'import (motif `unsolvable`), pour ne rien perdre (MOD-14). Le dépôt, lui, refuse de la créer et n'écrit rien.

  `isCardPresentable` exclut toute carte suspendue ou non résoluble. Les cartes maîtrisées restent présentables pour leurs révisions de maintien (CARD-06).

- **Raison.** Le contrôle de l'indice est volontairement prudent : un mot français identique à une réponse anglaise courte (_on_, _a_) fait refuser la carte. Refuser une bonne carte est moins grave que montrer un indice qui donne la réponse. Les prompts de la phase 4 devront donc demander des indices qui ne citent pas la réponse.

### D-048 — Paramètres de répétition espacée (2026-09-28, à calibrer en phase 4)

- **Décision.**
  - ts-fsrs 5.4 (algorithme FSRS-6), encapsulé dans `src/domain/srs`, seul module autorisé à l'importer (règle ESLint).
  - Paramètres : rétention visée 0,9, intervalle maximal de 100 ans, étapes d'apprentissage de 1 et 10 minutes, réapprentissage de 10 minutes.
  - Variation aléatoire des échéances (fuzz) activée. ts-fsrs la tire d'une graine déduite de l'heure de révision et de l'état de la carte : le calcul reste déterministe.
  - L'état est stocké en JSON, avec des dates en millisecondes. Le champ `elapsed_days`, obsolète dans ts-fsrs 5 et recalculé par la bibliothèque à chaque révision, n'est pas stocké.
  - La correspondance entre résultat et note (PEDAGOGY §6.1) et la règle de maîtrise (CARD-06) sont des fonctions pures du même module.
- **Raison.** Ce sont les valeurs par défaut de la bibliothèque, adaptées à des séances courtes : une carte ratée revient dans la même séance. Elles seront ajustées avec l'usage réel des Reprises.

### D-049 — React Router 8 et adresses en français (2026-09-28)

- **Décision.** Navigation avec React Router 8 en mode déclaratif (`BrowserRouter`, `Routes`), importé depuis `react-router`. Les adresses sont en français (`/reglages`).
- **Raison.** Une quinzaine d'écrans arrivent, avec des paramètres (notion, étape) et le bouton retour d'Android : une bibliothèque standard, connue du relecteur, vaut mieux qu'un routeur maison.

### D-050 — Règles de couches par `no-restricted-imports` (2026-09-28)

- **Décision.**
  - Les dépendances entre couches (ARCHITECTURE §3) sont imposées par `eslint.layers.ts`, avec la règle native `no-restricted-imports` : les imports relatifs qui entrent dans un dossier de couche interdit sont refusés par expression régulière.
  - Le domaine n'a en plus accès ni au réseau, ni au stockage, ni aux objets du navigateur, ni à `Date.now()`, `new Date()` ou `Math.random()`.
  - Un test (`scripts/eslint-layers.test.ts`) passe du code d'essai dans chaque couche et vérifie que la configuration réelle applique ces règles.
- **Conséquence.** Les noms de dossiers de couche (`app`, `features`, `ui`, `domain`, `data`, `services`, `content`) sont réservés : aucun sous-dossier ne doit les réutiliser.
- **Alternatives écartées.** `eslint-plugin-import-x` (`no-restricted-paths`) : une dépendance et un résolveur de plus pour le même résultat.

### D-051 — Direction visuelle : polices système et `light-dark()` (2026-09-28)

- **Décision.**
  - Chaque couleur est définie une seule fois avec `light-dark()`. Le thème suit le téléphone par défaut, sauf si les Réglages en imposent un (`data-theme`).
  - Un test vérifie les contrastes de toutes les couleurs dans les deux thèmes : 4,5:1 pour le texte, 3:1 pour les marques de correction et les contours.
  - Polices système : sans empattement pour l'interface, avec empattement pour le contenu anglais, appliquée automatiquement à tout élément `lang="en"`. Aucun fichier de police n'est chargé.
- **Raison.** `light-dark()` est pris en charge par Chrome depuis 2024. Les polices système s'affichent immédiatement, hors ligne et sans aucun poids. Le choix d'une police embarquée pourra être revu.

### D-052 — Réglages livrés en phase 1 (2026-09-28)

- **Décision.**
  - Livrés : variante d'anglais (britannique par défaut), thème, objectif quotidien (20 minutes), plafonds de cartes (10 nouvelles et 60 révisions), autocorrection (activée), fréquence de l'e-mail guidé (une fois par semaine), profil (domaines et remarques libres), export et import.
  - Les valeurs numériques se choisissent dans des listes, pour qu'aucune valeur intermédiaire ne soit enregistrée pendant la frappe.
  - Chaque choix s'affiche aussitôt et s'enregistre immédiatement ; il est annulé à l'écran si l'enregistrement échoue.
  - Le choix de la voix et de la vitesse de lecture est reporté à la phase 3, avec la lecture audio des exemples. Les champs existent déjà dans le schéma.
- **Raison.** La voix ne sert à rien avant la première lecture audio, et la liste des voix dépend de la synthèse vocale (ARCHITECTURE §12).

### D-053 — Brouillons de saisie (2026-09-28)

- **Décision.** Un champ de texte libre utilise `useDraft`. Le texte est enregistré localement :
  - 600 ms après la dernière frappe ;
  - quand la page est masquée ou fermée, quand le champ disparaît, et avant une mise à jour de l'application.

  Il est restauré quand le champ réapparaît, avec la mention « Brouillon restauré », puis supprimé après un envoi réussi. Si la valeur enregistrée change ailleurs (import, plus tard synchronisation), le champ la suit, sauf si l'apprenant a un texte non enregistré. Les brouillons sont exportés, jamais synchronisés.

- **Raison.** NO-06 et UI-03. Suivre la valeur enregistrée évite qu'un « Enregistrer » renvoie un texte périmé par-dessus une version plus récente.

### D-054 — Export, import et sauvegardes automatiques (2026-09-28)

- **Décision.**
  - L'export contient toutes les tables de données de l'apprenant, brouillons compris, **telles qu'elles sont stockées**, même un enregistrement illisible. L'état technique de la synchronisation en est exclu.
  - L'import affiche un aperçu, puis applique les règles de la synchronisation dans **une seule transaction** : tout ou rien. Il n'efface jamais rien, et n'écrase jamais un enregistrement local illisible. Il laisse de côté une entrée du lexique dont l'expression existe déjà sous un autre identifiant.
  - Avant toute montée de version de la base, une copie complète est faite dans une base séparée (`anglais-backups`, trois copies gardées), téléchargeable depuis les Réglages. Si la copie échoue, la montée de version n'a pas lieu. Au démarrage normal, seule la version de la base est lue.
- **Raison.** NO-06 : ni un import ni une migration ne doivent perdre une donnée, même illisible pour la version actuelle.

### D-055 — PWA : icônes générées, pas d'annonce « hors ligne » (2026-09-28)

- **Décision.**
  - Les icônes (192 et 512 px, masquable, Apple, favicon SVG) sont générées à partir d'un seul dessin par `npm run generate:icons`, avec le Chromium de Playwright, et versionnées dans `public/`.
  - Le service worker précache l'application entière : les motifs par défaut, plus le manifeste et les icônes.
  - Seul le bandeau « Nouvelle version disponible » est affiché. L'annonce « prête à fonctionner hors connexion » est supprimée : son bandeau fixe masquait le bas de l'écran, boutons compris, pour une information qui ne demande aucune action. L'accueil l'indique déjà.
- **Raison.** Aucune dépendance de traitement d'image. UI-01 : rien ne doit masquer les actions de l'écran.

### D-056 — En-têtes de sécurité, tests sous la CSP de production (2026-09-28)

- **Décision.**
  - `vercel.json` envoie une Content-Security-Policy stricte : `'self'` seulement, sans `unsafe-inline` ni `unsafe-eval`, et `connect-src 'self'` jusqu'à l'ajout de Supabase en phase 2.
  - Il envoie aussi `Referrer-Policy: no-referrer`, `nosniff`, l'interdiction de l'affichage dans un cadre, et une `Permissions-Policy` qui n'autorise le micro qu'à l'application.
  - Les adresses internes sont réécrites vers `index.html`, mais jamais un fichier absent de `/assets/`. Le service worker n'est jamais mis en cache.
  - `vite preview` envoie les mêmes en-têtes, lus dans `vercel.json`, et chaque test e2e échoue à la moindre erreur de console : une violation de la CSP casse donc les tests.
  - L'enregistrement du service worker est fait par l'application, jamais par un script en ligne.
- **Raison.** Une CSP qui n'est testée qu'en production casse en production. Le serveur de développement n'envoie pas ces en-têtes, car le rechargement à chaud de Vite a besoin de scripts en ligne.

### D-057 — Revue de la phase 1 (2026-09-29, complète D-046, D-047, D-050, D-053 et D-054)

- **Contexte.** La revue de Codex (commits `b7b445d` à `a5e0fc0`) relève quatre défauts importants et un mineur, tous vérifiés et corrigés.
- **Décision.**
  1. **Graphies (complète D-046).**
     - Les règles génériques en _-ise_ et _-yse_ acceptaient des fautes (_exercize_ pour _exercise_) et confondaient le nom pluriel _analyses_ avec le verbe _analyzes_. Seules des **paires attestées** sont désormais rapprochées : une liste fermée de mots en _-ise_/_-ize_, les formes verbales de _analyse_, et les mots en _-our_ suivis d'une terminaison où l'anglais britannique garde le _u_ (_humourous_ reste une faute).
     - Les graphies qui dépendent de la fonction grammaticale ne sont jamais rapprochées : _practise_, _licence_, _analyses_. Elles sont listées dans `CONTEXT_DEPENDENT_SPELLINGS`, pour que le test du socle (phase 3) exige les deux graphies dans les variantes.
     - _one_ n'est plus rapproché de _1_ : c'est aussi un pronom (_the blue one_).
  2. **Indices (complète D-047).** Un indice qui contient la réponse sous une autre forme (_meetings_ pour _meeting_, _finish_ pour _finished_, _go_ pour _went_) est refusé. La comparaison se fait par familles de mots, avec une racinisation volontairement grossière : pluriels, _-s_, _-ed_, _-ing_ avec _e_ muet et consonne doublée, _-ies_/_-ied_, et les formes irrégulières fréquentes. Les mots de trois lettres ou moins restent comparés exactement. Le verbe à conjuguer va dans le champ « infinitif » de la carte, jamais dans l'indice.
  3. **Enregistrements illisibles (complète D-053 et D-054).**
     - Un brouillon illisible était traité comme absent : la pause de frappe suivante l'écrasait, et vider le champ le supprimait, sans avertissement.
     - La version 2 de la base ajoute une table locale `quarantine`, exportée et jamais synchronisée. Avant d'écrire ou de supprimer un brouillon ou les réglages, une version stockée illisible y est copiée telle quelle (`setAsideIfUnreadable`).
     - Le dépôt des brouillons distingue désormais « illisible » d'« absent », et le champ avertit l'apprenant (« Ancien brouillon illisible »). Les réglages illisibles sont mis de côté de la même façon, au lieu d'être remplacés après un simple avertissement.
     - Cette première montée de version réelle passe par la sauvegarde automatique ; un test ouvre une base de version 1 contenant des données avec l'application en version 2.
  4. **Règles de couches (complète D-050).** Les chemins écrits autrement (`../.././features/x`) et les `import()` dynamiques échappaient à l'expression régulière. Une règle locale, `layers/layer-imports`, résout désormais chaque chemin avant d'en déterminer la couche. Elle vérifie les imports statiques, les `export … from`, les `import()` dynamiques (un chemin calculé est refusé), les `typeof import()` dans les types, et les chemins `/src/…`. L'interdiction du SDK Anthropic garde une seconde règle indépendante.
  5. **Contractions (complète D-046).** Après un nom, _'s_ est aussi lu _is_ ou _has_ quand le mot suivant exclut un possessif : préposition, _not_, article, _been_, _here_, _there_, _always_, _never_, _already_ (_My manager's in the office_). Les mots qui admettent les deux lectures gardent la seule lecture possessive (_the manager's meeting_ ne devient jamais _the manager is meeting_).
- **Raison.** NO-05 interdit de refuser une réponse juste, mais COST-02 exige aussi qu'une faute ne soit pas acceptée localement. Dans le doute, une réponse est désormais « inconnue », jamais « correcte » ni « fausse ». NO-06 : aucune donnée, même illisible, ne disparaît sans être conservée.
- **Non vérifiable par la revue**, et laissé à l'usage réel : le déploiement sur Vercel et ses en-têtes en production, l'installation sur un téléphone physique, une coupure brutale pendant une écriture IndexedDB.
- **Contre-revue de Codex** (2026-09-29), sans défaut bloquant ; les cinq corrections sont confirmées. Deux compléments :
  - **Mots qui ressemblent à une forme fléchie (complète le point 2).** Le retrait du _-s_ rapprochait _news_ de _new_ : une carte de réponse _news_ était refusée à tort si son indice disait _new information_. Une liste de mots fréquents, terminés par _-s_, _-ing_ ou _-ed_ sans en être une flexion (_news_, _economics_, _physics_, _series_, _species_, _means_, _evening_, _morning_…), est désormais comparée telle quelle. Le cas de Codex est un test négatif.
  - **`import … = require(…)` (complète le point 4).** La forme `import type foo = require('…')`, avec ou sans `type`, échappait à la règle de couches ; elle est désormais contrôlée et testée.
- **Point noté pour plus tard.** Vite signale un fichier JavaScript de 502,75 kB, au-delà de son seuil d'avertissement de 500 kB. Rien à corriger en phase 1 ; si la taille gêne quand le programme arrivera, le code sera découpé par écran plutôt que le seuil relevé (ROADMAP, phase 3).

### D-058 — Règles sur l'anglais : listes fermées et cas négatifs (2026-09-29)

- **Contexte.** Les défauts les plus fréquents des revues de Codex (D-035, D-042, D-057) viennent de règles linguistiques trop générales :
  - l'équivalence _-ise_/_-ize_ appliquée à tous les mots, qui acceptait _exercize_ ;
  - le retrait du _-s_, qui rapprochait _news_ de _new_ ;
  - des exemples présentés comme faux sans contexte.
- **Décision** (choix de l'utilisateur, après relecture des revues). Toute règle sur l'anglais (équivalence ou variante acceptée, graphie, contraction, flexion, exemple présenté comme faux) :
  - part d'une **liste fermée de formes attestées**, jamais d'une règle générique (suffixe, terminaison, motif) ;
  - s'accompagne, dans ses tests, de **cas négatifs** : ce qui ne doit pas être accepté ni rapproché ;
  - respecte le critère décisif de D-035 : une forme n'est présentée comme fausse que si elle l'est dans toutes les interprétations plausibles.

  La règle figure dans CLAUDE.md (règle impérative 9) et dans AGENTS.md (règle 11 et priorité de revue 1).

- **État du code existant**, vérifié le 2026-09-29.
  - `spelling.ts` (paires et radicaux attestés, terminaisons en liste fermée) et `contractions.ts` (listes fermées) respectent déjà la règle, avec leurs cas négatifs.
  - Deux règles génériques subsistent :
    - la normalisation lit tout trait d'union comme une espace : _I will follow-up with the client_ est accepté pour _follow up_ (verbe), alors que _follow-up_ est le nom ;
    - `inflections.ts` rapproche les formes par leurs terminaisons régulières, avec une liste d'exceptions : _united_ y est encore rapproché de _unit_. L'erreur va dans le sens prudent (une carte est refusée, aucune réponse n'est acceptée), mais la règle reste générique.
  - Leur mise en conformité est inscrite au début de la phase 3, avant que le socle d'exercices utilise la correction locale.
  - **Suite (2026-09-30)** : mise en conformité faite au début de la phase 3 (D-072).
- **Raison.** Une règle générique accepte des fautes ou rapproche des mots différents sans qu'aucun test positif le révèle. Une liste fermée se relit mot par mot, et les cas négatifs rendent visible ce qu'elle exclut.

### D-059 — Revues : une par phase, revue de l'anglais en phase 3 (2026-09-29)

- **Décision** (choix de l'utilisateur).
  - Chaque phase reçoit une revue de Codex, puis au plus une contre-revue des corrections, sauf s'il reste un point bloquant.
  - En phase 3, une revue de Codex est consacrée à la justesse de l'anglais : leçons, exemples, réponses attendues et variantes. Elle est distincte de la revue du code.
  - L'utilisateur relit ensuite un échantillon d'exercices avant la clôture de la phase 3.
  - La limite d'une contre-revue s'applique à chacune des deux revues de la phase 3, celle du code et celle de l'anglais (confirmé par l'utilisateur le 2026-09-29).
- **Raison.** Limiter les allers-retours garde le rythme des phases, sans jamais laisser passer un point bloquant. En phase 3, une réponse attendue fausse serait le pire défaut possible (CUR-06) : la justesse de l'anglais mérite une revue qui ne soit pas noyée dans celle du code, et un regard humain.

### D-060 — Compte : clé publique, code par e-mail, compte unique (2026-09-29, vérifie D-013, tranche D-031)

- **Contexte.** Supabase a remplacé les clés « anon » et « service_role » (des JWT) par une clé publique `sb_publishable_…` et une clé secrète `sb_secret_…`.
- **Décision.**
  - Le client reçoit, au moment du build, `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`. Une clé qui ne commence pas par `sb_publishable_` est refusée : l'app reste alors entièrement locale. La clé secrète n'existe que dans l'environnement de l'Edge Function, et le scan de secrets la refuse dans le dépôt. Un `.env.example` documente les deux variables.
  - Connexion par code : `signInWithOtp({ email, options: { shouldCreateUser: false } })`, puis `verifyOtp({ email, token, type: 'email' })`. Le modèle d'e-mail « Magic Link » de Supabase doit contenir `{{ .Token }}` pour envoyer un code au lieu d'un lien. Le code est valable une heure ; un nouveau code peut être demandé toutes les 60 secondes ; l'envoi intégré de Supabase est limité à deux e-mails par heure.
  - **Changement par rapport à D-013** : le compte unique est créé dans le tableau de bord Supabase, et les inscriptions sont fermées dès le départ, au lieu d'être fermées après la première connexion. L'app ne crée jamais de compte (`shouldCreateUser: false`) : il n'existe aucun moment où un inconnu pourrait s'inscrire.
  - La déconnexion ne concerne que ce téléphone et laisse toutes les données locales.
- **Raison.** Option la plus prudente (PROC-04) : aucune fenêtre d'inscription ouverte, aucune clé secrète côté client.
- **Suite (2026-09-30).** Le service d'e-mail intégré de Supabase ne permet pas de modifier le modèle : les codes sont envoyés par Resend, en SMTP (D-071).

### D-061 — Contrat IA copié dans `supabase/functions/_shared` (2026-09-29, tranche D-030)

- **Contexte.** La documentation de Supabase recommande de partager le code entre fonctions dans `supabase/functions/_shared`. L'import de fichiers situés hors de `supabase/` est annoncé avec les déploiements sans Docker, mais des utilisateurs signalent des difficultés, et ce point ne peut pas être vérifié sans déployer.
- **Décision.**
  - `shared/ai` reste la source. `npm run sync:shared` en écrit une copie dans `supabase/functions/_shared/ai` (tests exclus), chaque fichier marqué « généré, ne pas modifier ». Un test vérifie que la copie est à jour.
  - Les dépendances de la fonction sont épinglées dans `supabase/functions/ai/deno.json` (carte d'imports), déclaré aussi dans `supabase/config.toml`. Un test vérifie qu'elles sont identiques aux versions installées pour les tests Node.
  - Deno refuse par défaut les paquets publiés depuis moins de 24 heures (protection contre les attaques de la chaîne d'approvisionnement) : les versions choisies ont au moins une semaine (SDK Anthropic 0.128.0, `@supabase/server` 1.8.0).
  - La CI vérifie la fonction avec Deno (`deno check`, avec cette configuration) ; en local : `npm run check:edge`. Le fichier `deno.lock` n'est pas versionné : son format pourrait être plus récent que celui du Deno de Supabase.
- **Raison.** La disposition documentée par Supabase ne dépend d'aucune fonctionnalité incertaine du déploiement, et la copie ne peut pas diverger sans faire échouer les tests.
- **Vérification en production (2026-09-30).** Le déploiement `--use-api` embarque bien `_shared/ai`, et la fonction tourne sur le runtime de Supabase (compatible Deno 2.1.4, plus ancien que le Deno 2.9 de la CI : ne pas versionner `deno.lock` était justifié).

### D-062 — Authentification et CORS de l'Edge Function (2026-09-29)

- **Contexte.** La vérification JWT de la plateforme (`verify_jwt`) accepte aussi la clé publique, qui est publique par définition : elle n'identifie personne. Avec les nouvelles clés, elle est aussi une cause connue d'échecs, notamment de la requête CORS préalable du navigateur. Supabase fournit désormais un SDK serveur officiel, `@supabase/server` (v1, bêta publique, versionnage sémantique).
- **Décision.**
  - La fonction vérifie elle-même le JWT de l'utilisateur avec `verifyAuth` de `@supabase/server/core` : signature contre les clés publiques du projet (JWKS), émetteur (`<projet>/auth/v1`) et audience (`authenticated`) imposés, rôle `authenticated` et e-mail exigés. Puis l'e-mail doit figurer dans `AI_ALLOWED_EMAILS`.
  - `verify_jwt = false` dans `supabase/config.toml` : aucune protection n'est perdue, et une cause de panne disparaît.
  - Cette vérification suppose des clés de signature asymétriques (le cas des projets récents) : le guide fait vérifier la page **JWT Keys**.
  - CORS : seules les origines de `AI_ALLOWED_ORIGINS` (l'adresse Vercel et, si besoin, le serveur de développement) reçoivent les en-têtes CORS ; les autres reçoivent une erreur 403.
  - Point d'entrée `export default { fetch }`, la forme générée aujourd'hui par Supabase. La configuration est validée par Zod au démarrage ; une configuration invalide fait répondre `server_error` à toute requête, et le journal nomme les variables fautives, jamais leurs valeurs.
- **Raison.** Défense en profondeur sur un chemin qui dépense de l'argent (SEC-05), sans dépendre d'un comportement de la plateforme non vérifiable avant le déploiement.
- **Vérification en production (2026-09-30).** Le point d'entrée `export default { fetch }` fonctionne ; sans session, la fonction répond 401 ; une origine absente de `AI_ALLOWED_ORIGINS` reçoit 403, que le navigateur présente comme une panne réseau (« Le serveur IA n'a pas pu être joint ») : le guide le signale.

### D-063 — Protocole de synchronisation (2026-09-29, vérifie D-044, précise D-015 et D-045)

- **Décision.**
  - **File sortante.** `writeRecord` écrit un enregistrement synchronisé et son entrée de file dans la même transaction ; une transaction englobante doit donc inclure `syncOutbox` (sinon elle échoue, ce que les tests vérifient). Une seule entrée par enregistrement : une nouvelle écriture remplace l'entrée précédente par une entrée plus récente, si bien qu'un envoi en cours ne supprime jamais une écriture qu'il n'a pas vue. L'import JSON alimente la file de la même façon.
  - **Premier envoi.** La première synchronisation avec un compte met en file tout ce qui existe (D-045) ; un changement de compte recommence depuis zéro.
  - **Égalités.** Le serveur est le seul arbitre (comparaison déterministe des documents sérialisés). Les versions qui n'ont pas gagné reviennent dans la réponse de `sync_push`, et l'appareil les adopte si sa version n'a pas changé depuis l'envoi. À la réception, une version de même `updatedAt` mais de contenu différent remplace la version locale, sauf si celle-ci attend d'être envoyée : sans cette règle, un appareil qui avait perdu une égalité et n'avait plus rien à envoyer gardait sa version indéfiniment (défaut trouvé par les tests, corrigé).
  - **Curseur.** Les envois d'un même utilisateur passent un par un (verrou consultatif jusqu'à la fin de la transaction) : les numéros de séquence sont attribués dans l'ordre des validations, et une lecture ne saute jamais une modification.
  - **Rien ne se perd (NO-06).** Un enregistrement reçu illisible va en `quarantine`. Un enregistrement d'une version plus récente de l'app, ou d'une table inconnue, reste sur le serveur ; la « signature de schéma » de l'app est mémorisée, et quand elle change (mise à jour), tout est relu depuis le début. Un enregistrement local illisible est mis de côté avant d'être remplacé, et n'est jamais envoyé.
  - **Lexique (D-044).** Une entrée reçue dont l'expression existe déjà localement sous un autre identifiant est mise en `quarantine` au lieu de violer la clé unique ; la synchronisation continue. Pour éviter ces doublons, la phase 4, qui crée les entrées, dérivera l'identifiant de l'expression normalisée : deux appareils créeront alors le même document.
  - **Clés naturelles (D-044).** `sync_documents.id` est de type `text` ; `settings`, `notionProgress` et `ruleNotes` fusionnent bien entre appareils (vérifié par les tests).
  - **Déclencheurs.** Ouverture de l'app, connexion, retour du réseau, cinq secondes après la dernière écriture, bouton « Synchroniser maintenant ». Une seule synchronisation à la fois ; une demande pendant une synchronisation en provoque une seule de plus. Aucune n'appelle l'IA (COST-01).
- **Raison.** Chaque règle est vérifiée par des tests qui font synchroniser deux appareils à travers les vraies fonctions SQL.

### D-064 — Droits SQL explicites, migrations testées avec PGlite (2026-09-29)

- **Contexte.** Supabase n'accorde plus automatiquement les droits de l'API sur les nouvelles tables (nouveaux projets depuis le 30 mai 2026, tous les projets à partir du 30 octobre 2026) ; les anciens projets, eux, accordaient trop (`anon`, `delete`). Les fonctions SQL restent exécutables par tous par défaut.
- **Décision.**
  - Chaque migration révoque puis accorde explicitement les droits : `authenticated` lit et écrit ses lignes de synchronisation (sans `delete`) et lit ses appels IA ; `anon` n'a rien ; seul `service_role` exécute les fonctions du journal des appels IA.
  - Toutes les fonctions sont en `security invoker` (soumises à la RLS), avec un `search_path` vide.
  - Les migrations sont testées dans PGlite (Postgres compilé en WebAssembly, sans serveur ni Docker), avec les rôles de Supabase et une copie de `auth.uid()`. Un test général vérifie, pour toute migration présente et future : RLS sur chaque table, aucun droit pour `anon`, `search_path` fixé, aucune fonction `security definer`.
- **Raison.** SEC-02 est vérifié automatiquement, et plus seulement à la relecture.

### D-065 — CSP : adresse exacte du projet Supabase (2026-09-29, complète D-056)

- **Contexte.** `vercel.json` est statique ; l'adresse du projet n'existe qu'une fois le projet créé. `vercel.ts` permettrait de la calculer au build, mais ce mécanisme récent ne peut pas être vérifié sans déployer, et il porterait les en-têtes de sécurité.
- **Décision.**
  - `connect-src` autorise `'self'` et l'adresse **exacte** du projet (`https://<ref>.supabase.co`), jamais `*.supabase.co`. `npm run configure:csp -- <adresse>` l'écrit dans `vercel.json`, et refuse toute autre forme.
  - Tout build dont `VITE_SUPABASE_URL` n'est pas autorisée par la CSP échoue en indiquant la commande à lancer, au lieu de produire une app dont toutes les requêtes au serveur seraient bloquées.
  - Les tests e2e construisent l'app avec un faux projet sur sa propre origine (`http://localhost:4193/__supabase`) : la CSP de production s'applique sans modification.
- **Raison.** La CSP la plus stricte possible, sans risque de déploiement cassé en silence.

### D-066 — Chaîne d'appel IA et test de connexion (2026-09-29, complète D-010, D-011 et D-016)

- **Décision.**
  - **Tâche de la phase 2.** Les prompts de correction et de génération appartiennent aux phases 3 et 4. La phase 2 livre une seule tâche, `connection-check` : un appel minimal à Haiku 4.5 (64 tokens de sortie au plus, moins d'un millième de dollar), lancé uniquement par le bouton « Tester la connexion ». Il vérifie toute la chaîne (session, clé, crédit, plafond, sortie structurée, journal des coûts), ce que le guide demande de faire.
  - **Sortie structurée.** `messages.create()` avec `output_config.format = zodOutputFormat(schéma)`, puis validation par la fonction. `messages.parse()` lève une exception sur une réponse invalide et perd le décompte des tokens, alors que chaque appel doit être journalisé à son coût réel (COST-05). Constat pour la phase 4 : le SDK retire aussi `enum` et `const` du schéma envoyé (ils passent dans la description) ; la validation Zod de la fonction reste donc la seule garantie sur les valeurs.
  - **Nouvelles tentatives.** Aucune nouvelle tentative automatique du SDK (`maxRetries: 0`) : une requête répétée pourrait être facturée deux fois sans être journalisée. Une seule nouvelle tentative après une sortie invalide ou un refus du modèle, aucune après `max_tokens` (ARCHITECTURE §8). Délai maximal : 90 secondes.
  - **Budget.** La réservation estime l'entrée à un token pour deux caractères, plus 1 000 tokens de marge, et compte toute la sortie au maximum ; les coûts sont arrondis au millionième de dollar supérieur. Un appel à l'issue inconnue (délai dépassé, connexion perdue) est compté à son coût maximal ; une erreur renvoyée par l'API, à zéro. Les refus (plafond, fréquence) sont journalisés sans coût. Le mois du plafond est le mois UTC.
  - **Idempotence.** Un `requestId` déjà reçu est refusé, quelle que soit sa date (et non plus seulement dans les dix dernières minutes : l'unicité est garantie par la base). Le client fournit un identifiant par action de l'utilisateur ; les phases suivantes le conserveront avec la production concernée.
- **Raison.** COST-01 à COST-07 appliqués côté serveur, avec des chiffres vérifiables dans le journal.
- **Vérification en production (2026-09-30).** Une clé Anthropic d'organisation, rattachée à aucun espace de travail, est refusée (« not scoped to a workspace ») : la clé doit être créée dans un espace de travail (guide, section 9). Pour diagnostiquer ce genre de refus, la fonction écrit désormais le type et le message de l'erreur d'Anthropic dans ses journaux, jamais en base. Le test de connexion a ensuite abouti.

### D-067 — Écran « Consommation » (2026-09-29)

- **Décision.** L'écran `/consommation`, accessible depuis les Réglages, lit la consommation par une requête `GET` à l'Edge Function, qui connaît le plafond configuré (`AI_MONTHLY_BUDGET_USD`) et lit le journal pour l'utilisateur vérifié ; aucun modèle n'est appelé. Il montre le coût du mois (plafond compris, mois UTC), du jour (dans le fuseau du téléphone) et par fonction. Le dernier état est gardé dans `usageSnapshot` et affiché, avec sa date, hors connexion.
- **Raison.** Le plafond n'est connu que du serveur ; le lire à côté des chiffres évite de le recopier côté client.

### D-068 — Client Supabase dans un fichier JavaScript séparé (2026-09-29)

- **Contexte.** `supabase-js` porte le fichier JavaScript principal de 502 kB à 745 kB (219 kB compressés).
- **Décision.** Le code serveur est chargé par un import dynamique, pendant l'ouverture de la base, et pas du tout si aucun serveur n'est configuré. Le fichier principal revient à 521 kB (163 kB compressés), le client Supabase fait 224 kB ; les deux sont précachés pour le hors ligne. Le découpage par écran reste prévu en phase 3.

### D-069 — Revue de la phase 2 (2026-09-30, complète D-063, D-064 et D-066)

- **Contexte.** La revue de Codex (commits `81a7f43` à `9494e20`) ne relève aucun défaut bloquant, deux défauts importants et un défaut mineur, tous vérifiés et corrigés.
- **Décision.**
  1. **Modification hors ligne perdue si l'horloge d'un appareil retarde (NO-06, D-015).** Quand une version reçue remplaçait une version locale en attente d'envoi, celle-ci disparaissait avec son entrée de file. Or, avec une horloge en retard, la version perdante peut être la plus récente en réalité. Désormais, avant qu'une version reçue la remplace, toute version locale qu'aucune autre copie ne garde est copiée dans `quarantine`, qui est exportée : une modification pas encore envoyée, ou une version concurrente de même `updatedAt`. Le rapport de synchronisation les compte, et les Réglages l'indiquent (« … a été remplacée par une version plus récente d'un autre appareil ; l'ancienne version est gardée à part »). La règle est une fonction pure testée (`discardsLocalVersion`), avec ses cas négatifs : une version déjà envoyée, remplacée par une plus récente, suit le cours normal de la synchronisation et n'est pas copiée. **Limite connue** : sans numéro de révision, le serveur ne distingue pas une modification faite à partir d'une version d'une modification concurrente ; une version déjà envoyée, puis dépassée sur le serveur par celle d'un appareil dont l'horloge avance, n'est conservée nulle part. Le cas suppose deux appareils utilisés en même temps hors ligne ; il sera réexaminé si l'usage le montre.
  2. **Refus journalisés sans borne (COST-07).** Chaque refus pour fréquence ou plafond ajoutait une ligne à `ai_calls`, sans limite : un compte autorisé pouvait faire grossir la table indéfiniment. Une nouvelle migration (`20260930090000_ai_refusals_not_logged.sql`) remplace `ai_reserve_call` : les refus ne sont plus écrits en base (ils ne coûtent rien et n'atteignent pas le modèle). Ils restent dans les journaux de l'Edge Function (`ai_refused`). Une requête refusée peut donc être renvoyée plus tard avec le même identifiant. La migration de la veille n'est pas modifiée, au cas où elle aurait déjà été appliquée. Ce point remplace « les refus sont journalisés sans coût » de D-066.
  3. **Réponse tardive d'un envoi (NO-06, D-063).** Une version renvoyée par le serveur remplaçait la version locale si son `updatedAt` n'avait pas changé depuis l'envoi : une nouvelle écriture de même `updatedAt` aurait été perdue. La comparaison porte désormais sur le contenu exact envoyé. De plus, `writeRecord` refuse d'écrire un document dont `updatedAt` n'augmente pas : l'invariant de « le plus récent gagne » est imposé par l'API générique, et plus seulement par chaque dépôt.
- **Test instable corrigé.** En répétant les tests e2e, celui du hors-ligne échouait une fois sur quelques dizaines : il vérifiait la disparition du nombre de modifications en attente, qui est masqué pendant une synchronisation, avant que l'envoi ait eu lieu. Il attend désormais l'envoi lui-même (90 exécutions sur 90 réussies).
- **Non vérifiable par la revue**, et laissé à l'usage réel : le projet Supabase déployé (secrets, clés de signature, origines, politiques), deux vrais téléphones, les coupures réseau en production, la facturation et les erreurs réelles de l'API Anthropic.

### D-070 — Contre-revue de la phase 2 (2026-09-30, complète D-069)

- **Contexte.** La contre-revue de Codex confirme que les trois corrections de D-069 fonctionnent, sans défaut bloquant. Elle relève un risque important déjà signalé comme limite dans D-069, et un point mineur.
- **Décision.**
  1. **Version déjà envoyée perdue face à une horloge en avance (NO-06).** Un appareil qui avait envoyé sa version pouvait ensuite adopter une version écrite plus tard par un appareil dont l'horloge avance : sa version n'existait plus nulle part. Le serveur garde désormais les versions remplacées : un déclencheur copie chaque version d'un document dans `sync_document_history` avant qu'un envoi l'écrase (migration `20260930120000_sync_history.sql`). Le propriétaire peut les lire (tableau de bord Supabase, **Table Editor**) ; aucun client ne peut les écrire ni les supprimer. La fonction du déclencheur s'exécute avec les droits de son propriétaire, dans un schéma `private` que l'API n'expose pas, et ne peut pas être appelée directement ; le test de sécurité général l'autorise nommément et vérifie qu'aucun client ne peut l'exécuter. **Rétention** : les dix dernières versions remplacées de chaque document, pour borner la base (une carte change à chaque révision). La limite de D-069 est ainsi levée, tant qu'un document n'a pas été remplacé dix fois de plus.
  2. **Éléments mis de côté sans limite.** Les copies de conflit et les enregistrements illisibles s'accumulaient dans `quarantine` sans moyen de les voir ni de les retirer. **Réglages → Données** les liste (nature, table, date) et propose « Exporter puis retirer du téléphone » : un export qui les contient est téléchargé d'abord, l'apprenant confirme qu'il l'a bien, puis seuls les éléments mis de côté jusqu'à cet export sont retirés. Rien ne peut être retiré sans avoir été exporté.
- **Raison.** NO-06 est une exigence absolue ; l'historique côté serveur la garantit sans changer la règle « le plus récent gagne », qui reste simple. Une révision attribuée par le serveur aurait aussi réglé le cas, au prix d'un protocole plus complexe.
- **Processus (D-059).** C'était l'unique contre-revue de la phase 2 ; ces corrections ne demandent pas de nouvelle revue, sauf point bloquant.

### D-071 — Envoi des codes de connexion par Resend (2026-09-30, complète D-060)

- **Contexte.** En suivant le guide, l'utilisateur constate que le tableau de bord de Supabase refuse de modifier les modèles d'e-mail tant qu'aucun SMTP personnalisé n'est configuré (« Set up custom SMTP to edit templates »). Le message par défaut contient un lien, pas le code `{{ .Token }}` : la connexion par code de D-013 et D-060 est impossible avec le service intégré. Ce service est de toute façon limité à deux e-mails par heure, aux adresses de l'équipe du projet, et sans garantie (documentation Supabase vérifiée le 2026-09-30).
- **Décision.**
  - Les e-mails d'authentification passent par **Resend**, en SMTP (`smtp.resend.com`, port 465, utilisateur `resend`, mot de passe = une clé API). Resend figure parmi les fournisseurs recommandés par Supabase. Le plan gratuit permet 100 e-mails par jour et 3 000 par mois.
  - **Sans nom de domaine** : l'expéditeur est l'adresse de test `onboarding@resend.dev`, qui n'envoie qu'à l'adresse du titulaire du compte Resend. Pour un seul utilisateur, c'est suffisant : le compte Resend est créé avec la même adresse que le compte Supabase.
  - **Sécurité** : la clé a la permission « Sending access » (envoi seulement). Elle n'est enregistrée que dans les réglages SMTP de Supabase, jamais dans le dépôt ni dans une variable Vercel. Même volée, elle ne permettrait d'écrire qu'à l'adresse de l'utilisateur ; le guide explique comment la révoquer et la remplacer.
  - Le modèle « Magic Link », devenu modifiable, envoie le code (`{{ .Token }}`), comme prévu par D-060. Aucun code de l'application ne change.
  - **Solution de repli**, décrite dans le guide : un compte Gmail **dédié**, avec validation en deux étapes et mot de passe d'application (500 e-mails par jour). Jamais la boîte principale : un mot de passe d'application donne accès à toute la boîte aux lettres.
- **Point non vérifiable sans compte.** La documentation de Resend présente `onboarding@resend.dev` comme une adresse de test, et son guide Supabase suppose un domaine vérifié. Qu'elle soit acceptée par l'interface SMTP vers la propre adresse du titulaire n'est pas confirmé par écrit. Le guide indique comment le constater (**Logs → Auth**) et quoi faire sinon (Gmail dédié, ou un domaine vérifié chez Resend).
- **Alternatives écartées.**
  - Revenir au lien magique : il s'ouvrirait dans Chrome plutôt que dans l'application installée, et demanderait de changer le code (D-013).
  - Gmail avec la boîte principale : le mot de passe d'application, enregistré chez Supabase, donnerait accès à toute la boîte.
  - Brevo avec une adresse Gmail comme expéditeur : pas de domaine à vérifier, mais un expéditeur Gmail envoyé par un tiers risque d'être classé comme indésirable ou refusé.
  - Acheter un nom de domaine : quelques euros par an et une configuration DNS, inutiles pour un seul destinataire.

### D-072 — Correction locale : traits d'union et familles de mots (2026-09-30, met en œuvre D-058, complète D-046 et D-057)

- **Contexte.** D-058 laissait deux règles génériques dans la correction locale, à corriger avant le premier usage par le socle : le trait d'union lu comme une espace (_I will follow-up_ était accepté pour le verbe _follow up_) et le rapprochement des formes fléchies par leurs terminaisons (_united_ restait rapproché de _unit_).
- **Décision.**
  - **Traits d'union.** Un trait d'union fait partie du mot : _follow-up_ ≠ _follow up_, _three-year_ ≠ _three year_. Seule une liste fermée de graphies qui désignent le même mot dans tous leurs emplois est soudée : _e-mail_ (et ses formes), _on-line_, _co-operate_ et _co-ordinate_ (et leurs dérivés), _co-worker(s)_. Un tiret entre deux espaces reste de la ponctuation.
  - **Formes fléchies.** Le contrôle des indices ne rapproche plus deux mots que s'ils appartiennent à une même famille d'une liste fermée, écrite forme par forme (`word-families.ts`) : verbes irréguliers, modaux, verbes réguliers et noms fréquents du vocabulaire professionnel, comparatifs. Un mot absent de la liste n'est comparé qu'à lui-même. Seule règle restante : le _'s_ possessif, qui n'est pas une flexion. Pour ce contrôle, un mot composé est aussi lu en ses parties (_a follow-up_ révèle _follow up_), du côté prudent.
  - Cas négatifs testés : _united_/_unit_, _news_/_new_, _planet_/_plan_, _find_/_founded_ (reliés seulement par un troisième mot), _follow-up_/_follow up_, _set-up_/_set up_, _well-known_/_well known_.
- **Conséquences.** Une réponse _a three year plan_ pour _a three-year plan_ devient « non prévue », jamais « fausse » ; le contenu liste les deux graphies quand les deux sont justes. Un indice qui citerait un mot absent de la liste sous une autre forme n'est plus détecté : les indices du socle sont en français et relus, et le prompt de génération interdit de citer la réponse. La clé normalisée du lexique change de définition, sans conséquence : aucune entrée n'existe encore (phase 4).

### D-073 — Catalogue fermé des notions, contenu par notion (2026-09-30, complète D-036, D-038 et D-043)

- **Décision.**
  - `notionIdSchema` devient la **liste fermée** des 50 identifiants de PEDAGOGY §11, dans leur ordre, avec leur piste et leur phase (`src/domain/curriculum/notion-id.ts`). Un test lit PEDAGOGY §11 et vérifie les pistes, les identifiants, l'ordre, les phases, les titres et les références « Pour aller plus loin » ; un autre lit `docs/references/murphy-contents.md` et vérifie chaque unité citée, les libellés et le nombre d'unités de chaque livre.
  - **Écart au plan d'ARCHITECTURE §5** : les titres et les références de toutes les notions sont dans `src/content/catalog.ts`, et non dans un `meta.ts` par notion, pour que la liste du Parcours s'affiche sans charger chaque notion. Chaque dossier de notion contient `lesson.ts`, `exercises.ts`, `placement.ts`, `review.ts` et `index.ts` ; le registre `src/content/index.ts` charge chaque notion à la demande et la valide.
  - Les références sont renseignées pour les 13 notions de la phase 3 seulement (D-038) ; le test refuse une référence pour une notion hors du code.
- **Limite connue.** Un enregistrement d'une version future de l'application qui citerait une notion nouvelle serait illisible pour cette version, donc mis de côté. Les 50 notions du programme sont déjà dans la liste.

### D-074 — Exercices : schéma, correction locale et relectures (2026-09-30, complète D-035, D-043 et D-057)

- **Décision.**
  - **Schéma** (`src/domain/curriculum/exercise.ts`), partagé par le socle et `generatedExercises` : `choice-with-reason` (étape 2), `fill-verb`, `transform` et `place-word` (étape 3), `translate` (étape 4). `checkExercise` refuse tout exercice qui pourrait déclarer fausse une réponse juste : réponse absente des choix, deux choix équivalents, erreur anticipée acceptée, trou absent ou double, indice qui donne la réponse, sens français identique à la réponse, mot déjà placé, graphie dépendante de la grammaire sans son pendant.
  - **Correction.** Une réponse à trou est remise dans sa phrase avant la comparaison : _She ___ left_ + _’s_ donne _She’s left_. Après un nom, _’s_ reste ambigu (D-057) : _the manager’s talking_ est « non prévue ».
  - **Réponse non prévue** : l'apprenant la compare à la réponse de référence et dit si elle a le même sens, avec la forme travaillée bien employée ; la réponse est enregistrée avec le correcteur `user`. Elle n'est jamais déclarée fausse (NO-05). L'IA pourra vérifier ces réponses à partir de la phase 4 (CARD-05).
  - Les options d'une question de choix sont montrées dans un ordre mêlé, stable pour un même passage (dans le contenu, la bonne réponse est souvent écrite en premier).
  - **Relectures** : chaque fichier d'exercices d'une notion porte ses deux marques, datées (`review.ts`) ; le test du socle exige les deux (CUR-06).
- **Conventions du contenu** (critère décisif de D-035).
  - Réponses canoniques en anglais britannique ; les graphies américaines sont rapprochées automatiquement.
  - Le prétérit américain de même sens est accepté comme variante (_I just finished_, _Did you ever work abroad?_, un résultat présent) ; il n'est jamais présenté comme faux.
  - Un choix faux ou une erreur anticipée doit être faux dans toutes les lectures plausibles. Sont donc écartés : le présent simple après _Look!_ (lecture de commentaire en direct), un horaire possible (_We sign the contract on 3 March_), l'accord au pluriel d'un nom collectif (_The bank offer…_, admis en anglais britannique), _What time is the office open?_.
  - Les mots dont la graphie dépend de la grammaire (_practise_, _licence_, _analyses_) sont évités.

### D-075 — Moteur du parcours et test de positionnement (2026-09-30, précise D-022 et D-027 ; valeurs à ajuster en phase 5)

- **Décision** (fonctions pures de `src/domain/curriculum/engine.ts`).
  - Le compteur d'une étape est l'ensemble de ses réponses données dans le Parcours depuis `stepEnteredAt`. Les réponses du positionnement et de la pratique immédiate (phase 4) ne comptent pas.
  - **Rappel** après 4 échecs sur les 6 dernières réponses : séries de 5 exercices de l'étape précédente ; 4 réussites renvoient à l'étape d'origine, compteur remis à zéro. **Point non précisé par PEDAGOGY §3.3**, tranché de façon prudente : une série manquée en ouvre une nouvelle, sans jamais descendre plus bas. À l'étape 2, la leçon est proposée, rien n'est imposé.
  - Une notion acquise peut être pratiquée à l'étape 4 sans que son état change.
  - Ouvrir une notion depuis le Parcours la démarre (PEDAGOGY §3.1) : l'écriture a lieu au clic, jamais à l'affichage. Une leçon ouverte par un lien direct ne démarre rien.
  - **Positionnement** (CUR-08) : 4 questions de choix par notion, corrigées localement. Une notion est réussie si **toutes** ses réponses sont justes (au moins 3 questions) : elle passe « à consolider », à l'étape 4. Une notion déjà commencée, ou déjà testée, n'est pas proposée : un second essai permettrait de réussir au hasard. Les réponses sont enregistrées dans `exerciseAttempts` (contexte `placement`).
  - Une progression illisible n'est jamais écrasée : les réponses sont enregistrées, la notion ne bouge pas, l'écran demande de mettre l'application à jour.
- **Raison.** Un faux positif au positionnement ferait sauter la pratique guidée ; un faux négatif ne coûte que quelques exercices de plus. Le critère strict est donc le plus prudent.

### D-076 — Étapes 4 et 5 avant la correction par l'IA (2026-09-30, provisoire jusqu'à la phase 4)

- **Contexte.** CUR-05 confie à l'IA les réponses inattendues de l'étape 4 et la correction de l'étape 5, mais la tâche de correction (`correct-production`), ses prompts et ses exemples contrastés relèvent de la phase 4 (ROADMAP, ARCHITECTURE §10.2).
- **Décision.**
  - Étape 4 : une traduction non prévue est comparée par l'apprenant (D-074) et compte pour le critère de passage.
  - Étape 5 : l'écran « Produire » propose les amorces et garde le texte dans un brouillon (`path-produce:<notion>`), exporté, jamais perdu ; il annonce que la correction arrive avec la prochaine version. La règle de l'étape 5 (deux productions consécutives sans erreur sur la notion) est codée et testée ; elle sera branchée en phase 4. **Aucune notion ne peut donc être « acquise » en phase 3.**
- **Raison.** Option la plus prudente (PROC-04) : aucun prompt de correction sans les exemples contrastés exigés par AI-04, aucun coût, aucune saisie perdue.
- **Suite (2026-10-07).** Remplacée par D-086 : les étapes 4 et 5 sont corrigées par l'IA, sur demande.

### D-077 — Lecture audio des exemples (2026-09-30, complète D-052 ; ARCHITECTURE §12)

- **Décision.**
  - Synthèse vocale de Web Speech (documentation MDN vérifiée le 2026-09-30 : la liste des voix peut être vide jusqu'à l'événement `voiceschanged`). L'interface `SpeechSynthesizer` et le choix de la voix sont dans le domaine ; l'implémentation est dans `src/services/speech`.
  - Voix proposées : les voix anglaises du téléphone, celles de la variante choisie d'abord. La voix est enregistrée par son `voiceURI` ; si elle disparaît : voix par défaut de la variante, puis sa première voix, puis une autre voix anglaise, puis la langue seule.
  - **Réglages → Lecture audio** : voix, vitesse (0,75 à 1,25, dans une liste), « Écouter un exemple ». Sans synthèse vocale, un message le dit et les boutons d'écoute n'apparaissent pas.

### D-078 — Écrans et notions chargés à la demande (2026-09-30, complète D-057 et D-068)

- **Décision.** Chaque écran, sauf l'accueil et la page introuvable, est chargé à la demande (`React.lazy`), et chaque notion est un fichier séparé (environ 5 kB compressés). Le service worker les précache tous (46 fichiers, 1 046 KiB) : tout s'ouvre hors ligne, ce qu'un test e2e vérifie.
- **Résultat.** Le plus gros fichier JavaScript passe de 521 kB à 287 kB (92 kB compressés) : plus d'avertissement de Vite, sans relever son seuil.
- **Tests.** Les tests d'écran attendent jusqu'à 5 secondes un élément, et 20 secondes au plus par test : sur une machine chargée, le premier chargement d'un écran dépassait parfois la seconde par défaut.

### D-079 — Génération d'exercices par l'IA (2026-09-30, complète D-010, D-012, D-017 et D-066 ; à calibrer en phase 5)

- **Décision.**
  - Tâche `generate-exercises` : Sonnet 5, réflexion à effort bas, `max_tokens` 4 000 (au lieu des 3 000 prévus : six exercices d'environ 200 tokens, plus la réflexion), préfixe mis en cache. Six exercices d'un même type par appel : choix avec raison (étape 2), verbe à compléter (étape 3, seul type généré pour cette étape, car le plus simple à vérifier), traduction (étape 4).
  - Le client n'envoie que l'identifiant de la notion (liste fermée des notions livrées), l'étape, la variante, les domaines de l'apprenant et les phrases déjà vues (au plus 60, de 300 caractères) : aucun texte de l'apprenant. Le prompt et un guide par notion sont côté serveur.
  - La sortie structurée reste simple : les unions (`anyOf`) sont acceptées, pas les contraintes de longueur ou de nombre (documentation vérifiée le 2026-09-30). Le client vérifie chaque exercice (schéma, `checkExercise`, phrase déjà vue) et écarte les autres sans rejeter le lot ; il les stocke avec le modèle et la version du prompt.
  - Le bouton n'apparaît qu'une fois tous les exercices de l'étape faits (socle et exercices déjà générés), sur action explicite (COST-01), avec le coût maximal estimé (environ 0,06 USD) ; il est inactif hors ligne. Les exercices créés sont signalés comme tels et peuvent être signalés : un exercice signalé n'est plus jamais montré, mais il est gardé.
- **Raison.** CUR-07 et COST-09. NO-04 porte sur le socle : les exercices générés s'y ajoutent, vérifiés automatiquement et identifiés comme non relus.
- **Limite connue.** Le SDK retire `enum` et `const` du schéma envoyé (D-066) : le type d'exercice n'est pas imposé par l'API. La validation par l'Edge Function, puis par le client, couvre ce point.

### D-080 — Relecture séparée du socle de la phase 3 (2026-09-30, CUR-13, D-059)

- **Contexte.** Le socle compte 13 leçons, 474 exercices (158 de reconnaissance, 173 de pratique, 143 de traduction), 908 réponses acceptées, 528 erreurs anticipées et 52 questions de positionnement, tous originaux.
- **Décision.** Après la première relecture faite à la rédaction, une relecture séparée a repris chaque notion avec le critère de D-035. Elle a retiré des erreurs anticipées ou des choix faux qu'une lecture plausible rend justes (commentaire en direct après _Look!_, lecture d'horaire, accord pluriel d'un nom collectif, _What time is the office open?_, progressif familier _it’s depending_), ajouté une variante et précisé une leçon (_payed_ au sens de « payer »). La seconde marque de relecture est posée, et le test du socle l'exige.
- **Suite (D-059).** Restent la revue de Codex consacrée à la justesse de l'anglais, distincte de celle du code, puis la relecture d'un échantillon par l'utilisateur, avant la clôture de la phase.

### D-081 — Revues de la phase 3 (2026-10-07, complète D-074, D-079 et D-080)

- **Contexte.** Deux revues de Codex, l'une du code (jusqu'au commit `aae2e9f`), l'autre de la justesse de l'anglais (D-059), et la relecture d'un échantillon par l'utilisateur, qui n'a rien relevé. Chaque point a été vérifié dans le code, ou dans le contexte de l'exercice, avant d'être corrigé.
- **Revue du code : quatre défauts importants, tous confirmés et corrigés.**
  1. **Exercice généré importé ou synchronisé sans vérification (NO-05).** `checkExercise` n'était appliqué qu'à l'enregistrement. Un exercice arrivé par import ou par synchronisation, par exemple un verbe à compléter sans trou, était montré, et n'importe quelle réponse pouvait y être jugée juste. Le dépôt refait désormais toutes les vérifications à chaque lecture. Un exercice qui échoue est gardé, export compris, mais jamais montré.
  2. **Raison juste reformulée, comptée fausse (NO-05).** Seul un doublon exact de raison était refusé : une raison reformulée par l'IA pouvait en justifier une seconde. Les raisons d'un exercice généré doivent désormais reprendre exactement l'une des **combinaisons relues** du socle de la notion, c'est-à-dire la bonne raison et les raisons fausses montrées avec elle dans un exercice relu (89 combinaisons pour les 13 notions, `shared/ai/reasons.ts`). Le prompt les donne à l'IA (version `generate-exercises@2`). Le client les exige à l'enregistrement et à la lecture, et le test du socle vérifie qu'elles restent exactement celles du socle. Une règle « une raison par forme » a été écartée : le socle distingue à dessein plusieurs emplois d'une même forme (habitude ou vérité générale ; _since_ ou _for_), et deux raisons de formes différentes peuvent se recouvrir. Le socle, relu deux fois, n'est pas soumis à cette liste. **Limite connue** : l'IA peut encore écrire une phrase où une raison fausse de la combinaison s'applique aussi. C'est le risque de toute phrase générée, option ambiguë comprise, limité par le prompt, la mention « non relu » et le bouton « Signaler cet exercice ».
  3. **Échec d'enregistrement du positionnement : écran vide (NO-06).** Après la dernière question, l'écran ne montrait plus rien si l'enregistrement échouait. Il garde désormais les réponses, affiche « Résultat non enregistré » et propose « Réessayer ».
  4. **Coût affiché de la génération sous-estimé (COST-10).** Le serveur fait au plus deux tentatives, chacune facturée. La réponse ne rapportait que la dernière, et l'écran annonçait le maximum d'une seule, calculé sur une estimation de 8 000 tokens d'entrée alors que celle du serveur peut atteindre environ 14 100. La réponse rapporte désormais le coût de toutes les tentatives. L'écran annonce le maximum de la demande, deux tentatives comprises, calculé sur une borne de 16 000 tokens d'entrée : un test la compare à l'estimation du serveur pour la plus grosse demande possible. Le maximum affiché passe d'environ 0,06 USD à **0,16 USD** ; le coût réel reste bien inférieur. Ce point remplace le montant de D-079.
- **Revue de l'anglais : aucune réponse attendue fausse ; corrigé ce qui pouvait déclarer fausse une réponse juste.**
  - **Présent simple de commentaire.** Examiné exercice par exercice, avec la précision de l'utilisateur : le présent simple n'est juste en commentaire en direct que si le contexte s'y prête (commentaire sportif, démonstration). Deux exercices de choix s'y prêtaient : « Look at the screen: the share price ___ » (description d'un graphique) et « Look! The price ___ again. » (commentaire d'un écran de marché). Leur phrase porte désormais un indice qui exclut le présent simple dans toutes les lectures (_at the moment_). Les deux autres sont des phrases ordinaires sur la météo, « Look! It ___ again. » (_snow_) et « Regarde, il pleut ! » : _It snows_ et _It rains_ y restent des erreurs. Le prompt cite désormais le commentaire en direct, la démonstration et la description d'un graphique parmi les lectures qui rendent une forme juste. Cela complète D-080, qui avait déjà retiré des distracteurs de ce type sans voir ces deux-là.
  - **_I usually am working_, _She usually is working_.** Retirés des erreurs anticipées de deux traductions : un présent continu d'habitude est plausible (« à cette heure-là, je suis d'habitude en train de travailler au bureau »). Ces formes ne sont pas acceptées pour autant : elles sont « non prévues », et l'apprenant les compare (D-035, D-074).
  - **Prétérit américain avec _yet_ et _already_.** Ajouté comme variante dans trois traductions de « just, already, yet et still » (`s4/09`, `s4/10` et `s4/11`), comme D-074 le prévoit ; `s4/10` n'avait pas été relevé par la revue.
  - **Futur.** La leçon associait le présent continu à un arrangement « avec d'autres personnes » ; elle parle désormais d'un arrangement déjà fixé (_I'm leaving on Friday._), comme les exercices.
- **Résultat affiché seulement une fois la réponse enregistrée (NO-06).** Question de l'utilisateur. « Juste ! » s'affichait avant la fin de l'écriture, et le brouillon d'une réponse tapée était effacé au même moment. Fermer l'app dans cet intervalle (quelques millisecondes, davantage sur un téléphone lent) pouvait perdre la réponse et le texte tapé. Un échec d'écriture laissait « Juste ! » affiché, sans enregistrement ni moyen de réessayer. Désormais, le résultat ne s'affiche qu'une fois la réponse enregistrée, le brouillon n'est effacé qu'ensuite, et un échec affiche « Réponse non enregistrée » avec « Réessayer ».
- **Test e2e instable sur la CI.** Le test du parcours rechargeait la page dès « Juste ! ». Sur la CI, le rechargement a pu interrompre l'écriture (cause probable, non reproduite en local). Le test attend désormais l'enregistrement, et le point précédent supprime la cause dans l'app elle-même.
- **Taille.** Le plus gros fichier JavaScript passe de 287 à 298 kB, car les combinaisons de raisons sont lues par le dépôt ; il reste sous le seuil de Vite, qui n'est pas relevé.

### D-082 — Contre-revues de la phase 3 (2026-10-07, complète D-081)

- **Contexte.** Les deux contre-revues de Codex, code et anglais, valident les corrections de D-081 et relèvent deux points mineurs, vérifiés puis corrigés sans nouvelle revue.
- **Décision.**
  1. **« Regarde, il pleut ! »** (`tense-present-continuous/s4/02`). _It rains!_, sans _Look_, était « non prévu » alors que _Look, it rains!_ était une erreur anticipée. _It rains!_ et _It rains, look!_ deviennent des erreurs anticipées : dans une phrase ordinaire sur la météo, le présent simple ne décrit pas la pluie qui tombe en ce moment, quelle que soit la lecture (D-035, avec la précision de l'utilisateur de D-081).
  2. **Brouillon d'une réponse tapée (NO-06).** Après l'enregistrement de la réponse, le brouillon était supprimé à part, sans traitement d'un échec. Une suppression ratée, ou l'app fermée entre les deux écritures, laissait le brouillon, qui réapparaissait quand le même exercice revenait. Une sauvegarde différée de la frappe pouvait aussi le recréer juste après. Désormais, le brouillon est supprimé **dans la même transaction** que la réponse et la progression : les deux réussissent ou échouent ensemble, et une fermeture ne peut plus les séparer. La frappe en attente est enregistrée avant cette transaction, pour qu'aucune sauvegarde tardive ne recrée le brouillon. Ensuite, le champ est seulement remis à zéro, sans nouvelle écriture. Un échec n'enregistre rien, ni réponse ni suppression. « Réessayer » relance donc une réponse qui n'a pas été enregistrée, sans risque de doublon.

### D-083 — Correction d'une production et vérification d'une réponse de carte par l'IA (2026-10-07, complète D-010, D-012, D-016, D-017 et D-066 ; à calibrer en phase 5)

- **Contexte.** La phase 4 livre la correction des productions (PED-05, PED-06, AI-02 à AI-08) et la vérification d'une réponse de carte inattendue (CARD-05). La documentation des sorties structurées a été vérifiée le 2026-10-07 (PROC-03) : au plus 16 paramètres à union (un champ `nullable` compte), au plus 24 paramètres optionnels, `additionalProperties: false` sur chaque objet, pas de contrainte de longueur ni d'intervalle, `minItems` limité à 0 ou 1, et la casse des valeurs d'`enum` n'est pas garantie.
- **Décision.**
  - **`correct-production`** : Sonnet 5, réflexion adaptative à effort bas, `max_tokens` 4 000 (au lieu des 2 000 prévus : une entrée du journal avec plusieurs erreurs demande environ 1 500 tokens de sortie, et la réflexion compte dans le plafond ; un peu de réflexion rend les faux positifs plus rares, NO-05), préfixe mis en cache. Entrée : le module (`theme`, `journal`, `path-produce`, `path-translate`), la consigne affichée, la référence relue d'une phrase du Thème ou d'une traduction (jamais présentée comme la seule réponse juste), la notion visée, le profil de l'apprenant (AI-02 : variante, domaines, niveau `null` jusqu'à la phase 5, catégories et notions de ses erreurs comptées des 30 derniers jours, remarques du profil tronquées à 500 caractères) et le texte (2 000 caractères au plus). Sortie : intention en français, erreurs (segment exact, position proposée, catégorie, notion de la liste fermée ou `null`, gravité, confiance, indice, correction, règle), tournures non naturelles, une entrée par phrase fautive (phrase d'origine, phrase corrigée, variantes, sens en français : les cartes proposées d'AI-08), texte corrigé, version naturelle, emploi de la notion visée, expression du jour, évaluation. Le schéma compte 4 unions et aucun champ optionnel ; un test le vérifie, et un autre que l'adaptateur de l'Edge Function en tire un format fermé pour chaque tâche.
  - **Prompt `correct-production@1`** : le préfixe stable porte le rôle, le critère décisif de D-035 (dont les lectures qui rendent une forme juste : situation temporaire, habitude, horaire, commentaire, forme polie, usage américain), les 15 catégories avec leurs frontières et les règles de départage de PEDAGOGY §7, la liste fermée des 50 notions décrites en anglais, l'échelle de gravité, les règles de chaque champ et trois exemples complets et contrastés (AI-04) : quatre erreurs de catégories différentes ; une phrase du Thème juste mais différente de la référence, sans aucune erreur ; une tournure correcte mais peu naturelle, une faute mineure et un présent continu juste pour une situation temporaire. Les exemples sont vérifiés par les tests : sortie valide, segments et phrases recopiés exactement.
  - **`check-card-answer`** : Haiku 4.5, sans réflexion, 300 tokens, sans cache (prompt bien plus court que le minimum de 4 096 tokens, D-011). Verdict `correct`, `acceptable` ou `incorrect` et une phrase en français ; en cas de doute, le verdict le plus favorable.
  - **Côté client** (AI-07), avant tout affichage ou enregistrement : un segment est cherché dans le texte, jamais pris aux positions du modèle ; une « erreur » dont la correction est la même réponse (contraction, graphie des listes fermées, autre apostrophe) est écartée, mais une différence de casse ou de ponctuation seule est gardée, puisque c'est l'objet des fautes d'orthographe et de ponctuation (cas positifs et négatifs testés, D-058) ; une phrase introuvable ne fait pas de carte ; les notes sont ramenées entre 1 et 5.
  - **Erreurs comptées** : gravité moyenne ou majeure et confiance moyenne ou élevée. Elles seules font des cartes et comptent dans les statistiques et les critères d'étape. Une erreur de confiance faible est affichée comme « point à vérifier » et ne compte jamais (AI-05). La règle des erreurs qualifiantes de D-024 (confiance élevée ou confirmée, non signalée) reste celle de la lacune.
  - **Coûts affichés** (COST-10) : avant « Corriger », le maximum de la demande, nouvelle tentative comprise, calculé sur une borne d'entrée de 20 000 tokens que les tests comparent à l'estimation du serveur pour la plus grosse demande possible : 0,18 USD. Pour la vérification d'une carte : 0,04 USD (0,05 USD une fois arrondi au centime supérieur, D-088). En pratique, une correction coûte environ 0,03 à 0,04 USD au premier appel (écriture du préfixe d'environ 6 500 tokens en cache), puis 0,02 USD dans les cinq minutes ; c'est plus que l'ordre de grandeur estimé en phase 0 (0,016 puis 0,008 USD), car le préfixe est plus long et la sortie plus riche. Le plafond de 10 USD couvre encore plusieurs centaines de corrections par mois.
  - **Un seul envoi par action** : la production est enregistrée avant l'appel ; un verrou synchrone ignore un second appui pendant l'envoi, pour qu'un double appui n'enregistre jamais deux productions ni ne paie deux corrections.
- **Raison.** NO-05 est l'exigence absolue : tout ce que le modèle affirme est vérifié ou réparé localement avant d'être montré, et le doute ne compte jamais contre l'apprenant.
- **À calibrer en phase 5** avec le banc d'essai : effort et plafond de sortie, rappel et précision des erreurs, coût réel.

### D-084 — Thème, Journal et séance du jour (2026-10-07, complète D-023, D-052 et PEDAGOGY §9 et §10)

- **Décision.**
  - **Phrases du Thème** : six phrases originales par notion de la phase 3 (78), dans le contenu (`theme.ts` de chaque notion), relues deux fois. Chacune donne le même sens aux trois paliers (PED-02) : la phrase française à traduire, une situation décrite en français, une consigne en anglais. Les réponses acceptées sont justes aux trois paliers ; les erreurs anticipées sont fausses dans toutes les lectures des trois (D-035) et relèvent d'une seule catégorie, celle de la phrase. Le test du socle leur applique les vérifications des traductions, plus deux : la consigne anglaise et la situation ne contiennent aucune réponse. La relecture séparée a retiré trois erreurs anticipées qui admettaient une lecture d'habitude temporaire (_What do you read at the moment?_, _she learns Japanese_, _I stay with a friend_) et des variantes qui ajoutaient un destinataire absent de la phrase française.
  - **Palier proposé** : le palier de base suit le niveau écrit (PEDAGOGY §9.1) ; **tant que le niveau n'est pas estimé (phase 5), il vaut 1**. Le calibrage de §6.2 l'avance ou le retarde d'un cran au plus, après chaque bloc de 20 réponses (au-dessus de 85 % ou en dessous de 75 % de réussite). Le palier proposé est donc 1 ou 2 en phase 4 ; l'apprenant peut choisir n'importe quel palier pour une série. C'est la lecture la plus prudente de « le calibrage peut avancer ou retarder le palier d'un cran » (PROC-04).
  - **Choix des phrases** (MOD-05, D-023) : séries de cinq phrases tirées des notions étudiées, celles en cours ou à consolider d'abord, puis pondérées par les erreurs récentes et l'ancienneté de la dernière pratique ; une notion choisie pèse moitié moins ensuite, et deux phrases consécutives ne viennent jamais de la même notion quand une autre reste. Une phrase d'une notion pas encore étudiée apparaît au plus une fois sur dix, jamais en premier ni deux fois de suite, son indice affiché. Sans notion étudiée, le Thème explique qu'il s'ouvre à l'étape « Traduire ».
  - **Correction d'une phrase du Thème** : locale d'abord. Une réponse attendue est juste ; une erreur anticipée est fausse, et fait une erreur (gravité moyenne, confiance élevée : elle est relue) et une carte faite du contenu relu. Sinon, rien n'est déclaré faux : l'IA corrige sur demande, ou l'apprenant compare avec la référence. Chaque réponse est une production (`theme`), avec son palier et son résultat, qui sert au calibrage.
  - **Journal** : 24 questions originales posées en anglais, avec leur sens en français sur demande, choisies dans les domaines de l'apprenant, jamais posée d'abord, puis la plus ancienne. Trois à cinq phrases, corrigées par l'IA en deux temps.
  - **Autocorrection** (PED-05) : l'apprenant corrige chaque passage souligné dans un champ à part, plutôt que dans le texte entier. Sur un téléphone, c'est plus simple, et la comparaison locale de D-026 se fait passage par passage, sans calcul de différences. L'étape se saute, ou se désactive dans les Réglages ; elle n'est décidée qu'une fois les réglages lus.
  - **Séance du jour** (MOD-02) : rien n'est enregistré pour la séance elle-même ; où elle en est se lit dans ce que l'apprenant a fait aujourd'hui, si bien qu'elle reprend là où elle s'est arrêtée, sur tout appareil, et qu'un module fait seul compte aussi. Reprises : faites quand aucune carte n'est due ; Parcours : 8 réponses du parcours, ou une production de l'étape 5 corrigée ; Thème : 5 phrases ; Journal : une entrée. L'oral arrive en phase 6 et l'e-mail guidé en phase 7 : en phase 4, le Journal occupe seul la dernière étape. Un module impossible (Thème sans notion étudiée, Journal sans compte) est sauté.
  - **Activité** (`activity`) : chaque réponse, révision ou production enregistrée écrit un événement dans la même transaction, d'au plus 600 secondes : un écran laissé ouvert ne compte pas. L'accueil affiche les minutes du jour face à l'objectif. La série et le joker, calculés à partir de ces événements, arrivent avec le tableau de bord (phase 5, PED-13).
- **Raison.** Des phrases relues, corrigées localement quand c'est possible, réduisent le coût (COST-02) et ne déclarent jamais fausse une réponse juste (NO-05).

### D-085 — Erreurs, cartes, Reprises, lexique et carnet de règles (2026-10-07, complète D-024, D-025, D-047, D-048 et D-063)

- **Décision.**
  - **Lapsus ou lacune** (PEDAGOGY §4) : par notion et par production. Une notion pas encore étudiée donne « notion non étudiée » ; sinon, une deuxième production avec une erreur qualifiante sur la notion en sept jours donne une lacune, et une notion à consolider ou acquise repasse « en cours » à l'étape 3 (message non culpabilisant, notion mise en tête du parcours). Une progression illisible n'est jamais écrasée : sa notion compte comme non étudiée.
  - **Cartes d'une correction** (CARD-02) : une carte par phrase du texte qui contient une erreur comptée, toutes ses erreurs comptées surlignées dans la tentative précédente ; l'erreur la plus grave donne la catégorie, la notion et l'indice. L'indice du modèle est remplacé par un indice relu de la catégorie (en français, sans mot anglais) s'il contient la correction. Le sens est l'intention de l'apprenant pour cette phrase, ou, quand le texte est une seule phrase répondant à une référence relue, le sens et les réponses de cette référence. Toute carte passe `isCardSolvable` ; une erreur mineure ou douteuse ne fait pas de carte.
  - **Carte d'une notion non étudiée** : créée suspendue (D-025), elle redevient présentable dès que la notion est étudiée, sans écriture : la file la traite comme active, et la révision suivante enregistre son statut. Une synchronisation qui fait progresser la notion sur un autre appareil suffit donc à l'activer.
  - **Cartes de notion** (CUR-09) : à l'acquisition, trois cartes faites des traductions relues de la notion, les plus difficiles d'abord.
  - **Reprises** (MOD-03, CARD-04 à CARD-06) : cartes dues, dans les plafonds des Réglages, plus au plus trois révisions de maintien par jour, mélangées. La réponse est toujours produite. Une réponse attendue est juste ; sinon, le modèle rapide la vérifie sur demande, ou l'apprenant la compare. L'apprenant confirme la note proposée (PEDAGOGY §6.1), ou en choisit une autre. Les journaux de révision gardent désormais le statut de la carte à la révision (pour compter les révisions de maintien) et l'usage de l'indice. Les paramètres de FSRS (D-048) ne changent pas : ils se calibreront avec l'usage réel des Reprises.
  - **Mon lexique** (MOD-09) : l'identifiant d'une entrée est un UUID de version 8 tiré de l'empreinte SHA-256 de l'expression normalisée, comme le prévoyait D-063 : deux appareils créent le même document. Une entrée retirée revient sous son identifiant. La carte de collocation est faite de l'exemple, l'expression remplacée par un blanc ; sans exemple qui la contienne exactement une fois, l'entrée est gardée sans carte, ce que l'écran dit. **Collecte** : l'expression du jour s'ajoute d'un geste de l'apprenant, jamais d'office (lecture prudente de « collectées automatiquement ») ; les tournures non naturelles ne sont pas proposées, faute de sens en français fourni par la correction.
  - **Carnet de règles** (MOD-10) : calculé à partir des erreurs comptées et non signalées : une fiche par catégorie, triée par erreurs des 30 derniers jours, avec la définition de la catégorie, les trois exemples les plus récents, les leçons des notions concernées et une note personnelle (`ruleNotes`, brouillon à chaque pause de frappe).
- **Raison.** NO-03 et NO-05 : une carte vient de ce qui est sûr, et le doute ne fait ni carte ni lacune.

### D-086 — Étapes 4 et 5 corrigées par l'IA, pratique immédiate (2026-10-07, remplace D-076)

- **Décision.**
  - **Étape 4** : une traduction non prévue peut être vérifiée par l'IA, sur demande, à côté de la comparaison par l'apprenant, qui reste possible. La production (`path-translate`) est enregistrée avant l'appel ; la réponse de l'exercice, sa notation et la suppression de son brouillon sont écrites dans la transaction de la correction. Elle est bonne sans erreur comptée sur la notion visée ; ses autres erreurs, ou une erreur mineure, la rendent « acceptable » (bonne pour le critère) et font des cartes comme toute production (PEDAGOGY §3.3).
  - **Étape 5** : les phrases sont corrigées par l'IA ; une production réussie emploie la notion sans erreur comptée sur elle. Deux productions réussies d'affilée depuis l'entrée dans l'étape rendent la notion acquise, avec ses cartes de notion. Les brouillons gardés en phase 3 (`path-produce:<notion>`) réapparaissent dans le champ.
  - **Pratique immédiate** (PED-07, PEDAGOGY §5.2) : proposée après une correction pour chaque notion d'une erreur comptée ; trois exercices de l'étape 3, les moins vus récemment, puis une traduction de l'étape 4. Pour une notion non étudiée, la leçon est proposée d'abord. Ses réponses ne changent jamais l'étape (D-075). Elle se saute à tout moment.
- **Raison.** Le provisoire de D-076 tenait à l'absence de prompt de correction aux exemples contrastés (AI-04) ; il existe désormais.

### D-087 — Données de la phase 4 (2026-10-07, complète D-043, D-053 et D-078)

- **Décision.**
  - **Schémas ajustés sans migration** (D-043) : `productions` (ce que la production répond : notion, phrase ou question, palier, notion non étudiée, indice ; résultat et correcteur ; autocorrections passage par passage ; durée ; module `path-translate` ajouté ; coût de la correction), `errors` (position de l'erreur dans la correction revue), `reviewLogs` (statut de la carte, indice). Aucune de ces tables ne contenait de données.
  - **Sortie du modèle** : gardée telle que reçue, revalidée contre le schéma de sortie et revue à chaque lecture ; une sortie illisible est gardée et signalée, jamais perdue.
  - **Taille** : le plus gros fichier JavaScript passe de 298 à 284 kB ; le fichier partagé de Dexie et Zod fait 230 kB (227 kB en phase 3), sans avertissement de Vite ni seuil relevé. Le service worker précache 64 fichiers (1 256 KiB, contre 1 060).

### D-088 — Ce que dit l'IA ne change la progression qu'une fois vérifié par l'app ; revues de la phase 4 (2026-10-08, complète D-083, D-085 et D-086)

- **Contexte.** Deux revues de Codex : le code de la phase 4, puis la justesse de l'anglais. Quatre points importants de la revue du code ont une cause commune : des sorties de l'IA reprises sans vérification (emploi de la notion à l'étape 5, erreur introuvable qui compte, phrase partielle en recto de carte, variantes du modèle acceptées). L'utilisateur a essayé le Journal : rien à signaler.
- **Principe (décision de l'utilisateur).** Tout ce qui modifie la progression de l'apprenant (acquisition d'une notion, lapsus ou lacune, statistiques) ou les réponses acceptées d'une carte est vérifié par l'app elle-même. Une sortie de l'IA qui ne peut pas être vérifiée reste un « point à vérifier », sans effet sur la progression.
- **Application.**
  - **Erreurs.** Une erreur dont le segment n'est pas retrouvé dans le texte est un point à vérifier, comme une erreur de confiance faible : affichée avec une note, elle ne compte nulle part (résultat d'une traduction ou d'une phrase du Thème, statistiques, diagnostic, cartes).
  - **Cartes d'erreur.** Une phrase ne fait une carte que si elle couvre des phrases entières du texte (elle commence le texte ou une ligne, ou suit une ponctuation finale ; elle finit sur sa ponctuation finale, juste avant elle, ou en fin de ligne ou de texte) et si la phrase corrigée du modèle est l'original avec les corrections de ses erreurs appliquées, avec ou sans celles de confiance faible. La réponse de la carte est calculée par l'app : l'original avec les corrections de ses erreurs, sauf les douteuses. Les autres versions de la phrase ne sont plus demandées au modèle ; seules s'y ajoutent les réponses relues d'une référence (Thème, traduction).
  - **Étape 5.** Le modèle donne les mots du texte qui emploient la notion (`targetNotionUses`). La production est réussie seulement si l'app retrouve ces mots dans le texte, hors de toute erreur comptée, et y reconnaît une construction de la notion : des motifs fermés (`src/content/notion-use.ts`) faits de listes fermées de mots et de formes verbales, lues dans les familles de `word-families.ts` (D-058, D-072), sans aucune règle de terminaison. Un motif qui contient un verbe doit être un groupe verbal entier : ni auxiliaire, ni modal, ni _to_ juste avant ; après un auxiliaire, ni participe, ni forme en _-ing_, ni autre auxiliaire. Ainsi _has worked_ n'est pas un prétérit, ni _I have been working_ un présent simple. Un contraste demande ses deux temps, et la révision trois temps (ceux que demandent ses amorces), chacun montré par ses propres mots. Une erreur comptée sur la notion rend la production non réussie ; sinon, un emploi non prouvé laisse le résultat indéterminé : la production ne compte ni pour ni contre la série de deux.
  - **Tests de l'étape 5.** Les réponses canoniques du Thème de chaque notion sont reconnues, sauf _I've known Marc for ten years_ (present perfect continu t/06), qui emploie à dessein le present perfect simple d'un verbe d'état ; des phrases d'un autre temps ne le sont pas (cas négatifs, D-058). Pour y parvenir, le verbe _smile_ a rejoint la liste, et la notion du futur reconnaît aussi le présent d'un rendez-vous ou d'un horaire suivi d'un mot de futur (_tomorrow_, _next_, un jour de la semaine…).
  - **Limites connues.** Un verbe absent de la liste n'est pas reconnu : l'emploi reste non prouvé, ce qui est prudent, et la liste s'étendra avec l'usage. L'absence d'erreur reste le jugement du modèle : l'app ne peut pas prouver qu'un texte est juste.
- **Prompt `correct-production@2`.** `targetNotionUses` remplace `usesTargetNotion` ; plus de variantes par phrase ; une phrase est entière et corrigée exactement de ses erreurs ; la confiance porte sur la catégorie et la correction d'une erreur sûre, et un doute sur l'erreur elle-même l'écarte de `errors` (revue d'anglais) ; le premier exemple compte quatre erreurs de trois catégories (revue d'anglais) ; virgules entre deux propositions (ci-dessous). Les sorties de la version 1 restent lisibles ; leur réponse sur l'emploi de la notion ne prouve rien.
- **Autres points de la revue du code.**
  - Après un échec d'enregistrement, la correction reçue est gardée tant que l'écran reste ouvert : « Réessayer l'enregistrement » l'enregistre sans nouvel appel ni coût, même hors ligne. Les exercices créés par l'IA sont gardés de la même façon.
  - Une traduction de l'étape 4 vérifiée par l'IA compte son temps une seule fois, avec sa réponse.
  - Les coûts maximaux affichés avant une demande sont arrondis au centime supérieur : 0,05 USD pour la vérification d'une carte, au lieu de 0,04 pour environ 0,043.
- **Revue d'anglais.**
  - Consigne anglaise de for/since/ago t/02 : elle n'ajoute plus un retard et une impatience que les réponses acceptées n'expriment pas. La formulation proposée par Codex (_your team has been waiting… for three weeks_) donnait le temps attendu ; la consigne décrit la durée sans le donner, comme celle de present perfect continu t/06.
  - _How long have you been waiting for?_ n'est plus une réponse acceptée (present perfect continu t/04). Courant à l'oral britannique, il ne devient pas une erreur anticipée (décision de l'utilisateur).
  - Virgules entre deux propositions : le prompt classait toute virgule entre deux propositions indépendantes en faute de ponctuation, alors que des réponses relues du Thème en contiennent (_Don't worry, I'll send you the file right away._, _Look at those clouds, it's going to rain._, _Be quiet, the baby is sleeping._). Une virgule après un impératif court ou une interjection, ou entre deux propositions courtes et étroitement liées, n'est pas une erreur : elle est juste dans une lecture plausible, le registre familier (D-035). Entre deux longues propositions d'un texte formel, elle reste une faute de ponctuation, toujours mineure, qui ne compte jamais. Les réponses du Thème restent telles quelles ; la correction locale ignore de toute façon la ponctuation.
  - **Écarté** : retirer les erreurs anticipées au présent simple avec _at the moment_ (présent continu t/02 et t/05). Avec _at the moment_, le présent simple est faux dans presque toutes les lectures ; c'est l'indice retenu en phase 3 pour écarter la lecture d'habitude (D-081). L'utilisateur garde ces erreurs anticipées, et aucun argument contraire solide n'a été trouvé.
- **Autres sorties de l'IA examinées** (demande de l'utilisateur).
  - Résultat d'une phrase du Thème corrigée par l'IA, qui sert au calibrage du palier : il repose sur les erreurs comptées, désormais toutes retrouvées dans le texte.
  - Statistiques, carnet de règles, notions à revoir, profil envoyé au modèle, diagnostic : erreurs comptées seulement.
  - Vérification d'une réponse de carte (CARD-05) : le verdict propose une note que l'apprenant confirme ou change. Inchangé.
  - Expression du jour : elle n'entre dans le lexique que d'un geste de l'apprenant, et sa carte n'est faite que si l'exemple contient l'expression exactement une fois ; son sens reste celui du modèle. Inchangé : c'est un choix explicite, pas une progression.
  - Évaluation (notes, niveau du texte) : enregistrée, sans effet aujourd'hui. L'estimation du niveau de la phase 5 devra suivre ce principe.
  - Intention et sens d'une phrase : textes du modèle, montrés au recto d'une carte à côté de la tentative de l'apprenant ; ils ne décident d'aucune réponse acceptée.
  - **Point ouvert, à trancher par l'utilisateur** : les exercices créés par l'IA (D-079). Leurs réponses attendues viennent du modèle ; l'app vérifie leur forme (schéma, `checkExercise`, ensembles de raisons relus, phrase déjà vue), pas leur justesse, et leurs réponses comptent pour les critères des étapes 2 à 4. Appliquer le principe à la lettre voudrait qu'elles n'y comptent plus (entraînement libre, le socle relu restant seul juge du passage d'étape). Rien n'est changé avant sa décision, parce que cela reviendrait sur D-079 et que le socle, revu en boucle, pourrait alors être appris par cœur.
- **Raison.** NO-05 et règle 1 : une affirmation du modèle ne compte que si l'app peut la vérifier, et une réponse déjà payée n'est jamais redemandée.
