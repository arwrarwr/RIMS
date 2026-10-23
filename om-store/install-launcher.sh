#!/bin/sh
# Adds an "OM Store" icon to your app menu and Desktop (Linux). Run once: sh install-launcher.sh
DIR="$(cd "$(dirname "$0")" && pwd)"
NODEDIR="$(dirname "$(command -v node)")"
F="$HOME/.local/share/applications/om-store.desktop"
mkdir -p "$HOME/.local/share/applications"
cat > "$F" <<EOT
[Desktop Entry]
Type=Application
Name=OM Store
Comment=Retail, dues and returns manager
Exec=sh -c 'export PATH="$NODEDIR:\$PATH"; cd "$DIR" && npm start'
Icon=$DIR/build/icon.png
Terminal=false
Categories=Office;
EOT
chmod +x "$F"
[ -d "$HOME/Desktop" ] && cp "$F" "$HOME/Desktop/OM Store.desktop" && chmod +x "$HOME/Desktop/OM Store.desktop"
echo "Done. Find OM Store in your app menu (right-click the Desktop copy > Allow Launching if asked)."
