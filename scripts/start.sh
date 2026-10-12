#!/bin/bash
# Start AI Supply Chain Management (backend + frontend)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Backend dependencies (if needed)"
export PYTHONPATH="$ROOT/backend:${PYTHONPATH:-}"
cd "$ROOT/backend"
python3 -c "import fastapi, uvicorn, sqlalchemy, passlib" 2>/dev/null || \
  pip install -q -r requirements.txt || \
  pip install -q 'bcrypt==4.0.1' fastapi 'uvicorn[standard]' sqlalchemy pydantic pydantic-settings \
    'python-jose[cryptography]' 'passlib[bcrypt]' python-multipart email-validator \
    pandas numpy scikit-learn joblib python-dateutil aiofiles

echo "==> Starting Backend (FastAPI :8000)"
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 2

echo "==> Preparing Frontend"
FRONTEND_DIR="$ROOT/frontend"
if [ ! -d "$ROOT/frontend/node_modules/vite" ]; then
  if [ ! -d /tmp/ai-scm-frontend/node_modules/vite ]; then
    echo "    Installing npm packages into /tmp/ai-scm-frontend ..."
    rm -rf /tmp/ai-scm-frontend
    mkdir -p /tmp/ai-scm-frontend
    cp -a "$ROOT/frontend/package.json" "$ROOT/frontend/vite.config.js" \
          "$ROOT/frontend/index.html" "$ROOT/frontend/postcss.config.js" \
          "$ROOT/frontend/tailwind.config.js" /tmp/ai-scm-frontend/
    cp -a "$ROOT/frontend/src" /tmp/ai-scm-frontend/
    (cd /tmp/ai-scm-frontend && npm install --registry https://registry.npmjs.org/ --no-fund --no-audit)
  fi
  FRONTEND_DIR=/tmp/ai-scm-frontend
fi

echo "==> Starting Frontend (Vite :5173) from $FRONTEND_DIR"
cd "$FRONTEND_DIR"
npx vite --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "============================================"
echo "  AI Supply Chain Management is running"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo "============================================"
echo "  Demo login: manager@bharatsmart.in / manager123"
echo "  Or create an account via Sign Up page"
echo "============================================"

wait
