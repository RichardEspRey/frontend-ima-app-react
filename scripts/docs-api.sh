#!/usr/bin/env bash
#
# Regenera docs/api/ desde los bloques JSDoc de shared/, entities/ y features/.
#
# Escribe el destino solo si la generación funcionó. Con un `>` directo, jsdoc2md
# vacía el archivo antes de fallar, y basta con correrlo cuando esas carpetas aún
# no existen para perder el contenido.
#
# Uso:  npm run docs:api
#
set -uo pipefail

DESTINO="docs/api/README.md"
FUENTES=("src/shared/**/*.js" "src/entities/**/*.js" "src/features/**/*.js")
TEMPORAL=$(mktemp -t docs-api)

if ! npx --no-install jsdoc2md --files "${FUENTES[@]}" > "$TEMPORAL" 2>/dev/null || [ ! -s "$TEMPORAL" ]; then
  rm -f "$TEMPORAL"
  echo "docs:api — nada que documentar todavía (src/{shared,entities,features} vacíos o inexistentes)."
  echo "           $DESTINO se deja como está."
  exit 0
fi

mkdir -p "$(dirname "$DESTINO")"
{
  echo "<!-- Generado por 'npm run docs:api'. NO editar a mano: edita el JSDoc. -->"
  echo
  cat "$TEMPORAL"
} > "$DESTINO"
rm -f "$TEMPORAL"

echo "docs:api — $DESTINO regenerado ($(wc -l < "$DESTINO" | tr -d ' ') líneas)."
