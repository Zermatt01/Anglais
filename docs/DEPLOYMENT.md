# Déploiement et installation

Ce guide explique comment mettre l'application en ligne sur Vercel, l'installer sur un téléphone Android, puis brancher le serveur : compte, synchronisation et IA.

- **Sections 1 à 5** (phase 1) : l'application seule. Elle fonctionne alors entièrement sur le téléphone, sans compte ni IA.
- **Sections 6 à 12** (phase 2) : le projet Supabase (compte, base de données, Edge Function « ai »), la clé Anthropic et les variables Vercel. À faire une seule fois, dans l'ordre.

Aucune clé n'est jamais écrite dans le dépôt. La seule clé secrète, celle d'Anthropic, n'est enregistrée qu'à un endroit : les secrets de l'Edge Function (section 10).

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

1. **Créer le compte unique** : **Authentication → Users → Add user → Create new user**.
   - E-mail : ton adresse ;
   - mot de passe : en générer un au hasard (il ne servira jamais) ;
   - cocher **Auto Confirm User**.
2. **Fermer les inscriptions** : **Authentication → Sign In / Providers** : désactiver « **Allow new users to sign up** ». Le fournisseur **Email** doit rester activé. L'application ne crée jamais de compte : personne d'autre ne pourra s'inscrire.
3. **Envoyer un code au lieu d'un lien** : **Authentication → Emails → Templates → Magic Link**. Remplacer le sujet et le contenu par :
   - Sujet : `Ton code de connexion`
   - Contenu :

     ```html
     <h2>Ton code de connexion</h2>
     <p>Saisis ce code dans l'application Anglais : <strong>{{ .Token }}</strong></p>
     <p>Il reste valable une heure. Si tu n'as rien demandé, ignore ce message.</p>
     ```

   Enregistrer. Le code doit apparaître par `{{ .Token }}` ; sans lui, Supabase enverrait un lien.

4. **URL Configuration** : mettre dans **Site URL** l'adresse Vercel de la section 2.

Limites du service d'e-mail intégré de Supabase : **deux e-mails par heure** pour tout le projet, et un nouveau code au plus toutes les 60 secondes. Un code non reçu arrive souvent dans les indésirables ; attendre avant d'en redemander un.

## 8. Créer les tables (migrations)

Dans un terminal ouvert dans le dossier du projet (VS Code : **Terminal → New Terminal**). La CLI de Supabase s'exécute par `npx`, sans installation ni Docker.

```sh
npx supabase@2.118.0 login
npx supabase@2.118.0 link --project-ref <ref>
npx supabase@2.118.0 db push
```

- `login` ouvre le navigateur pour autoriser la CLI.
- `link` demande le mot de passe de la base (section 6).
- `db push` liste les migrations de `supabase/migrations/` (trois aujourd'hui : `…_sync.sql`, `…_ai_calls.sql` et `…_ai_refusals_not_logged.sql`) et demande confirmation. Après une mise à jour du dépôt qui en ajoute, relancer la même commande : seules les nouvelles sont appliquées.

Vérification : **Table Editor** montre `sync_documents`, `sync_events` et `ai_calls`, chacune marquée « RLS enabled ».

## 9. Préparer la clé Anthropic

1. Ouvrir la Claude Console ([platform.claude.com](https://platform.claude.com), anciennement console.anthropic.com) et créer un compte.
2. **Billing** : acheter du crédit (5 USD suffisent pour commencer) et **laisser le rechargement automatique désactivé** : la dépense ne peut alors jamais dépasser le crédit acheté.
3. Si la console le propose (**Settings → Limits**), fixer une limite de dépense mensuelle, par exemple 10 USD : c'est une seconde barrière, en plus du plafond de l'Edge Function.
4. **API Keys → Create Key**, nommée `anglais-edge-function`. **La copier une seule fois**, directement dans les secrets de la section 10, et nulle part ailleurs : ni dans un fichier, ni dans un message, ni dans le dépôt.

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

| Message de l'application                              | Cause probable et correction                                                                                                                                                          |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| « Aucun compte n'existe pour cette adresse »          | Compte non créé ou adresse différente (section 7).                                                                                                                                    |
| Aucun code reçu                                       | Dossier des indésirables ; limite de deux e-mails par heure ; modèle d'e-mail sans `{{ .Token }}` (section 7).                                                                        |
| « Synchronisation interrompue »                       | Projet en pause (section 13) ou migrations non appliquées (section 8).                                                                                                                |
| « Le serveur IA n'est pas prêt »                      | Secret manquant ou invalide. **Edge Functions → ai → Logs** : la ligne `misconfigured` nomme la variable à corriger (jamais sa valeur).                                               |
| « Ce compte n'est pas autorisé à utiliser l'IA »      | Adresse absente de `AI_ALLOWED_EMAILS`.                                                                                                                                               |
| « Ta session a expiré »                               | Se déconnecter puis se reconnecter. Si cela persiste : clés de signature « Legacy » (section 6, point 4).                                                                             |
| « Le serveur IA n'a pas pu être joint »               | Fonction non déployée, ou `AI_ALLOWED_ORIGINS` différent de l'adresse ouverte (la comparer exactement, `https://` compris).                                                           |
| « Le service d'IA n'a pas répondu »                   | Clé Anthropic invalide ou crédit épuisé : les journaux de la fonction indiquent `anthropic_401` (clé) ou `anthropic_400` / `anthropic_402` (crédit). Vérifier dans la Claude Console. |
| Build Vercel en échec : « Content-Security-Policy … » | Lancer la commande indiquée (section 11, point 2), puis pousser.                                                                                                                      |

## 13. Coûts et limites

- **Supabase (gratuit)** : un projet sans activité pendant **sept jours** est mis en pause ; Supabase prévient par e-mail environ une semaine avant. Les données sont conservées ; **Resume project** dans le tableau de bord le relance (possible pendant un an). Pendant une pause, l'application fonctionne normalement sur le téléphone ; seules la synchronisation et l'IA attendent. Un usage régulier de l'application suffit à éviter la pause (DECISIONS D-029).
- **Anthropic** : l'IA n'est appelée que sur une action explicite (COST-01). L'Edge Function refuse tout appel qui ferait dépasser le plafond mensuel (10 USD par défaut), et au plus 6 appels par minute. **Réglages → Voir la consommation** montre le coût du jour, du mois et par fonction.
- **Vercel (Hobby)** : gratuit pour cet usage.

## 14. Sauvegarder ses données

Une fois connecté, les données sont copiées sur le serveur à chaque synchronisation, et un autre appareil connecté au même compte les retrouve. **Désinstaller l'application ou effacer les données de Chrome ne supprime alors que la copie du téléphone.**

L'export reste recommandé de temps en temps, surtout avant de changer de téléphone :

- **Réglages → Données → Exporter mes données** produit un fichier à garder (Drive, ordinateur…). Il ne contient aucune clé ni aucun mot de passe, seulement les données de l'application : réglages, profil, brouillons et, plus tard, cartes et productions. Les brouillons ne sont jamais synchronisés : seul l'export les sauvegarde.
- Pour restaurer, ou pour passer sur un autre appareil : **Importer** ce fichier. Rien n'est effacé ; pour chaque élément présent des deux côtés, la version la plus récente est gardée.

## 15. Confidentialité

- L'adresse `*.vercel.app` est publique : quiconque la connaît peut ouvrir l'application, mais sans compte, il n'y voit que les données de son propre appareil. Les inscriptions sont fermées.
- Les données synchronisées sont stockées dans le projet Supabase (région choisie à la section 6), protégées par la RLS : seul le compte connecté y a accès.
- L'IA ne reçoit que ce qu'une action demande : le test de connexion n'envoie rien de personnel. À partir de la phase 4, « Corriger » enverra le texte à corriger. Le journal des appels (`ai_calls`) ne contient jamais de texte, seulement des compteurs et des codes.
