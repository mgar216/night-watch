#!/bin/sh
# Pose game screens in headless Firefox and save screenshots to /tmp/flf-shots (visual check).
# One shot: ./test/shots.sh <name> <W,H> <hash>     hash: shot,<scene>,<lang 0-2>,<seconds>,<area>,<pose>
cd "$(dirname "$0")/.." || exit 1
./build.sh /tmp/flf-shot.html test/driver.js >/dev/null
mkdir -p /tmp/flf-shots
shot() {
  p=$(mktemp -d)
  timeout 60 firefox --headless --no-remote --profile "$p" --window-size="$2" --screenshot "/tmp/flf-shots/$1.png" "file:///tmp/flf-shot.html#$3" >/dev/null 2>&1
  rm -rf "$p"
}
if [ -n "$1" ]; then shot "$1" "$2" "$3"; exit; fi
shot home-phone 412,800 shot,home,0,1
shot home-low-ru 640,360 shot,home,1,1
ls -la /tmp/flf-shots
