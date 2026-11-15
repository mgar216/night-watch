#!/bin/sh
# Inline all sources into one self-contained index.html (no external requests).
# Shared with The Night Watch, so both games keep one look, the same characters and one music box:
# the base stylesheet, the page body, the music (../src/33-music.js), the art helpers (../src/40-art.js) and the
# characters (../src/45-chars.js).
# Usage: ./build.sh [output.html [extra.js]]   (extra.js is only used by the tests)
cd "$(dirname "$0")" || exit 1
out=${1:-index.html}
{
  cat src/a-head.html ../src/style.css src/style.css ../src/b-body.html src/[12]*.js ../src/33-music.js ../src/40-art.js ../src/45-chars.js src/[3-9]*.js $2
  printf '})();\n</script>\n</body>\n</html>\n'
} > "$out"
wc -c "$out"
