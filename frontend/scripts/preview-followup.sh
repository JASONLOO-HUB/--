#!/usr/bin/env bash
# 追问补充页独立预览：固定端口，避免与其它 preview 冲突
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PORT="${PORT:-3004}"
exec npm run dev:preview:followup -- --port "$PORT" --strictPort
