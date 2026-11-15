#!/bin/sh
# Pose game screens in headless Firefox and save screenshots (visual check). The folder is /tmp/flf-shots,
# or $SHOTS when set: a copy of the repository that works at the same time must use a folder of its own.
# One shot: ./test/shots.sh <name> <W,H> <hash>     hash: shot,<scene>,<lang 0-2>,<seconds>,<area>,<pose>
cd "$(dirname "$0")/.." || exit 1
out=${SHOTS:-/tmp/flf-shots}
mkdir -p "$out"
./build.sh "$out/.page.html" test/driver.js >/dev/null
shot() {
  p=$(mktemp -d)
  timeout 60 firefox --headless --no-remote --profile "$p" --window-size="$2" --screenshot "$out/$1.png" "file://$out/.page.html#$3" >/dev/null 2>&1
  rm -rf "$p"
}
if [ -n "$1" ]; then shot "$1" "$2" "$3"; exit; fi
shot home-phone 412,800 shot,home,0,1
shot home-low-ru 640,360 shot,home,1,1
ls -la "$out"
