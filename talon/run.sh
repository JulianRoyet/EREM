#!/bin/sh
set -ue
base=$(cd "$(dirname "$0")" && pwd)
if [ -e /etc/udev/rules.d ] && [ ! -e /etc/udev/rules.d/10-talon.rules ]; then
    echo "[+] Prompting for admin to set up Tobii udev rule"
    sudo cp "$base/10-talon.rules" /etc/udev/rules.d/
    sudo udevadm control --reload-rules
fi
unset QT_AUTO_SCREEN_SCALE_FACTOR QT_SCALE_FACTOR
LC_NUMERIC=C QT_PLUGIN_PATH="$base/lib/plugins" LD_LIBRARY_PATH="$base/lib:$base/resources/python/lib:$base/resources/pypy/lib" "$base/talon" "$@"
