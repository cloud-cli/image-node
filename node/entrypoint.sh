cd /home/app

set -e

[[ ! -z "$START_COMMAND" ]] && $START_COMMAND

[[ -f superstatic.json ]] && node /home/node/superstatic.mjs
[[ -f Procfile ]] && npx --yes foreman start --port $PORT
[[ -f index.js ]] && node index.js
[[ -f index.mjs ]] && node index.mjs
[[ -f index.cjs ]] && node index.cjs

if [[ -f package.json ]]; then
  main=$(node -p -e 'require("./package.json").main||""')
  start=$(node -p -e 'require("./package.json").scripts?.start||""')

  [[ ! -z "$main" ]] && node $main
  [[ ! -z "$start" ]] && npm start
fi

error_code=$?

if [[ ! "$error_code" == "0" ]]; then
  echo "Command failed with code $error_code";
else
  echo "No entrypoint to execute. Exiting.";
fi

exit 1
