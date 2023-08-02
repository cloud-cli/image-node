import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const restartInterval = Number(process.env.RESTART_INTERVAL || 2000);
const options = {
  stdio: "pipe",
  cwd: process.cwd(),
  env: process.env,
};

const { command, args } = getCommand();
console.log(command, args.join(" "));

if (!command) {
  process.exit(1);
}

let restarting = false;
function restart(code) {
  if (restarting) return;

  restarting = true;

  if (code) {
    console.log(`Process exited with code ${code}. Restarting`);
  }

  setTimeout(start, restartInterval);
}

function start() {
  restarting = false;

  const shell = spawn(command, args, options);
  const log = (buffer) => console.log(buffer.toString("utf8"));

  shell.stdout.on("data", log);
  shell.stderr.on("data", log);
  shell.on("close", restart);
  shell.on("exit", restart);
  shell.on("error", (error) => {
    console.error(error);
    restart(1);
  });
}

function getCommand() {
  const packageJson = join(process.cwd(), "package.json");
  const staticsJson = join(process.cwd(), "superstatic.json");

  if (existsSync(staticsJson)) {
    return {
      command: "node",
      args: ["/home/node/superstatic.mjs"],
    };
  }

  if (existsSync(packageJson)) {
    const manifest = JSON.parse(readFileSync(packageJson, "utf8"));
    if (manifest.scripts && manifest.scripts.start) {
      return { command: "npm", args: ["start"] };
    }

    if (manifest.main) {
      return { command: "node", args: [manifest.main] };
    }
  }

  const indexFiles = ["index.js", "index.mjs", "index.cjs"];
  for (const file of indexFiles) {
    if (existsSync(join(process.cwd(), file))) {
      return { command: "node", args: [file] };
    }
  }

  return { command: "", args: [] };
}

start();
