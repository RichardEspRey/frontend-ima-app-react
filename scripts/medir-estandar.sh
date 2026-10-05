#!/usr/bin/env bash
# Mide la deuda contra docs/ESTANDAR-DE-INGENIERIA.md.
#
# No es una compuerta: siempre termina en 0. Lo que importa es que las cifras
# bajen entre una medición y la siguiente, y que lo que quede esté justificado
# en docs/refactor/PENDIENTES.md.
set -uo pipefail

cd "$(dirname "$0")/.."

NUEVAS=(src/app src/pages src/features src/entities src/shared)

archivos_codigo() {
  find "$@" -type f \( -name '*.js' -o -name '*.jsx' \) -not -path '*/__tests__/*' 2>/dev/null
}

titulo() { printf '\n\033[1m%s\033[0m\n' "$1"; }

titulo "1 · fetch( fuera de shared/api"
nuevas_fetch=$(archivos_codigo "${NUEVAS[@]}" | grep -v '^src/shared/api/' | xargs grep -l 'fetch(' 2>/dev/null)
viejas_fetch=$(archivos_codigo src/components src/hooks src/utils src/layouts src/navigation src/store | xargs grep -l 'fetch(' 2>/dev/null)
printf '  zona nueva: %s archivos\n' "$(printf '%s' "$nuevas_fetch" | grep -c . )"
printf '  zona vieja: %s archivos\n' "$(printf '%s' "$viejas_fetch" | grep -c . )"
printf '%s\n' "$nuevas_fetch" | sed '/^$/d; s/^/    /'

titulo "2 · Entidades que ninguna pantalla usa"
for dir in src/entities/*/; do
  nombre=$(basename "$dir")
  if ! grep -rqlE "entities/${nombre}([\"'/])" src --include='*.js' --include='*.jsx' \
       --exclude-dir=__tests__ --exclude-dir=no-usadas --exclude-dir="$nombre" 2>/dev/null; then
    printf '    %s\n' "$nombre"
  fi
done

titulo "3 · Archivos largos en la zona nueva"
largos=$(archivos_codigo "${NUEVAS[@]}" | xargs wc -l | grep -v ' total$' | sort -rn)
printf '  > 1000 líneas (duro): %s\n' "$(printf '%s\n' "$largos" | awk '$1 > 1000' | grep -c .)"
printf '  >  250 líneas (blando): %s\n' "$(printf '%s\n' "$largos" | awk '$1 > 250' | grep -c .)"
printf '%s\n' "$largos" | awk '$1 > 250 { printf "    %5d  %s\n", $1, $2 }' | head -15

titulo "4 · Colores escritos a mano en la zona nueva (fuera de los tokens)"
archivos_codigo "${NUEVAS[@]}" | grep -v 'shared/ui/tokens' \
  | xargs grep -oE '#[0-9a-fA-F]{6}\b' 2>/dev/null | cut -d: -f1 | cut -d/ -f2 | sort | uniq -c \
  | awk '{ printf "    %-10s %s\n", $2, $1 }'

titulo "5 · Props de Grid que MUI 7 ignora (item, xs, md… sin size)"
archivos_codigo "${NUEVAS[@]}" | xargs grep -cE '<Grid[^>]*[[:space:]](item|xs=|sm=|md=|lg=)' 2>/dev/null \
  | awk -F: '$2 > 0 { printf "    %3d  %s\n", $2, $1 }'

titulo "6 · Sesión leída de useAuthStore en features y pages (debe ser useSesion)"
archivos_codigo src/features src/pages | xargs grep -l 'useAuthStore' 2>/dev/null | sed 's/^/    /'

titulo "7 · Carpetas sin README.md o sin index.js"
for dir in src/entities/*/ src/features/*/; do
  faltan=()
  [ -f "${dir}README.md" ] || faltan+=("README")
  [ -f "${dir}index.js" ] || faltan+=("index.js")
  [ ${#faltan[@]} -gt 0 ] && printf '    %-36s %s\n' "${dir%/}" "${faltan[*]}"
done

echo
exit 0
