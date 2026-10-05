#!/usr/bin/env bash
set -euo pipefail
base=/home/mpg/gflow
mkdir -p "$base/releases"
release="$base/releases/${GITHUB_SHA:?}-${GITHUB_RUN_ID:?}"
mkdir -p "$release"
rsync -a --exclude=.git --exclude=node_modules --exclude=.github ./ "$release/"
previous=$(readlink -f "$base/current" || true)
ln -sfn "$release" "$base/current.next"
mv -Tf "$base/current.next" "$base/current"
sudo /usr/bin/systemctl restart gflow.service
for attempt in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:4174/healthz; then exit 0; fi
  sleep 1
done
if [ -n "$previous" ]; then
  ln -sfn "$previous" "$base/current.next"
  mv -Tf "$base/current.next" "$base/current"
  sudo /usr/bin/systemctl restart gflow.service
fi
exit 1
