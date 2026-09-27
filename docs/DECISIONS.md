# Journal des décisions

Chaque décision est numérotée, datée, et classée par ordre numérique. Une décision remplacée n'est pas effacée : on ajoute une nouvelle entrée qui la cite (« remplace D-0xx »). Les décisions **à vérifier** ou **à calibrer** seront confirmées ou révisées dans la phase indiquée.

Format : **Contexte**, **Décision**, **Raison**, **Alternatives écartées** (les rubriques sans objet sont omises).

## Index

| ID    | Sujet                                                  | Thème       | Statut          |
| ----- | ------------------------------------------------------ | ----------- | --------------- |
| D-001 | Langues du projet                                      | Outillage   | Actée           |
| D-002 | npm et Node 24                                         | Outillage   | Actée           |
| D-003 | TypeScript 6.0.x plutôt que 7                          | Outillage   | Actée           |
| D-004 | ESLint plutôt qu'oxlint, fork d'accessibilité          | Outillage   | Actée           |
| D-005 | Vitest 5 et jsdom 29                                   | Outillage   | Actée           |
| D-006 | Options TypeScript                                     | Outillage   | Actée           |
| D-007 | Playwright sur le build de production                  | Outillage   | Actée           |
| D-008 | Scan de secrets en plus d'ESLint                       | Sécurité    | Actée           |
| D-009 | Identifiants de modèles et prix                        | IA et coûts | Actée           |
| D-010 | Sortie JSON garantie                                   | IA et coûts | Actée           |
| D-011 | Cache de prompts                                       | IA et coûts | Actée           |
| D-012 | Réflexion de Sonnet 5 réglée par tâche                 | IA et coûts | À calibrer (P5) |
| D-013 | Authentification par code à usage unique               | Serveur     | À vérifier (P2) |
| D-014 | Magasin de documents générique côté serveur            | Serveur     | Actée           |
| D-015 | Résolution des conflits                                | Données     | Actée           |
| D-016 | Réservation budgétaire et nouvelle tentative           | IA et coûts | Actée           |
| D-017 | Prompts uniquement côté serveur                        | IA et coûts | Actée           |
| D-018 | Mise à jour du service worker sur demande              | PWA         | Actée           |
| D-019 | Stockage persistant et migrations sûres                | Données     | Actée           |
| D-020 | Aucune donnée personnelle identifiante dans le dépôt   | Sécurité    | Actée           |
| D-021 | Taxonomie à deux dimensions et règles de départage     | Pédagogie   | Actée           |
| D-022 | Notion « à consolider »                                | Pédagogie   | Actée           |
| D-023 | Notions admises dans le Thème                          | Pédagogie   | Actée           |
| D-024 | Seules les erreurs qualifiantes déclenchent une lacune | Pédagogie   | Actée           |
| D-025 | Erreur sur une notion non étudiée                      | Pédagogie   | Actée           |
| D-026 | Autocorrection vérifiée localement                     | Pédagogie   | Actée           |
| D-027 | Critères de passage par défaut                         | Pédagogie   | À ajuster (P3)  |
| D-028 | Limites de la reconnaissance vocale                    | Parole      | À revoir (P6)   |
| D-029 | Mise en pause des projets Supabase gratuits            | Serveur     | À vérifier (P2) |
| D-030 | Code partagé entre le client et l'Edge Function        | Serveur     | À vérifier (P2) |
| D-031 | Nom des clés Supabase côté client                      | Serveur     | À vérifier (P2) |
| D-032 | Profil générique renforcé, historique conservé         | Sécurité    | Actée           |
| D-033 | Scan de l'index Git et gitleaks sur tout l'historique  | Sécurité    | Actée           |
| D-034 | Serveur e2e dédié, jamais réutilisé                    | Outillage   | Actée           |
| D-035 | Critère décisif : erreur ou non                        | Pédagogie   | Actée           |

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
