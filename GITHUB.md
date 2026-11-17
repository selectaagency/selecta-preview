# Mettre le projet sur GitHub et faire travailler Kevin dessus

Le site est du HTML/CSS/JS pur : pas de compilation, pas de dépendances.
Un dépôt Git peut donc être publié tel quel.

## 1. Créer le dépôt — ✅ déjà fait

Dépôt : **https://github.com/selectaagency/selecta-site** (privé, branche `main`).
Le dossier local `~/Sites/selecta-v10` est relié à ce dépôt (`origin`).
Pour envoyer une modification depuis le terminal :

```bash
cd ~/Sites/selecta-v10
git add -A && git commit -m "ce que j'ai changé" && git push
```

L'historique des étapes qui ont mené là (à titre de référence) :

1. Aller sur **github.com** → créer un compte si besoin (gratuit).
2. Bouton **+** en haut à droite → **New repository**.
3. Nom : `selecta-site` · Visibilité : **Private** · Ne rien cocher d'autre → **Create repository**.
4. Installer **GitHub Desktop** (desktop.github.com) — interface graphique, aucun terminal.
5. Dans GitHub Desktop : **File → Add local repository** → choisir `~/Sites/selecta-v10`
   (le dépôt Git y est déjà initialisé et le premier commit est fait).
6. Bouton **Publish repository** → décocher « Keep this code private » si on la veut privée…
   en fait laisser coché pour rester privé, puis **Publish**.

## 2. Ajouter Kevin

1. Sur la page du dépôt : **Settings → Collaborators → Add people**.
2. Chercher son pseudo GitHub, l'ajouter.
3. Kevin reçoit un e-mail d'invitation : il doit l'accepter.

## 3. Ce que fait Kevin

1. GitHub Desktop → **File → Clone repository** → choisir `selecta-site`.
2. **Branch → New branch** : `kevin/ma-modif`.
3. Il modifie les fichiers (index.html, etc.), puis **Commit** avec un message clair.
4. **Push origin**.
5. Sur GitHub : **Compare & pull request** → décrire ce qu'il a changé.

## 4. Ce que fait Théo pour fusionner

1. Ouvrir la Pull Request sur GitHub, lire l'onglet **Files changed**.
2. Si ça convient : **Merge pull request**.
3. Dans GitHub Desktop : **Fetch origin** puis **Pull origin** pour récupérer la version fusionnée.

## 5. Voir le site en ligne (ordinateur + téléphone)

Solution simple et gratuite : **Netlify** connecté au dépôt.

1. netlify.com → **Add new site → Import an existing project → GitHub**.
2. Autoriser Netlify, choisir `selecta-site`.
3. Build command : *(laisser vide)* · Publish directory : `.` → **Deploy**.
4. À chaque fusion dans `main`, le site se met à jour tout seul, avec une URL fixe
   du type `https://selecta-site.netlify.app`.
5. Netlify crée aussi une **preview par Pull Request** : on peut voir la version de
   Kevin avant de fusionner.

`github.io` (GitHub Pages) fonctionne aussi mais demande un dépôt public
(ou un compte GitHub Pro) — Netlify est plus simple pour un dépôt privé.

## 6. Règles à respecter

- **Ne jamais** mettre de mot de passe, clé `sb_secret_…` ou jeton dans le dépôt.
  Le fichier `.gitignore` exclut déjà les fichiers système et les archives.
- Un commit = une modification compréhensible (« corrige l'icône Merch », pas « maj »).
- Travailler sur une branche, jamais directement sur `main`.
- Les médias lourds (galerie : 40 Mo) sont dans le dépôt : c'est acceptable en dessous
  de 1 Go. Si ça grossit, Git LFS.

## Lancer le site en local

```bash
cd ~/Sites/selecta-v10
python3 ../tools/serve.py 8785 .
# → http://localhost:8785
```

Éviter `python3 -m http.server` : il est mono-thread et coupe les connexions quand
la page charge une quarantaine de médias d'un coup.
