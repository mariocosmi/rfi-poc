#!/bin/bash

# Script per generare informazioni build/deploy
# Usato durante il build su Netlify

# Ottieni informazioni da variabili ambiente Netlify o Git locale
BRANCH="${BRANCH:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')}"
COMMIT="${COMMIT_REF:-$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')}"
DEPLOY_DATE=$(date -u +"%Y-%m-%d %H:%M UTC")

# Crea file JavaScript con le informazioni
cat > js/build-info.js << EOF
// Generato automaticamente durante il build - NON modificare manualmente
window.BUILD_INFO = {
  branch: '${BRANCH}',
  commit: '${COMMIT}',
  deployDate: '${DEPLOY_DATE}'
};
EOF

echo "✅ Build info generato: branch=${BRANCH}, commit=${COMMIT}, date=${DEPLOY_DATE}"
