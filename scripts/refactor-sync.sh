#!/usr/bin/env bash
#
# Integración diaria del refactor.
#
# Ejecuta la cadena main → Emiliano → refactor y verifica que siga todo verde.
# No hace push ni mergea nada a main. Si algo se pone feo, para y lo dice.
#
# Si no hay red (o la red filtra SSH), sigue adelante con lo que ya está en local:
# el tramo Emiliano → refactor no necesita conexión. Lo avisa y no falla.
#
# Uso:  npm run refactor:sync
#       npm run refactor:sync -- --local    ni siquiera intenta el fetch
#
set -uo pipefail

RAMA_FEATURES="Emiliano"
RAMA_BASE="origin/main"
ROJO=$'\033[31m'; VERDE=$'\033[32m'; AMARILLO=$'\033[33m'; GRIS=$'\033[90m'; FIN=$'\033[0m'

paso()  { echo; echo "${GRIS}──${FIN} $1"; }
ok()    { echo "   ${VERDE}✓${FIN} $1"; }
aviso() { echo "   ${AMARILLO}!${FIN} $1"; }
morir() { echo; echo "   ${ROJO}✗ $1${FIN}"; echo; exit 1; }

RAMA_REFACTOR=$(git rev-parse --abbrev-ref HEAD)

case "$RAMA_REFACTOR" in
  refactor-*) ;;
  *) morir "Estás en '$RAMA_REFACTOR'. Este script se corre desde una rama refactor-*." ;;
esac

paso "Verificando que el árbol esté limpio"
if [ -n "$(git status --porcelain)" ]; then
  git status --short
  morir "Hay cambios sin commitear. Commitéalos o guárdalos antes de sincronizar."
fi
ok "limpio"

HAY_RED=1
if [ "${1:-}" = "--local" ]; then
  paso "Modo local: se omite el fetch"
  HAY_RED=0
  aviso "trabajando solo con lo que hay en el repo local"
else
  paso "Trayendo lo último de origin"
  if git fetch origin --quiet 2>/dev/null; then
    ok "$(git rev-parse --short $RAMA_BASE) en $RAMA_BASE"
  else
    HAY_RED=0
    aviso "sin conexión con origin (¿red filtrando SSH?)"
    aviso "sigo con lo local: $RAMA_BASE está en $(git rev-parse --short $RAMA_BASE), del $(git log -1 --format=%ad --date=short $RAMA_BASE)"
    aviso "vuelve a correrlo con red para no quedarte atrás de main"
  fi
fi

paso "Actualizando $RAMA_FEATURES desde $RAMA_BASE"
ATRAS_FEATURES=$(git rev-list --count "$RAMA_FEATURES..$RAMA_BASE")
if [ "$ATRAS_FEATURES" -eq 0 ]; then
  ok "$RAMA_FEATURES ya está al día"
else
  git checkout --quiet "$RAMA_FEATURES" || morir "No se pudo cambiar a $RAMA_FEATURES"
  if ! git merge "$RAMA_BASE" --no-edit --quiet; then
    git merge --abort 2>/dev/null
    git checkout --quiet "$RAMA_REFACTOR"
    morir "Conflicto al mergear $RAMA_BASE en $RAMA_FEATURES. Resuélvelo a mano y vuelve a correr esto."
  fi
  ok "$ATRAS_FEATURES commit(s) de $RAMA_BASE integrados en $RAMA_FEATURES"
  git checkout --quiet "$RAMA_REFACTOR"
fi

paso "Integrando $RAMA_FEATURES en $RAMA_REFACTOR"
ATRAS_REFACTOR=$(git rev-list --count "$RAMA_REFACTOR..$RAMA_FEATURES")
if [ "$ATRAS_REFACTOR" -eq 0 ]; then
  ok "el refactor ya está al día"
else
  echo "   $ATRAS_REFACTOR commit(s) por integrar:"
  git log --oneline --no-decorate "$RAMA_REFACTOR..$RAMA_FEATURES" | sed 's/^/     /'
  if ! git merge "$RAMA_FEATURES" --no-edit --quiet; then
    echo
    aviso "CONFLICTOS — el merge quedó a medias, a propósito:"
    git diff --name-only --diff-filter=U | sed 's/^/     /'
    echo
    echo "   Resuélvelos, luego:  git add -A && git commit"
    echo "   O para abortar:      git merge --abort"
    exit 2
  fi
  ok "$ATRAS_REFACTOR commit(s) integrados sin conflicto"
fi

paso "Corriendo los tests"
LOG_TESTS=$(mktemp -t refactor-sync-tests)
if npm test --silent > "$LOG_TESTS" 2>&1; then
  ok "$(grep -oE 'Tests +[0-9]+ passed' "$LOG_TESTS" | tail -1)"
else
  tail -25 "$LOG_TESTS"
  morir "Los tests fallaron después de integrar. NO sigas hasta arreglarlo."
fi

paso "Divergencia"
bash "$(dirname "$0")/refactor-estado.sh"

if [ "$HAY_RED" -eq 0 ]; then
  echo
  aviso "OJO: esto corrió sin fetch. La comparación contra main puede estar vieja."
fi
