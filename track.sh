#!/usr/bin/env bash

set -euo pipefail

ROOT="${1:-.}"
MARKER="Tracked by Git"

find "$ROOT" -type f \( \
    -name "*.js" -o \
    -name "*.jsx" -o \
    -name "*.css" -o \
    -name "*.html" \
\) | while read -r file; do

    if grep -q "$MARKER" "$file"; then
        echo "Skipping: $file"
        continue
    fi

    tmp=$(mktemp)

    case "$file" in
        *.html)
            {
                echo "<!-- $MARKER -->"
                cat "$file"
            } > "$tmp"
            ;;
        *)
            {
                echo "// $MARKER"
                cat "$file"
            } > "$tmp"
            ;;
    esac

    mv "$tmp" "$file"
    echo "Modified: $file"
done
