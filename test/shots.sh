#!/bin/sh
# Pose game screens in headless Firefox and save screenshots to /tmp/nw-shots (visual check).
# Hash format: shot,<scene>,<night>,<lang 0-2>,<1 keep dialog | 2 tinker hand>,<seconds to simulate>,<pose>
# Poses are listed at the top of test/driver.js. One shot: ./test/shots.sh <name> <W,H> <hash>
cd "$(dirname "$0")/.." || exit 1
./build.sh /tmp/nw-shot.html test/driver.js >/dev/null
mkdir -p /tmp/nw-shots
shot() {
  p=$(mktemp -d)
  timeout 60 firefox --headless --no-remote --profile "$p" --window-size="$2" --screenshot "/tmp/nw-shots/$1.png" "file:///tmp/nw-shot.html#$3" >/dev/null 2>&1
  rm -rf "$p"
}
if [ -n "$1" ]; then shot "$1" "$2" "$3"; exit; fi
shot home-phone 412,800 shot,home,1,0
shot home-small-ru 360,640 shot,home,1,1
shot home-wide 1280,720 shot,home,1,2
shot hub-brief 412,800 shot,hub,4,2,1
shot cam4-nest 412,800 shot,cam,1,0,0,9,stolen
shot cam9-low 800,360 shot,cam,6,1,0,6
shot cam-win 360,640 shot,cam,1,2,0,2,win
shot gate-costume 360,640 shot,gate,5,1,0,3,costume
shot gate-cut 360,640 shot,gate,2,0,0,3,cut
shot gate-low 800,360 shot,gate,4,2,0,3
shot forge-oldest 360,640 shot,forge,7,1,0,1,oldest
shot forge-win-low 800,360 shot,forge,2,1,0,1,win
shot tinker 412,800 shot,tinker,3,0,2,1
shot tinker-low 800,360 shot,tinker,5,2,2,1
shot raid-wide 1280,720 shot,raid,5,0,0,7
shot raid-small 360,640 shot,raid,5,0,0,7
shot badge 412,800 shot,badge,3,0,1,2
shot finale-small 360,640 shot,badge,8,2,1,2
shot finale-wide 1280,720 shot,badge,8,0,1,2
ls -la /tmp/nw-shots
