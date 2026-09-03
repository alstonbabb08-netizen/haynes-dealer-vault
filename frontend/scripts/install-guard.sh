#!/usr/bin/env bash
# Dynamic command guard shim.
GUARD=/app/frontend/scripts/cmd-guard.js
BIN_NAME=$(basename "$0")

if [ -f "$GUARD" ] && command -v node >/dev/null 2>&1; then
  OUT=$(node "$GUARD" --cmd "$BIN_NAME" --args "$@")
  RC=$?
  if [ "$RC" -eq 1 ]; then
    exit 1
  elif [ "$RC" -eq 2 ]; then
    NEWARGV=()
    while IFS= read -r line; do
      [ -n "$line" ] && NEWARGV+=("$line")
    done <<EOF
$OUT
EOF
    exec "${NEWARGV[@]}"
  fi
fi

SELF_DIR=$(dirname "$(readlink -f "$0")")
REAL_BIN=""
IFS=':' read -ra DIRS <<<"$PATH"
for dir in "${DIRS[@]}"; do
  if [ "$dir" != "$SELF_DIR" ] && [ -x "$dir/$BIN_NAME" ]; then
    REAL_BIN="$dir/$BIN_NAME"
    break
  fi
done

if [ -z "$REAL_BIN" ]; then
  echo "cmd-guard: real $BIN_NAME not found in PATH" >&2
  exit 1
fi

exec "$REAL_BIN" "$@"
