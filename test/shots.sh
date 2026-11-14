#!/bin/sh
# Pose game screens in headless Firefox and save screenshots to /tmp/nw-shots (visual check).
# Hash format: shot,<scene>,<night>,<lang 0-2>,<1 keep dialog | 2 tinker hand>,<seconds to simulate>
cd "$(dirname "$0")/.." || exit 1
./build.sh /tmp/nw-test.html test/driver.js >/dev/null
mkdir -p /tmp/nw-shots
shot() {
  p=$(mktemp -d)
  timeout 60 firefox --headless --no-remote --profile "$p" --window-size="$2" --screenshot "/tmp/nw-shots/$1.png" "file:///tmp/nw-test.html#$3" >/dev/null 2>&1
  rm -rf "$p"
}
if [ -n "$1" ]; then shot "$1" "$2" "$3"; exit; fi
shot home-phone 412,800 shot,home,1,0
shot home-wide 1280,720 shot,home,1,1
shot hub-brief 412,800 shot,hub,1,2,1
shot hub-phone 412,800 shot,hub,3,0
shot cam4 412,800 shot,cam,1,0,0,9
shot cam9-wide 1280,720 shot,cam,6,0,0,9
shot gate 412,800 shot,gate,4,1,0,3
shot gate-land 800,360 shot,gate,2,0,0,3
shot forge 412,800 shot,forge,4,2,0,1
shot forge-land 800,360 shot,forge,2,0,0,1
shot tinker 412,800 shot,tinker,3,0,2,1
shot raid 1280,720 shot,raid,5,0,0,7
shot badge 412,800 shot,badge,8,0,1,2
ls -la /tmp/nw-shots
