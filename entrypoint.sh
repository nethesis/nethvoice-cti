#!/bin/sh

#
# Copyright (C) 2023 Nethesis S.r.l.
# SPDX-License-Identifier: GPL-2.0-only
#

cat > /app/public/config/config.production.js<<EOF
window.CONFIG = {
  PRODUCT_NAME: '${PRODUCT_NAME:=NethVoice CTI}',
  COMPANY_NAME: '${COMPANY_NAME:=Nethesis}',
  COMPANY_URL: '${COMPANY_URL:=https://www.nethesis.it/}',
EOF

if [ -z $API_ENDPOINT ]; then
	cat >> /app/public/config/config.production.js<<EOF
  API_ENDPOINT:
    window.location.hostname +
    (window.location.port ? ':' + window.location.port : '') +
    window.location.pathname,
EOF
else
	cat >> /app/public/config/config.production.js<<EOF
  API_ENDPOINT: '$API_ENDPOINT',
EOF
fi

if [ -z $API_SCHEME ]; then
	cat >> /app/public/config/config.production.js<<EOF
  API_SCHEME: window.location.protocol + '//',
EOF
else
	cat >> /app/public/config/config.production.js<<EOF
  API_SCHEME: '$API_SCHEME',
EOF
fi

if [ -z $WS_ENDPOINT ]; then
	cat >> /app/public/config/config.production.js<<EOF
  WS_ENDPOINT:
    'wss://' +
    window.location.hostname +
    (window.location.port ? ':' + window.location.port : '') +
    window.location.pathname +
    'ws',
EOF
else
	cat >> /app/public/config/config.production.js<<EOF
  WS_ENDPOINT: '$WS_ENDPOINT',
EOF
fi

cat >> /app/public/config/config.production.js<<EOF
}

EOF

if [ ! -z $NAVBAR_LOGO_URL ]; then
  # navbar logo rebranding
  /usr/bin/wget --timeout=60 $NAVBAR_LOGO_URL -O /app/public/navbar_logo.png
fi

if [ ! -z $LOGIN_LOGO_URL ]; then
  # login logo rebranding
  /usr/bin/wget --timeout=60 $LOGIN_LOGO_URL -O /app/public/login_logo.png
fi

if [ ! -z $FAVICON_URL ]; then
  # favicon rebranding
  /usr/bin/wget --timeout=60 $FAVICON_URL -O /app/public/favicon.ico
fi

exec "$@"
