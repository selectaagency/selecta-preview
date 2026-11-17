#!/bin/bash
# Publie la version actuelle sur le site public (GitHub Pages) :
#   ./publish.sh "message du commit"
# Le dépôt privé (selecta-site) reste privé ; celui-ci n'est qu'un miroir public.
set -e
cd "$(dirname "$0")"

git add -A
if ! git diff --cached --quiet; then
  git commit -m "${1:-Mise a jour du site}"
fi
echo "→ dépôt privé"
git push origin main
echo "→ site public"
git push preview main
echo "✅ en ligne dans ~1 min : https://selectaagency.github.io/selecta-preview/"
