#!/usr/bin/env bash
#
# Mide qué tan al día está el refactor y avisa cuando se está quedando atrás.
#
# El refactor es una rama de vida larga que reemplazará a `Emiliano` cuando esté
# probada al 100 %. Que acumule commits propios es su trabajo, no un problema: lo
# que lo mata es quedarse ATRÁS de lo que se sigue desarrollando.
#
# Por eso el tripwire NO mira los commits propios. Mira dos cosas:
#   · commits de Emiliano sin integrar  (tope 15)
#   · días desde la última integración  (tope 14)
#
# La rama `refactor` de abril murió justo así: 116 commits de divergencia porque
# nadie la sincronizaba, no porque hubiera hecho demasiado.
#
# Uso:  npm run refactor:estado          solo reporta
#       npm run refactor:estado -- -w    además escribe la fila en 00-ESTADO.md
#
set -uo pipefail

RAMA_FEATURES="Emiliano"
TOPE_ATRAS=15
TOPE_DIAS=14
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
echo "   commits de $RAMA_FEATURES sin integrar: ${NEGRITA}$ATRAS${FIN} / $TOPE_ATRAS   <- el que importa"
echo "   días desde la última integración:  ${NEGRITA}$DIAS${FIN} / $TOPE_DIAS"
echo "   commits propios del refactor:      ${NEGRITA}$PROPIOS${FIN}   (informativo: es el trabajo hecho)"
echo

ALERTA=0
if [ "$ATRAS" -ge "$TOPE_ATRAS" ]; then
  echo "   ${ROJO}${NEGRITA}TRIPWIRE: $ATRAS commits de $RAMA_FEATURES sin integrar (tope $TOPE_ATRAS).${FIN}"
  ALERTA=1
fi
if [ "$DIAS" -ge "$TOPE_DIAS" ]; then
  echo "   ${ROJO}${NEGRITA}TRIPWIRE: $DIAS días sin integrar (tope $TOPE_DIAS).${FIN}"
  ALERTA=1
fi

if [ "$ALERTA" -eq 1 ]; then
  echo "   ${ROJO}Parar de agregar incrementos y ponerse al día con $RAMA_FEATURES primero.${FIN}"
elif [ "$ATRAS" -gt 0 ]; then
  echo "   ${AMARILLO}Hay $ATRAS commit(s) de $RAMA_FEATURES sin integrar. Corre: npm run refactor:sync${FIN}"
elif [ "$DIAS" -ge $(( TOPE_DIAS * 3 / 4 )) ]; then
  echo "   ${AMARILLO}Acercándose al tripwire. Correr npm run refactor:sync.${FIN}"
else
  echo "   ${VERDE}Sano.${FIN}"
fi

if [ "${1:-}" = "-w" ] && [ -f "$ESTADO" ]; then
  HOY=$(date +%Y-%m-%d)
  FILA="| $HOY | $ATRAS | $DIAS | $PROPIOS |"
  awk -v fila="$FILA" -v hoy="| $HOY |" '
    index($0, hoy) == 1 { next }
    /^\| Fecha \| Commits de divergencia/ { print; getline; print; print fila; next }
    { print }
  ' "$ESTADO" > "$ESTADO.tmp" && mv "$ESTADO.tmp" "$ESTADO"
  echo "   $ESTADO actualizado: $PROPIOS commits, $(( DIAS / 7 )) semanas"
fi
