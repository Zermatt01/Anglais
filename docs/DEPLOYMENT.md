# Déploiement et installation

Ce guide explique comment mettre l'application en ligne sur Vercel, l'installer sur un téléphone Android, puis brancher le serveur : compte, synchronisation et IA.

- **Sections 1 à 5** (phase 1) : l'application seule. Elle fonctionne alors entièrement sur le téléphone, sans compte ni IA.
- **Sections 6 à 12** (phase 2) : le projet Supabase (compte, base de données, Edge Function « ai »), la clé Anthropic et les variables Vercel. À faire une seule fois, dans l'ordre.
- **Section 16** (phase 3) : la mise à jour pour le Parcours.

**Pour copier les commandes** : ne copier que les lignes situées entre les ` ``` `, jamais ces ` ``` ` eux-mêmes, qui servent seulement à l'affichage. Remplacer `<ref>` par la référence du projet (section 6, point 3), sans les chevrons : par exemple `https://abcdefghijklmnopqrst.supabase.co`.

Aucune clé n'est jamais écrite dans le dépôt. Les deux clés secrètes ne sont enregistrées qu'à un endroit chacune : celle de Resend dans les réglages SMTP de Supabase (section 7), celle d'Anthropic dans les secrets de l'Edge Function (section 10).

## 1. Publier le code sur GitHub

Vercel déploie depuis GitHub : les commits doivent d'abord y être poussés.

```sh
git push
```

La CI GitHub Actions vérifie alors les types, le lint, le format, les tests unitaires, les secrets (y compris dans tout l'historique), l'Edge Function (avec Deno) et les tests e2e. Elle doit être verte avant de déployer.

## 2. Créer le projet Vercel (une seule fois)

1. Sur [vercel.com](https://vercel.com), créer un compte **Hobby** (gratuit) avec « Continue with GitHub ».
2. **Add New… → Project**, puis choisir le dépôt. S'il n'apparaît pas, cliquer sur « Adjust GitHub App Permissions » et autoriser l'accès à ce dépôt privé.
3. Dans l'écran de configuration :
   - **Framework Preset** : Vite (détecté automatiquement) ;
   - **Root Directory** : `./` ;
   - **Build Command** : `npm run build` ;
   - **Output Directory** : `dist` ;
   - **Install Command** : `npm ci` (plus sûr que la valeur par défaut, car il respecte `package-lock.json`) ;
   - **Environment Variables** : aucune pour l'instant (elles s'ajoutent à la section 11).
4. Cliquer sur **Deploy**. Au bout d'une minute environ, Vercel affiche l'adresse de production, de la forme `https://<nom-du-projet>.vercel.app`. **Noter cette adresse** : l'Edge Function en aura besoin (section 10).
5. Dans **Settings → General → Node.js Version**, vérifier que la version est **24.x**, comme `.nvmrc`.

Ensuite, chaque `git push` sur `main` redéploie la production automatiquement, et chaque pull request reçoit une adresse de prévisualisation.

Le fichier `vercel.json` du dépôt règle déjà le reste : les en-têtes de sécurité (Content-Security-Policy, etc.) et la réécriture des adresses internes vers l'application (DECISIONS D-056).

## 3. Vérifier le déploiement (sur ordinateur)

1. Ouvrir l'adresse de production dans Chrome : l'accueil « Anglais » s'affiche.
2. Ouvrir directement `https://<nom-du-projet>.vercel.app/reglages` : l'écran Réglages s'affiche (réécriture des adresses).
3. Outils de développement (F12) :
   - onglet **Application → Manifest** : aucune erreur, icônes visibles ;
   - onglet **Application → Service workers** : un service worker est actif ;
   - onglet **Console** : aucune erreur (une erreur « Refused to… » signalerait un problème de CSP) ;
   - onglet **Network**, requête du document : l'en-tête `content-security-policy` est présent.

## 4. Installer l'application sur le téléphone (Android, Chrome)

1. Ouvrir l'adresse de production dans **Chrome**.
2. Chrome propose « **Installer l'application** » en bas de l'écran. Sinon : menu **⋮** → « **Ajouter à l'écran d'accueil** » → « **Installer** ».
3. L'icône (une page de cahier corrigée) apparaît sur l'écran d'accueil. L'application s'ouvre en plein écran, sans barre d'adresse.
4. **Premier lancement** : l'ouvrir une fois avec une connexion, pour qu'elle se mette en cache. Pour vérifier le fonctionnement hors ligne : passer en mode avion, fermer l'application, puis la rouvrir.
5. **Réglages → Données → Stockage sur ce téléphone** doit indiquer « **Protégé** ». Sinon, toucher « Demander la protection » : Chrome l'accorde en général aux applications installées.

## 5. Mises à jour

Après un nouveau déploiement, l'application affiche « **Nouvelle version disponible** » à la prochaine ouverture. « Mettre à jour » enregistre les brouillons, puis recharge ; « Plus tard » garde la version actuelle jusqu'à la prochaine ouverture. L'application ne se met jamais à jour d'elle-même (DECISIONS D-018).

## 6. Créer le projet Supabase (phase 2, une seule fois)

Supabase héberge le compte, la copie de sauvegarde des données et l'Edge Function « ai », seul chemin vers Anthropic. Le plan gratuit suffit.

1. Sur [supabase.com](https://supabase.com), créer un compte (« Continue with GitHub »).
2. **New project** :
   - **Name** : `anglais` ;
   - **Database Password** : cliquer sur « Generate a password », puis le **garder dans un gestionnaire de mots de passe** : il sera demandé à la section 8 ;
   - **Region** : une région d'Europe (par exemple Frankfurt ou Zurich) ;
   - laisser les autres options par défaut, puis **Create new project** (une à deux minutes).
3. **Adresse et clé publique** : dans **Project Settings → API Keys** (ou **Data API**), noter :
   - l'adresse du projet, de la forme `https://<ref>.supabase.co` : `<ref>` est une suite de 20 lettres et chiffres, la « référence » du projet ;
   - la clé **publishable**, qui commence par `sb_publishable_`. Elle est publique par conception : la protection des données repose sur la RLS.
   - Ne jamais copier la clé **secret** (`sb_secret_…`) : l'Edge Function la reçoit de Supabase, sans intervention.
4. **Clés de signature des sessions** : ouvrir **Project Settings → JWT Keys**. La clé en service (« current key ») doit être une clé **ECC (P-256)** ou RSA, pas un « Legacy JWT secret ». C'est le cas des projets récents. Sinon, suivre le bouton « Migrate JWT secret » puis faire passer la clé ECC en service ([documentation](https://supabase.com/docs/guides/auth/signing-keys)) : l'Edge Function vérifie les sessions avec ces clés publiques (DECISIONS D-062).

## 7. Configurer la connexion par code

L'application se connecte avec un **code à six chiffres reçu par e-mail**, jamais avec un lien, qui s'ouvrirait hors de l'application installée (DECISIONS D-060).

Le service d'e-mail intégré de Supabase ne permet plus de modifier les modèles d'e-mail : son message par défaut contient un lien, pas le code. Il faut donc brancher un service d'envoi externe (SMTP). Le guide utilise **Resend**, gratuit et recommandé par Supabase, sans nom de domaine à acheter (DECISIONS D-071).

1. **Créer le compte unique** : **Authentication → Users → Add user → Create new user**.
   - E-mail : ton adresse ;
   - mot de passe : en générer un au hasard (il ne servira jamais) ;
   - cocher **Auto Confirm User**.
2. **Fermer les inscriptions** : **Authentication → Sign In / Providers** : désactiver « **Allow new users to sign up** ». Le fournisseur **Email** doit rester activé. L'application ne crée jamais de compte : personne d'autre ne pourra s'inscrire.
3. **Créer le compte Resend** : sur [resend.com](https://resend.com), **Sign up** avec **la même adresse e-mail** que le compte du point 1, puis confirmer l'adresse. Sans nom de domaine, Resend n'envoie qu'à cette adresse-là, depuis l'expéditeur de test `onboarding@resend.dev` : c'est ce qui rend la solution gratuite, et ce qui limite les risques (voir « Sécurité de la clé Resend » plus bas).
4. **Créer la clé d'envoi** : dans Resend, **API Keys → Create API Key** :
   - **Name** : `supabase-smtp` ;
   - **Permission** : **Sending access** (jamais « Full access ») ;
   - **Domain** : laisser « All domains » (aucun domaine n'est configuré).

   Copier la clé (elle commence par `re_`) : Resend ne l'affiche qu'une fois. La coller directement au point 5, et nulle part ailleurs.

5. **Brancher Resend sur Supabase** : **Authentication → Emails → SMTP Settings** (selon la version du tableau de bord : **Project Settings → Authentication → SMTP Settings**), activer **Enable Custom SMTP**, puis remplir :

   | Champ                                | Valeur                            |
   | ------------------------------------ | --------------------------------- |
   | Sender email                         | `onboarding@resend.dev`           |
   | Sender name                          | `Anglais`                         |
   | Host                                 | `smtp.resend.com`                 |
   | Port number                          | `465`                             |
   | Username                             | `resend`                          |
   | Password                             | la clé du point 4 (`re_…`)        |
   | Minimum interval between emails sent | `60` secondes (valeur par défaut) |

   Enregistrer.

6. **Envoyer un code au lieu d'un lien** : le modèle est maintenant modifiable. **Authentication → Emails → Templates → Magic Link** : remplacer le sujet et le contenu par :
   - Sujet : `Ton code de connexion`
   - Contenu :

     ```html
     <h2>Ton code de connexion</h2>
     <p>Saisis ce code dans l'application Anglais : <strong>{{ .Token }}</strong></p>
     <p>Il reste valable une heure. Si tu n'as rien demandé, ignore ce message.</p>
     ```

   Enregistrer. Le code doit apparaître par `{{ .Token }}` ; sans lui, Supabase enverrait un lien.

7. **URL Configuration** : mettre dans **Site URL** l'adresse Vercel de la section 2.

**Limites.** Resend gratuit : 100 e-mails par jour et 3 000 par mois. Supabase avec un SMTP personnalisé : 30 e-mails par heure pour le projet (réglable dans **Authentication → Rate Limits**), et un nouveau code au plus toutes les 60 secondes par adresse. Les messages de `onboarding@resend.dev` peuvent arriver dans les indésirables la première fois : les marquer comme « non indésirable », ou ajouter l'expéditeur aux contacts.

**Sécurité de la clé Resend** (le « mot de passe SMTP ») :

- elle ne sert qu'à envoyer (« Sending access ») : elle ne donne accès ni aux autres réglages de Resend, ni à une boîte aux lettres ;
- sans domaine, Resend n'envoie qu'à l'adresse du titulaire du compte : même volée, la clé ne permettrait d'écrire qu'à toi ;
- elle n'est enregistrée que dans Supabase, qui ne la réaffiche pas ; elle ne va ni dans le dépôt, ni dans l'application, ni dans une variable Vercel ;
- si elle a pu fuiter : la supprimer dans **Resend → API Keys**, en créer une nouvelle, et la coller au point 5.

**Si aucun code n'arrive** (et que l'application affiche « Le serveur n'a pas répondu comme prévu ») : ouvrir **Logs → Auth** dans Supabase. Une erreur SMTP y apparaît, par exemple si Resend refuse l'expéditeur de test. Vérifier d'abord que l'adresse du compte Supabase (point 1) est exactement celle du compte Resend (point 3). Si l'erreur persiste, utiliser la solution de repli ci-dessous.

**Solution de repli : Gmail, avec un compte dédié.** Gratuite, sans domaine, limitée à 500 e-mails par jour.

1. Créer un **nouveau** compte Gmail réservé à cet envoi. **Ne pas utiliser ta boîte principale** : un mot de passe d'application donne accès à toute la boîte aux lettres du compte (lecture et envoi), et il serait enregistré chez Supabase.
2. Sur ce compte, activer la **validation en deux étapes** ([myaccount.google.com/security](https://myaccount.google.com/security)), puis créer un **mot de passe d'application** ([myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)), nommé `supabase` : 16 lettres, affichées une seule fois.
3. Dans **SMTP Settings** (point 5), remplacer les valeurs : **Sender email** et **Username** = l'adresse du compte dédié ; **Host** = `smtp.gmail.com` ; **Port number** = `465` ; **Password** = le mot de passe d'application, sans les espaces.
4. Le mot de passe d'application est révoqué si le mot de passe du compte dédié change : en recréer un, et le recoller.

## 8. Créer les tables (migrations)

Dans un terminal ouvert dans le dossier du projet (VS Code : **Terminal → New Terminal**). La CLI de Supabase s'exécute par `npx`, sans installation ni Docker.

```sh
npx supabase@2.118.0 login
npx supabase@2.118.0 link --project-ref <ref>
npx supabase@2.118.0 db push
```

- `login` ouvre le navigateur pour autoriser la CLI.
- `link` demande le mot de passe de la base (section 6).
- `db push` liste les migrations de `supabase/migrations/` (quatre aujourd'hui : `…_sync.sql`, `…_ai_calls.sql`, `…_ai_refusals_not_logged.sql` et `…_sync_history.sql`) et demande confirmation. Après une mise à jour du dépôt qui en ajoute, relancer la même commande : seules les nouvelles sont appliquées.

Vérification : **Table Editor** montre `sync_documents`, `sync_events`, `sync_document_history` et `ai_calls`, chacune marquée « RLS enabled ».

## 9. Préparer la clé Anthropic

1. Ouvrir la Claude Console ([platform.claude.com](https://platform.claude.com), anciennement console.anthropic.com) et créer un compte.
2. **Billing** : acheter du crédit (5 USD suffisent pour commencer) et **laisser le rechargement automatique désactivé** : la dépense ne peut alors jamais dépasser le crédit acheté.
3. **Créer un espace de travail** : **Settings → Workspaces** (Paramètres → Espaces de travail) → **Create Workspace**, nommé `anglais`. Si la console le propose, lui fixer une limite de dépense mensuelle, par exemple 10 USD : c'est une seconde barrière, en plus du plafond de l'Edge Function.
4. **API Keys → Create Key**, nommée `anglais-edge-function`, en choisissant l'espace de travail **`anglais`**. Une clé d'organisation, rattachée à aucun espace de travail, est refusée par l'API (« This API key is not scoped to a workspace »). **La copier une seule fois**, directement dans les secrets de la section 10, et nulle part ailleurs : ni dans un fichier, ni dans un message, ni dans le dépôt.

## 10. Déployer l'Edge Function « ai »

1. **Secrets**, dans le tableau de bord Supabase : **Edge Functions → Secrets** (ou **Project Settings → Edge Functions**). Ajouter :

   | Nom                        | Valeur                                                         |
   | -------------------------- | -------------------------------------------------------------- |
   | `ANTHROPIC_API_KEY`        | la clé de la section 9 (`sk-ant-…`)                            |
   | `AI_ALLOWED_EMAILS`        | ton adresse e-mail (plusieurs : séparées par des virgules)     |
   | `AI_ALLOWED_ORIGINS`       | l'adresse Vercel de la section 2, sans `/` final               |
   | `AI_MONTHLY_BUDGET_USD`    | facultatif : plafond mensuel en USD (10 par défaut, COST-06)   |
   | `AI_RATE_LIMIT_PER_MINUTE` | facultatif : appels par minute au plus (6 par défaut, COST-07) |

   Le tableau de bord évite de taper la clé dans un terminal, qui la garderait dans son historique. `SUPABASE_URL` et les clés du projet sont fournies à la fonction par Supabase.

2. **Déploiement**, dans le terminal :

   ```sh
   npx supabase@2.118.0 functions deploy ai --use-api
   ```

   `--use-api` fait assembler la fonction par Supabase, sans Docker. La commande lit `supabase/config.toml` : dans **Edge Functions → ai → Details**, « **Verify JWT with legacy secret** » (ou « Enforce JWT verification ») doit apparaître **désactivé**. C'est voulu : la fonction vérifie elle-même la session, et la vérification de la plateforme bloquerait les appels du navigateur (DECISIONS D-062).

3. Après toute modification de `supabase/functions/` ou de `shared/ai/`, redéployer avec la même commande.

## 11. Brancher l'application sur le projet

L'ordre compte : les variables Vercel d'abord, puis le commit de la CSP, dont le déploiement utilisera ces variables.

1. **Variables Vercel** : **Settings → Environment Variables**, pour l'environnement **Production** :
   - `VITE_SUPABASE_URL` = `https://<ref>.supabase.co` ;
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = la clé `sb_publishable_…`.

   Ces deux valeurs sont publiques. Ne jamais mettre de clé secrète dans une variable `VITE_` : elle serait lisible dans l'application.

2. **Autoriser le projet dans la CSP** : la Content-Security-Policy n'autorise que les adresses listées (DECISIONS D-065). Dans le terminal :

   ```sh
   npm run configure:csp -- https://<ref>.supabase.co
   git add vercel.json
   git commit -m "chore(csp): allow the Supabase project"
   git push
   ```

   (Ou demander à Claude Code de le faire, en lui donnant l'adresse du projet.) Le push déclenche le déploiement. Si la CSP n'autorise pas l'adresse configurée, le build échoue sur Vercel en indiquant la commande à lancer : aucune version cassée n'est publiée.

## 12. Vérifier

Sur le téléphone, ouvrir l'application : « Nouvelle version disponible » → **Mettre à jour**.

1. **Connexion** : **Réglages → Compte et synchronisation** → adresse e-mail → **Recevoir un code** → saisir le code → **Se connecter**. L'écran indique « Connecté avec … », puis « Dernière synchronisation : … ».
2. **Synchronisation** : dans Supabase, **Table Editor → sync_documents** contient au moins la ligne `settings` (si des réglages ont déjà été changés). Sur un ordinateur, ouvrir l'adresse Vercel, se connecter : les réglages du téléphone apparaissent.
3. **IA** : **Réglages → Voir la consommation**, puis **Tester la connexion**. Le message « La connexion à l'IA fonctionne » s'affiche avec le coût du test (moins d'un millième de dollar), et une ligne `ok` apparaît dans **Table Editor → ai_calls**.

En cas de problème :

| Message de l'application                              | Cause probable et correction                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| « Aucun compte n'existe pour cette adresse »          | Compte non créé ou adresse différente (section 7).                                                                                                                                                                                                                                                                                |
| Aucun code reçu                                       | Dossier des indésirables ; nouveau code demandé moins de 60 secondes après le précédent ; SMTP mal configuré (**Logs → Auth**, section 7) ; modèle d'e-mail sans `{{ .Token }}` (section 7, point 6).                                                                                                                             |
| « Synchronisation interrompue »                       | Projet en pause (section 13) ou migrations non appliquées (section 8).                                                                                                                                                                                                                                                            |
| « Le serveur IA n'est pas prêt »                      | Secret manquant ou invalide. **Edge Functions → ai → Logs** : la ligne `misconfigured` nomme la variable à corriger (jamais sa valeur).                                                                                                                                                                                           |
| « Ce compte n'est pas autorisé à utiliser l'IA »      | Adresse absente de `AI_ALLOWED_EMAILS`.                                                                                                                                                                                                                                                                                           |
| « Ta session a expiré »                               | Se déconnecter puis se reconnecter. Si cela persiste : clés de signature « Legacy » (section 6, point 4).                                                                                                                                                                                                                         |
| « Le serveur IA n'a pas pu être joint »               | Fonction non déployée, ou `AI_ALLOWED_ORIGINS` différent de l'adresse ouverte (la comparer exactement, `https://` compris).                                                                                                                                                                                                       |
| « Le service d'IA n'a pas répondu »                   | La ligne `ai_call` des journaux de la fonction (**Edge Functions → ai → Logs**) donne l'explication dans `detail` : clé non rattachée à un espace de travail (« not scoped to a workspace », section 9, point 4) ; clé invalide (`anthropic_401`) ; crédit épuisé ou limite de dépense atteinte. Vérifier dans la Claude Console. |
| Build Vercel en échec : « Content-Security-Policy … » | Lancer la commande indiquée (section 11, point 2), puis pousser.                                                                                                                                                                                                                                                                  |

## 13. Coûts et limites

- **Supabase (gratuit)** : un projet sans activité pendant **sept jours** est mis en pause ; Supabase prévient par e-mail environ une semaine avant. Les données sont conservées ; **Resume project** dans le tableau de bord le relance (possible pendant un an). Pendant une pause, l'application fonctionne normalement sur le téléphone ; seules la synchronisation et l'IA attendent. Un usage régulier de l'application suffit à éviter la pause (DECISIONS D-029).
- **Anthropic** : l'IA n'est appelée que sur une action explicite (COST-01). L'Edge Function refuse tout appel qui ferait dépasser le plafond mensuel (10 USD par défaut), et au plus 6 appels par minute. **Réglages → Voir la consommation** montre le coût du jour, du mois et par fonction.
- **Resend (gratuit)** : 100 e-mails par jour, 3 000 par mois ; une connexion en consomme un (section 7).
- **Vercel (Hobby)** : gratuit pour cet usage.

## 14. Sauvegarder ses données

Une fois connecté, les données sont copiées sur le serveur à chaque synchronisation, et un autre appareil connecté au même compte les retrouve. **Désinstaller l'application ou effacer les données de Chrome ne supprime alors que la copie du téléphone.**

L'export reste recommandé de temps en temps, surtout avant de changer de téléphone :

- **Réglages → Données → Exporter mes données** produit un fichier à garder (Drive, ordinateur…). Il ne contient aucune clé ni aucun mot de passe, seulement les données de l'application : réglages, profil, brouillons, progression dans le Parcours, réponses aux exercices, exercices créés par l'IA, textes écrits et leurs corrections, erreurs, cartes et révisions, lexique et notes du carnet de règles. Les brouillons ne sont jamais synchronisés : seul l'export les sauvegarde.
- Pour restaurer, ou pour passer sur un autre appareil : **Importer** ce fichier. Rien n'est effacé ; pour chaque élément présent des deux côtés, la version la plus récente est gardée.

**Versions remplacées.** Si une modification semble avoir disparu après une synchronisation entre deux appareils, deux copies existent :

- sur le téléphone, **Réglages → Données → Éléments mis de côté** (et dans chaque export) ;
- sur le serveur, **Table Editor → sync_document_history** : les dix dernières versions remplacées de chaque document. Demander à Claude Code de restaurer celle qui convient.

## 15. Confidentialité

- L'adresse `*.vercel.app` est publique : quiconque la connaît peut ouvrir l'application, mais sans compte, il n'y voit que les données de son propre appareil. Les inscriptions sont fermées.
- Les données synchronisées sont stockées dans le projet Supabase (région choisie à la section 6), protégées par la RLS : seul le compte connecté y a accès.
- L'IA ne reçoit que ce qu'une action demande :
  - le test de connexion n'envoie rien de personnel ;
  - la création d'exercices envoie la notion, l'étape, la variante d'anglais, les domaines choisis dans le profil et les phrases des exercices déjà vus ;
  - « Corriger » envoie le texte à corriger, la consigne, la phrase de référence s'il y en a une, la variante d'anglais, les domaines et les 500 premiers caractères des remarques libres du profil, ainsi que les catégories et notions de tes erreurs récentes ;
  - « Faire vérifier par l'IA », dans les Reprises, envoie la carte (sens, réponses attendues) et ta réponse.
- Le journal des appels (`ai_calls`) ne contient jamais de texte, seulement des compteurs et des codes. Les textes et leurs corrections sont synchronisés comme le reste de tes données, dans le projet Supabase, protégés par la RLS.

## 16. Mise à jour de la phase 3 (Parcours)

La phase 3 n'ajoute aucune migration ni aucun secret. Elle ajoute une tâche à l'Edge Function : la création d'exercices par l'IA.

1. **Publier le code** : `git push`. Vercel redéploie l'application (section 1), et la CI doit être verte.
2. **Redéployer l'Edge Function**, sans quoi la création d'exercices répondrait « La demande n'a pas été acceptée par le serveur » :

   ```sh
   npx supabase@2.118.0 functions deploy ai --use-api
   ```

3. **Sur le téléphone** : « Nouvelle version disponible » → **Mettre à jour**. La barre du bas affiche désormais **Parcours**.
4. **Vérifier** :
   - **Parcours → Présent continu → Lire la leçon** : la frise, le tableau, les exemples et la ligne « Pour aller plus loin » s'affichent ; le bouton de haut-parleur lit un exemple.
   - **Réglages → Lecture audio** : choisir une voix anglaise et une vitesse, puis **Écouter un exemple**. Si aucune voix anglaise n'apparaît, installer une voix anglaise dans les réglages Android (**Paramètres → Gestion globale → Synthèse vocale**, selon le modèle).
   - En mode avion, les leçons et les exercices s'affichent, même ceux jamais ouverts : après la mise à jour, tout le Parcours est enregistré sur le téléphone.
5. **Relire un échantillon** (D-059) : faire au moins la leçon et une dizaine d'exercices de trois notions, dont « _Just_, _already_, _yet_ et _still_ », et noter toute réponse attendue ou variante douteuse, avec la phrase concernée.

La création d'exercices par l'IA n'apparaît qu'une fois tous les exercices d'une étape faits (au moins dix par étape). Chaque création coûte au plus 0,16 USD, nouvelle tentative comprise (en pratique bien moins), et apparaît dans **Réglages → Voir la consommation** (« Exercices générés »).

## 17. Mise à jour de la phase 4 (production écrite)

La phase 4 n'ajoute aucune migration ni aucun secret. Elle ajoute deux tâches à l'Edge Function : la correction d'un texte et la vérification d'une réponse de carte.

1. **Publier le code** : `git push`. Vercel redéploie l'application (section 1), et la CI doit être verte.
2. **Redéployer l'Edge Function**, sans quoi « Corriger » répondrait « La demande n'a pas été acceptée par le serveur » :

   ```sh
   npx supabase@2.118.0 functions deploy ai --use-api
   ```

3. **Sur le téléphone** : « Nouvelle version disponible » → **Mettre à jour**. La barre du bas affiche désormais **Reprises**, et l'accueil la **séance du jour**.
4. **Vérifier** :
   - **Accueil → Journal** : écris trois phrases, puis **Corriger mon texte**. Les passages à revoir s'affichent avec un indice ; corrige-les, puis **Vérifier mes corrections** : la correction, la version naturelle et l'expression du jour apparaissent. **Réglages → Voir la consommation** montre la ligne « Corrections ».
   - **Reprises** : une carte issue d'une erreur apparaît (sauf si sa notion n'est pas encore étudiée : elle attend l'étape « Traduire »). Réponds, puis confirme la note.
   - **Thème** : il s'ouvre dès qu'une notion atteint l'étape « Traduire » (ou après un test de positionnement réussi). Une réponse attendue est corrigée sans réseau.
5. **Coûts** : une correction coûte en général 0,02 à 0,04 USD ; l'écran affiche avant chaque demande son maximum (0,18 USD, nouvelle tentative comprise). Une vérification de carte coûte moins d'un centime. Le plafond mensuel de l'Edge Function (10 USD par défaut, section 10) s'applique toujours.
6. **À relever pour la suite** : les corrections qui te semblent fausses (une phrase juste signalée, une mauvaise règle), avec la phrase concernée. Le bouton « Signaler » arrive en phase 5 ; d'ici là, note-les pour le banc d'essai.
