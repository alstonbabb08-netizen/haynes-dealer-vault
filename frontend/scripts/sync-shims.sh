#!/usr/bin/env bash
set -e

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
GUARD="$SCRIPT_DIR/cmd-guard.js"
SHIM_SRC="$SCRIPT_DIR/install-guard.sh"
BIN_DIR=/opt/install-guard/bin
MASTER="$BIN_DIR/.install-guard.sh"

mkdir -p "$BIN_DIR"
install -m 0755 "$SHIM_SRC" "$MASTER"

for f in "$BIN_DIR"/*; do
  if [ -L "$f" ] && [ "$(readlink "$f")" = "$MASTER" ]; then
    rm -f "$f"
  fi
done

for name in $(node "$GUARD" --list-commands); do
  ln -sf "$MASTER" "$BIN_DIR/$name"
done
