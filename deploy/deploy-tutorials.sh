#!/usr/bin/env bash
set -euo pipefail
export XDG_RUNTIME_DIR=/run/user/$(id -u)
export DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus
base=/home/mpg/gflow-tutorials
release="$base/releases/${GITHUB_SHA:?}-${GITHUB_RUN_ID:?}"
mkdir -p "$release" /home/mpg/.config/systemd/user
rsync -a --exclude=.git --exclude=node_modules --exclude=.github ./ "$release/"
previous=$(readlink -f "$base/current" || true)
ln -sfn "$release" "$base/current.next"
mv -Tf "$base/current.next" "$base/current"
cp deploy/gflow-tutorials.service /home/mpg/.config/systemd/user/gflow-tutorials.service
systemctl --user daemon-reload
systemctl --user enable gflow-tutorials.service
systemctl --user restart gflow-tutorials.service
for attempt in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:4173/healthz; then exit 0; fi
  sleep 1
done
if [ -n "$previous" ]; then
  ln -sfn "$previous" "$base/current.next"
  mv -Tf "$base/current.next" "$base/current"
  systemctl --user restart gflow-tutorials.service
fi
exit 1
