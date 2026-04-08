#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Sync backend/packages/shared -> frontend/packages/shared.
 * - Copies missing/changed files.
 * - Removes stale files from target.
 */
export function syncSharedDirs(sourceDir, targetDir) {
  if (!existsSync(sourceDir)) {
    throw new Error(`Shared source not found: ${sourceDir}`);
  }
  mkdirSync(targetDir, { recursive: true });

  const sourceMap = buildFileMap(sourceDir);
  const targetMap = buildFileMap(targetDir);

  const copied = [];
  const removed = [];

  for (const [rel, srcAbs] of sourceMap.entries()) {
    const dstAbs = path.join(targetDir, rel);
    const dstExists = existsSync(dstAbs);
    const shouldCopy = !dstExists || readFileSync(srcAbs).equals(readFileSync(dstAbs)) === false;
    if (shouldCopy) {
      mkdirSync(path.dirname(dstAbs), { recursive: true });
      cpSync(srcAbs, dstAbs);
      copied.push(rel);
    }
  }

  for (const rel of targetMap.keys()) {
    if (!sourceMap.has(rel)) {
      rmSync(path.join(targetDir, rel), { force: true });
      removed.push(rel);
    }
  }

  return { copied, removed };
}

function buildFileMap(rootDir) {
  const map = new Map();
  walk(rootDir, rootDir, map);
  return map;
}

function walk(baseDir, currentDir, map) {
  for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
    const abs = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      walk(baseDir, abs, map);
      continue;
    }
    if (!entry.isFile()) continue;
    const rel = path.relative(baseDir, abs).split(path.sep).join('/');
    map.set(rel, abs);
  }
}

function defaultPaths() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const frontendDir = path.resolve(scriptDir, '..');
  const repoRoot = path.resolve(frontendDir, '..');
  const source = path.join(repoRoot, 'backend', 'packages', 'shared');
  const target = path.join(frontendDir, 'packages', 'shared');
  return { source, target };
}

function main() {
  const { source, target } = defaultPaths();
  const result = syncSharedDirs(source, target);
  const total = result.copied.length + result.removed.length;
  if (total === 0) {
    console.log('shared sync: already up to date');
    return;
  }
  console.log(`shared sync: copied ${result.copied.length}, removed ${result.removed.length}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
