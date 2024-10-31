import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const pathToImportMap = process.cwd() + "/import-map.json";
const importMap = !existsSync(pathToImportMap)
  ? { imports: {} }
  : JSON.parse(await readFile(pathToImportMap, "utf-8"));

const { imports } = importMap;
const importKeys = Object.keys(imports);

// import x from 'https://...'
export function load(url, _context, nextLoad) {
  if (!url.startsWith("https://")) {
    return nextLoad(url);
  }

  return new Promise((resolve, reject) => resolveFromUrl(url, resolve, reject));
}

// import-map.json
export async function resolve(specifier, context, nextResolve) {
  if (importKeys.length) {
    if (Object.hasOwn(imports, specifier)) {
      return nextResolve(imports[specifier], context);
    }

    for (const next of importKeys) {
      if (specifier.startsWith(next)) {
        return nextResolve(specifier.replace(next, imports[next]));
      }
    }
  }

  return nextResolve(specifier, context);
}

async function resolveFromUrl(url, resolve, reject) {
  try {
    const req = await fetch(url);

    if (!req.ok) {
      return reject(`${url}: ${req.statusText}`);
    }

    const data = await req.text();

    resolve({
      format: "module",
      shortCircuit: true,
      source: data,
    });
  } catch (e) {
    reject(e);
  }
}
