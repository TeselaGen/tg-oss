/**
 * This is a minimal script to publish your package to "npm".
 * This is meant to be used as-is or customize as you see fit.
 *
 * This script is executed on "dist/path/to/library" as "cwd" by default.
 *
 * You might need to authenticate with NPM before running this script.
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import chalk from "chalk";
import devkit from "@nx/devkit";
import path from "path";

const { readCachedProjectGraph } = devkit;

function invariant(condition, message) {
  if (!condition) {
    console.error(chalk.bold.red(message));
    process.exit(1);
  }
}

// Executing publish script: node path/to/publish.mjs {name} --tag {tag}
// tag by default is "next". Manually set to beta for beta versions or latest for stable versions.
// Default "tag" to "next" so we won't publish the "latest" tag by accident.
let [, , name, tag = "next"] = process.argv;

execSync(`git pull`);
execSync(`yarn auto-changelog -p`);
// Get all internal dependencies to write them to the package.json in the dist folder
execSync(`yarn nx graph --file=output.json`);
const r = readFileSync(`output.json`).toString();
const simpleGraph = JSON.parse(r).graph;

const deps = {};
const getDeps = name => {
  simpleGraph.dependencies[name].forEach(({ target }) => {
    console.log(`target:`, target);
    if (target === "shared-demo") return; //we don't actually need to rely on this since it is only used for the demo pages
    const key = `@teselagen/${target}`;
    if (!deps[key]) {
      const p = readFileSync(`./packages/${target}/package.json`).toString();
      deps[key] = JSON.parse(p).version;
      getDeps(target);
    }
  });
};
getDeps(name);

// A simple SemVer validation to validate the version
const validVersion = /^\d+\.\d+\.\d+(-\w+\.\d+)?/;

const graph = readCachedProjectGraph();
const project = graph.nodes[name];

invariant(
  project,
  `Could not find project "${name}" in the workspace. Is the project.json configured correctly?`
);
// const outputPath = project.data?.targets?.build?.options?.outputPath;
const packagePath = project.data?.root;

process.chdir(packagePath);
let json = JSON.parse(readFileSync(`package.json`).toString());
let version = json.version;

if (version.includes("-beta")) {
  // If its not a beta version, remove beta version (version was already bumped when creating beta version)
  if (tag !== "beta") {
    const versionParts = version.split("-beta");
    version = versionParts[0];
  } else {
    // Bump beta version only
    const versionParts = version.split(".");
    versionParts[3] = Number(versionParts[3]) + 1; // increase beta version
    version = versionParts.join(".");
  }
} else {
  // Update the version
  const versionParts = version.split(".");
  versionParts[2] = Number(versionParts[2]) + 1; // increase patch version
  version = versionParts.join(".");

  // If its beta, add beta version
  if (tag === "beta") {
    version = `${version}-beta.1`;
  }
}

// Updating the version in "package.json" before publishing
try {
  json.version = version;
  writeFileSync(`package.json`, JSON.stringify(json, null, 2));
} catch (e) {
  console.error(
    chalk.bold.red(`Error writing package.json file from library build output.`)
  );
}
process.chdir(path.resolve(`../../dist/${name}`));
json = JSON.parse(readFileSync(`package.json`).toString());
try {
  json.version = version;
  // json.type = "commonjs";
  delete json.type;
  json.license = "MIT";
  json.dependencies = { ...deps, ...json.dependencies };
  writeFileSync(`package.json`, JSON.stringify(json, null, 2));
} catch (e) {
  console.error(
    chalk.bold.red(`Error writing package.json file from library build output.`)
  );
}

invariant(
  version && validVersion.test(version),
  `No version provided or version did not match Semantic Versioning, expected: #.#.#-tag.# or #.#.#, got ${version}.`
);

// Execute "npm publish" to publish
execSync(
  `npm publish --access public --registry https://registry.npmjs.org/ --tag ${tag}`
);

// execSync(`git commit -am "chore: publish ${name}@${version}"`);
// execSync(`git push`);
