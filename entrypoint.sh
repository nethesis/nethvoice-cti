#!/bin/sh

#
# Copyright (C) 2022 Nethesis S.r.l.
# http://www.nethesis.it - nethserver@nethesis.it
#
# This script is part of NethServer.
#
# NethServer is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License,
# or any later version.
#
# NethServer is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with NethServer.  If not, see COPYING.
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
    window.location.pathname +
    'api',
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

exec "$@"
