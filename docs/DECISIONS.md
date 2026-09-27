# Journal des décisions

Chaque décision est numérotée, datée, et classée par ordre numérique. Une décision remplacée n'est pas effacée : on ajoute une nouvelle entrée qui la cite (« remplace D-0xx »). Les décisions **à vérifier** ou **à calibrer** seront confirmées ou révisées dans la phase indiquée.

Format : **Contexte**, **Décision**, **Raison**, **Alternatives écartées** (les rubriques sans objet sont omises).

## Index

| ID    | Sujet                                                   | Thème       | Statut          |
| ----- | ------------------------------------------------------- | ----------- | --------------- |
| D-001 | Langues du projet                                       | Outillage   | Actée           |
| D-002 | npm et Node 24                                          | Outillage   | Actée           |
| D-003 | TypeScript 6.0.x plutôt que 7                           | Outillage   | Actée           |
| D-004 | ESLint plutôt qu'oxlint, fork d'accessibilité           | Outillage   | Actée           |
| D-005 | Vitest 5 et jsdom 29                                    | Outillage   | Actée           |
| D-006 | Options TypeScript                                      | Outillage   | Actée           |
| D-007 | Playwright sur le build de production                   | Outillage   | Actée           |
| D-008 | Scan de secrets en plus d'ESLint                        | Sécurité    | Actée           |
| D-009 | Identifiants de modèles et prix                         | IA et coûts | Actée           |
| D-010 | Sortie JSON garantie                                    | IA et coûts | Actée           |
| D-011 | Cache de prompts                                        | IA et coûts | Actée           |
| D-012 | Réflexion de Sonnet 5 réglée par tâche                  | IA et coûts | À calibrer (P5) |
| D-013 | Authentification par code à usage unique                | Serveur     | À vérifier (P2) |
| D-014 | Magasin de documents générique côté serveur             | Serveur     | Actée           |
| D-015 | Résolution des conflits                                 | Données     | Actée           |
| D-016 | Réservation budgétaire et nouvelle tentative            | IA et coûts | Actée           |
| D-017 | Prompts uniquement côté serveur                         | IA et coûts | Actée           |
| D-018 | Mise à jour du service worker sur demande               | PWA         | Actée           |
| D-019 | Stockage persistant et migrations sûres                 | Données     | Actée           |
| D-020 | Aucune donnée personnelle identifiante dans le dépôt    | Sécurité    | Actée           |
| D-021 | Taxonomie à deux dimensions et règles de départage      | Pédagogie   | Actée           |
| D-022 | Notion « à consolider »                                 | Pédagogie   | Actée           |
| D-023 | Notions admises dans le Thème                           | Pédagogie   | Actée           |
| D-024 | Seules les erreurs qualifiantes déclenchent une lacune  | Pédagogie   | Actée           |
| D-025 | Erreur sur une notion non étudiée                       | Pédagogie   | Actée           |
| D-026 | Autocorrection vérifiée localement                      | Pédagogie   | Actée           |
| D-027 | Critères de passage par défaut                          | Pédagogie   | À ajuster (P3)  |
| D-028 | Limites de la reconnaissance vocale                     | Parole      | À revoir (P6)   |
| D-029 | Mise en pause des projets Supabase gratuits             | Serveur     | À vérifier (P2) |
| D-030 | Code partagé entre le client et l'Edge Function         | Serveur     | À vérifier (P2) |
| D-031 | Nom des clés Supabase côté client                       | Serveur     | À vérifier (P2) |
| D-032 | Profil générique renforcé, historique conservé          | Sécurité    | Actée           |
| D-033 | Scan de l'index Git et gitleaks sur tout l'historique   | Sécurité    | Actée           |
| D-034 | Serveur e2e dédié, jamais réutilisé                     | Outillage   | Actée           |
| D-035 | Critère décisif : erreur ou non                         | Pédagogie   | Actée           |
| D-036 | Programme aligné sur Murphy, en 9 pistes                | Pédagogie   | Actée           |
| D-037 | Ajouts de phase 8 dans la piste Temps verbaux           | Pédagogie   | Actée           |
| D-038 | Références « Pour aller plus loin », livrées en phase 3 | Pédagogie   | Actée           |
| D-039 | Libellés des livres : rouge et bleu                     | Pédagogie   | Actée           |
| D-040 | Taxonomie : définitions élargies aux nouvelles notions  | Pédagogie   | Actée           |
| D-041 | Contenu original, sans reprise des livres               | Pédagogie   | Actée           |
| D-042 | Revue de la mise à jour Murphy                          | Pédagogie   | Actée           |

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
