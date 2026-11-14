#!/bin/sh
# Inline all sources into one self-contained index.html (no external requests).
# Usage: ./build.sh [output.html [extra.js]]   (extra.js is only used by the smoke test)
cd "$(dirname "$0")" || exit 1
out=${1:-index.html}
{
  cat src/a-head.html src/style.css src/b-body.html src/[0-9]*.js $2
  printf '})();\n</script>\n</body>\n</html>\n'
} > "$out"
wc -c "$out"
