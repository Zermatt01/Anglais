# Déploiement et installation

Ce guide explique comment mettre l'application en ligne sur Vercel, puis l'installer sur un téléphone Android. Il sera complété en phase 2 (Supabase, clé Anthropic, variables d'environnement).

État en phase 1 : l'application ne dépend d'aucun serveur. Toutes les données restent sur le téléphone, et aucune variable d'environnement n'est nécessaire.

## 1. Publier le code sur GitHub

Vercel déploie depuis GitHub : les commits doivent d'abord y être poussés.

```sh
git push
```

La CI GitHub Actions vérifie alors les types, le lint, le format, les tests unitaires, les secrets (y compris dans tout l'historique) et les tests e2e. Elle doit être verte avant de déployer.

## 2. Créer le projet Vercel (une seule fois)

1. Sur [vercel.com](https://vercel.com), créer un compte **Hobby** (gratuit) avec « Continue with GitHub ».
2. **Add New… → Project**, puis choisir le dépôt. S'il n'apparaît pas, cliquer sur « Adjust GitHub App Permissions » et autoriser l'accès à ce dépôt privé.
3. Dans l'écran de configuration :
   - **Framework Preset** : Vite (détecté automatiquement) ;
   - **Root Directory** : `./` ;
   - **Build Command** : `npm run build` ;
   - **Output Directory** : `dist` ;
   - **Install Command** : `npm ci` (plus sûr que la valeur par défaut, car il respecte `package-lock.json`) ;
   - **Environment Variables** : aucune en phase 1.
4. Cliquer sur **Deploy**. Au bout d'une minute environ, Vercel affiche l'adresse de production, de la forme `https://<nom-du-projet>.vercel.app`. **Noter cette adresse** : la phase 2 en aura besoin pour la sécurité (CORS de l'Edge Function).
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

## 6. Sauvegarder ses données

Jusqu'à la synchronisation (phase 2), les données n'existent que sur le téléphone. **Désinstaller l'application ou effacer les données de Chrome les supprime.**

- Faire régulièrement **Réglages → Données → Exporter mes données** et garder le fichier (Drive, ordinateur…). Il ne contient aucune clé ni aucun mot de passe, seulement les données de l'application : réglages, profil, brouillons et, plus tard, cartes et productions.
- Pour restaurer, ou pour passer sur un autre appareil : **Importer** ce fichier. Rien n'est effacé ; pour chaque élément présent des deux côtés, la version la plus récente est gardée.

## 7. Confidentialité

L'adresse `*.vercel.app` est publique : quiconque la connaît peut ouvrir l'application, mais chacun n'y voit que les données de son propre appareil. En phase 1, aucune donnée ne quitte le téléphone. La phase 2 ajoutera un compte unique protégé par un code envoyé par e-mail.
