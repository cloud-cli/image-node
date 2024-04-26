cd /home/app

[[ -f superstatic.json ]] && node /home/node/superstatic.mjs
[[ -f Procfile ]] && npx --yes foreman start --port $PORT
[[ -f index.js ]] && node index.js
[[ -f index.mjs ]] && node index.mjs
[[ -f index.cjs ]] && node index.cjs

if [[ -f package.json ]]; then
  main=$(node -p -e 'require("./package.json").main||""')
  start=$(node -p -e 'require("./package.json").scripts?.start||""')
  [[ -z "$main" ]] || node $main
  [[ -z "$start" ]] || npm $start
fi

echo "No entrypoint to execute. Exiting."
exit 1