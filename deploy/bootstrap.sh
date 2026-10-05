#!/usr/bin/env bash
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo 'Execute com sudo'; exit 1; }
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs npm ffmpeg rsync curl git libicu-dev
install -d -o mpg -g mpg /home/mpg/gflow/releases
cat > /etc/systemd/system/gflow.service <<'UNIT'
[Unit]
Description=GuiaFlow Marketing
After=network.target
[Service]
User=mpg
Group=mpg
WorkingDirectory=/home/mpg/gflow/current
Environment=PORT=4174
Environment=HOST=127.0.0.1
Environment=NODE_ENV=production
EnvironmentFile=-/etc/gflow.env
ExecStart=/usr/bin/node scripts/dev-server.mjs
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
MemoryMax=2G
TasksMax=128
[Install]
WantedBy=multi-user.target
UNIT
echo 'mpg ALL=(root) NOPASSWD: /usr/bin/systemctl restart gflow.service' > /etc/sudoers.d/gflow-deploy
chmod 440 /etc/sudoers.d/gflow-deploy
visudo -cf /etc/sudoers.d/gflow-deploy
systemctl daemon-reload
systemctl enable gflow.service
cd /home/mpg/gflow-runner
if [ ! -f .service ]; then ./svc.sh install mpg; fi
./svc.sh start
echo 'Runner iniciado. O workflow instalará o aplicativo em 127.0.0.1:4174.'
