#!/usr/bin/env bash
#
# Mide la divergencia del refactor y avisa cuando toca parar.
#
# La rama `refactor` de abril de 2026 llegó a 116 commits de divergencia sin que
# nadie mirara el número. Este script existe para que ese número esté a la vista.
#
# Tripwire: 40 commits propios o 42 días sin integrar.
#
# Uso:  npm run refactor:estado          solo reporta
#       npm run refactor:estado -- -w    además escribe la fila en 00-ESTADO.md
#
set -uo pipefail

RAMA_FEATURES="Emiliano"
TOPE_COMMITS=40
TOPE_DIAS=42
ESTADO="docs/refactor/00-ESTADO.md"

ROJO=$'\033[31m'; VERDE=$'\033[32m'; AMARILLO=$'\033[33m'; NEGRITA=$'\033[1m'; FIN=$'\033[0m'

RAMA_REFACTOR=$(git rev-parse --abbrev-ref HEAD)
LECTURA=($(git rev-list --left-right --count "$RAMA_FEATURES...$RAMA_REFACTOR"))
ATRAS=${LECTURA[0]}
PROPIOS=${LECTURA[1]}

BASE=$(git merge-base "$RAMA_FEATURES" "$RAMA_REFACTOR")
FECHA_BASE=$(git log -1 --format=%ct "$BASE")
DIAS=$(( ( $(date +%s) - FECHA_BASE ) / 86400 ))

echo "   rama:        $RAMA_REFACTOR"
echo "   commits propios del refactor:      ${NEGRITA}$PROPIOS${FIN} / $TOPE_COMMITS"
echo "   commits de $RAMA_FEATURES sin integrar: ${NEGRITA}$ATRAS${FIN}"
echo "   días desde la última integración:  ${NEGRITA}$DIAS${FIN} / $TOPE_DIAS"
echo

ALERTA=0
if [ "$PROPIOS" -ge "$TOPE_COMMITS" ]; then
  echo "   ${ROJO}${NEGRITA}TRIPWIRE: $PROPIOS commits propios (tope $TOPE_COMMITS).${FIN}"
  ALERTA=1
fi
if [ "$DIAS" -ge "$TOPE_DIAS" ]; then
  echo "   ${ROJO}${NEGRITA}TRIPWIRE: $DIAS días sin integrar (tope $TOPE_DIAS).${FIN}"
  ALERTA=1
fi

if [ "$ALERTA" -eq 1 ]; then
  echo "   ${ROJO}Parar de agregar incrementos y consolidar lo que hay.${FIN}"
elif [ "$ATRAS" -gt 0 ]; then
  echo "   ${AMARILLO}Hay $ATRAS commit(s) de $RAMA_FEATURES sin integrar. Corre: npm run refactor:sync${FIN}"
elif [ "$PROPIOS" -ge $(( TOPE_COMMITS * 3 / 4 )) ] || [ "$DIAS" -ge $(( TOPE_DIAS * 3 / 4 )) ]; then
  echo "   ${AMARILLO}Acercándose al tripwire. Ir pensando en consolidar.${FIN}"
else
  echo "   ${VERDE}Sano.${FIN}"
fi

if [ "${1:-}" = "-w" ] && [ -f "$ESTADO" ]; then
  FILA="| $(date +%Y-%m-%d) | $PROPIOS | $(( DIAS / 7 )) |"
  if grep -qF "| $(date +%Y-%m-%d) |" "$ESTADO"; then
    echo "   (la fila de hoy ya estaba en $ESTADO)"
  else
    awk -v fila="$FILA" '
      /^\| Fecha \| Commits de divergencia/ { print; getline; print; print fila; next }
      { print }
    ' "$ESTADO" > "$ESTADO.tmp" && mv "$ESTADO.tmp" "$ESTADO"
    echo "   fila agregada a $ESTADO"
  fi
fi
