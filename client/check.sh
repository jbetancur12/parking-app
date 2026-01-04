#!/bin/bash

PROJECT_DIR="c:/Users/alejo/Documents/carpetaprotegida/parking-app/client/src"

# Buscar solo archivos con extensiones específicas
find "$PROJECT_DIR" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) \
  ! -path "*/node_modules/*" | while read file; do
    line_count=$(wc -l < "$file")
    if [ "$line_count" -gt 200 ]; then
        echo "$file -> $line_count líneas"
    fi
done