import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, join, basename } from "path";

// Get the project root from command line args
// Example: packages/sequence-utils
const projectRoot = process.argv[2];

if (!projectRoot) {
  console.error(
    "Please provide the project root as an argument (e.g., packages/my-lib)"
  );
  process.exit(1);
}

const workspaceRoot = process.cwd();
const possiblePaths = [
  resolve(workspaceRoot, "dist", projectRoot),
  resolve(workspaceRoot, "dist", basename(projectRoot))
];

const builtPackageJsonPath = possiblePaths
  .map(p => join(p, "package.json"))
  .find(p => existsSync(p));

if (!builtPackageJsonPath) {
  console.error(`Could not find built package.json. Checked:`);
  possiblePaths.forEach(p => console.error(` - ${join(p, "package.json")}`));
  process.exit(1);
}

try {
  const pkg = JSON.parse(readFileSync(builtPackageJsonPath, "utf-8"));
  let hasChanges = false;

  const updateDeps = deps => {
    if (!deps) return;

    for (const [name, version] of Object.entries(deps)) {
      if (version.startsWith("file:")) {
        const relativePath = version.replace("file:", "");
        // Resolve the actual path of the dependency relative to the *source* project root
        // projectRoot is like 'packages/sequence-utils'
        // relativePath is like '../range-utils'
        // resolved path should be 'packages/range-utils'
        const sourceDependencyPath = resolve(
          workspaceRoot,
          projectRoot,
          relativePath
        );
        const sourceDependencyPkgPath = join(
          sourceDependencyPath,
          "package.json"
        );

        if (existsSync(sourceDependencyPkgPath)) {
          const depPkg = JSON.parse(
            readFileSync(sourceDependencyPkgPath, "utf-8")
          );
          console.info(`Updating ${name} from ${version} to ${depPkg.version}`);
          deps[name] = depPkg.version;
          hasChanges = true;
        } else {
          console.warn(
            `Warning: Could not find package.json for dependency ${name} at ${sourceDependencyPkgPath}`
          );
        }
      }
    }
  };

  if (pkg.dependencies) updateDeps(pkg.dependencies);
  if (pkg.peerDependencies) updateDeps(pkg.peerDependencies);
  // usually devDependencies are not in the built package.json, but just in case
  // if (pkg.devDependencies) updateDeps(pkg.devDependencies);

  if (hasChanges) {
    writeFileSync(builtPackageJsonPath, JSON.stringify(pkg, null, 2) + "\n");
    console.info(
      `Successfully updated dependencies in ${builtPackageJsonPath}`
    );
  } else {
    console.info(
      `No 'file:' dependencies found to update in ${builtPackageJsonPath}`
    );
  }
} catch (err) {
  console.error("Error updating package dependencies:", err);
  process.exit(1);
}
