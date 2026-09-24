import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const pathToImportMap = process.cwd() + "/import-map.json";
const importMap = !existsSync(pathToImportMap)
  ? { imports: {} }
  : JSON.parse(await readFile(pathToImportMap, "utf-8"));

const { imports } = importMap;
const importKeys = Object.keys(imports);

export async function load(url, context, nextLoad) {
  if (!url.startsWith("https://")) {
    return nextLoad(url, context);
  }

  try {
    const req = await fetch(url);

    if (!req.ok) {
      throw new Error(`${url}: ${req.statusText}`);
    }

    const data = await req.text();

    return {
      format: "module",
      shortCircuit: true,
      source: data,
    };
  } catch (e) {
    throw e;
  }
}

export async function resolve(specifier, context, nextResolve) {
  let targetSpecifier = specifier;

  // Handle import-map translation
  if (importKeys.length) {
    if (Object.hasOwn(imports, specifier)) {
      targetSpecifier = imports[specifier];
    } else {
      for (const next of importKeys) {
        if (specifier.startsWith(next)) {
          targetSpecifier = specifier.replace(next, imports[next]);
          break;
        }
      }
    }
  }

  if (targetSpecifier.startsWith("https://")) {
    return {
      shortCircuit: true,
      url: targetSpecifier,
    };
  }

  return nextResolve(targetSpecifier, context);
}
