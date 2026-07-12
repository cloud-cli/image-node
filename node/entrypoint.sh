cd /home/app

set -e

[[ -f "package.json" ]] && [[ ! -d "node_modules" ]] &&  echo "Installing modules" && pnpm config set minimumReleaseAge 1440 && pnpm i

[[ ! -z "$START_COMMAND" ]] && $START_COMMAND && exit 0

[[ -f superstatic.json ]] && node /home/node/superstatic.mjs && exit 0
[[ -f Procfile ]] && pnpm dlx --yes foreman start --port $PORT && exit 0
[[ -f index.js ]] && node index.js && exit 0
[[ -f index.mjs ]] && node index.mjs && exit 0
[[ -f index.cjs ]] && node index.cjs && exit 0

if [[ -f package.json ]]; then
  main=$(node -p -e 'require("./package.json").main||""')
  start=$(node -p -e 'require("./package.json").scripts?.start||""')

  [[ ! -z "$start" ]] && npm start && exit 0
  [[ ! -z "$main" ]] && node $main && exit 0
fi

error_code=$?

if [[ ! "$error_code" == "0" ]]; then
  echo "Command failed with code $error_code";
  exit $error_code
else
  echo "No entrypoint to execute. Exiting.";
  exit 1
fi

