#!/usr/bin/env bash
#
# Deploy the static export (out/) to a Hostinger folder over SSH/rsync.
#
# Shared by both GitHub Actions workflows; behaviour is driven entirely by env vars
# so there is no per-environment code divergence:
#
#   SSH_HOST, SSH_PORT, SSH_USER, SSH_PRIVATE_KEY  - connection (GitHub secrets)
#   TARGET_DIR                                     - absolute server folder (secret)
#   REWRITE_BASE                                   - Apache RewriteBase, e.g. /sanad-admin/
#   BACKUP                                         - "1" to tar the target before deploy
#
# Safety properties:
#   * out/ is rsynced with --delete so stale hashed assets are removed (idempotent),
#     but .htaccess is EXCLUDED from the sync so the live SPA-routing file is never
#     deleted mid-deploy. The correct per-env .htaccess is then written explicitly.
#   * When BACKUP=1 the current target is tar'd (timestamped) BEFORE anything changes,
#     giving a one-command rollback. Backups are pruned to the last 5.
#   * Secrets are never echoed. SSH keepalive + bounded retries handle Hostinger's
#     connection throttling.
set -euo pipefail

# --- required inputs (fail fast; ${VAR:?} prints the NAME, never the value) --------
: "${SSH_HOST:?SSH_HOST not set}"
: "${SSH_PORT:?SSH_PORT not set}"
: "${SSH_USER:?SSH_USER not set}"
: "${SSH_PRIVATE_KEY:?SSH_PRIVATE_KEY not set}"
: "${TARGET_DIR:?TARGET_DIR not set}"
: "${REWRITE_BASE:?REWRITE_BASE not set}"
BACKUP="${BACKUP:-0}"

[ -d out ] || { echo "::error::out/ not found — did the build run?"; exit 1; }
[ -f deploy/htaccess ] || { echo "::error::deploy/htaccess template missing"; exit 1; }

# normalise: drop any trailing slash from the target folder
TARGET_DIR="${TARGET_DIR%/}"

# --- write the deploy key (masked by Actions; printf avoids echoing contents) ------
mkdir -p "$HOME/.ssh"; chmod 700 "$HOME/.ssh"
KEY="$HOME/.ssh/sanad_deploy_key"
printf '%s\n' "$SSH_PRIVATE_KEY" > "$KEY"
chmod 600 "$KEY"
touch "$HOME/.ssh/known_hosts"; chmod 644 "$HOME/.ssh/known_hosts"
cleanup() { rm -f "$KEY" "${RENDERED:-}"; }
trap cleanup EXIT

# accept-new pins the host key on first use (TOFU); keepalive survives throttling.
SSH_OPTS="-o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=$HOME/.ssh/known_hosts -o ServerAliveInterval=30 -o ServerAliveCountMax=5 -o ConnectTimeout=30 -o BatchMode=yes"
RSH="ssh -i $KEY -p $SSH_PORT $SSH_OPTS"

# --- bounded retry with backoff (Hostinger throttles rapid reconnects) -------------
retry() {
  local n=1 max=3 delay=15
  while true; do
    if "$@"; then return 0; fi
    if [ "$n" -ge "$max" ]; then
      echo "::error::'$1' failed after ${max} attempts" >&2
      return 1
    fi
    echo "attempt ${n}/${max} failed; retrying in ${delay}s..." >&2
    sleep "$delay"
    n=$((n + 1)); delay=$((delay + 15))
  done
}

# --- render the per-environment .htaccess from the committed template --------------
RENDERED="$(mktemp)"
sed "s#__REWRITE_BASE__#${REWRITE_BASE}#g" deploy/htaccess > "$RENDERED"
echo "==> Rendered .htaccess (RewriteBase ${REWRITE_BASE}):"
sed 's/^/    /' "$RENDERED"

# --- optional: back up the current target before touching it (production) ----------
if [ "$BACKUP" = "1" ]; then
  echo "==> Backing up current target before deploy"
  TS="$(date -u +%Y%m%d-%H%M%S)"
  PARENT="$(dirname "$TARGET_DIR")"
  BASE="$(basename "$TARGET_DIR")"
  # Values are expanded locally inside single quotes (server paths have no quotes);
  # \$BK stays a remote variable.
  backup_cmd="
set -eu
if [ -d '$TARGET_DIR' ]; then
  BK='$PARENT/sanad-admin-backups'
  mkdir -p \"\$BK\"
  tar -czf \"\$BK/$BASE-$TS.tar.gz\" -C '$PARENT' '$BASE'
  ls -1t \"\$BK/$BASE-\"*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm -f
  echo \"    backup created: \$BK/$BASE-$TS.tar.gz\"
else
  echo '    no existing target dir; skipping backup'
fi
"
  retry ssh -i "$KEY" -p "$SSH_PORT" $SSH_OPTS "$SSH_USER@$SSH_HOST" "$backup_cmd"
fi

# --- sync app files (creates the folder if missing; .htaccess left untouched) ------
echo "==> Syncing out/ -> $SSH_USER@$SSH_HOST:$TARGET_DIR/ (--delete, .htaccess excluded)"
retry rsync -rlptz --delete --exclude='.htaccess' \
  -e "$RSH" \
  --rsync-path="mkdir -p '$TARGET_DIR' && rsync" \
  out/ "$SSH_USER@$SSH_HOST:$TARGET_DIR/"

# --- place the correct .htaccess (written AFTER the sync, never deleted) ------------
echo "==> Placing environment .htaccess"
retry rsync -ptz -e "$RSH" "$RENDERED" "$SSH_USER@$SSH_HOST:$TARGET_DIR/.htaccess"

echo "==> Deploy complete."
