import { execSync } from "child_process";
import path from "path";

function getStagedFiles() {
  try {
    return execSync("git diff --cached --name-only --diff-filter=ACMRT", {
      encoding: "utf8"
    })
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch (e) {
    console.error("Failed to get staged files");
    process.exit(1);
  }
}

function getFileContent(gitRef, filePath) {
  try {
    // If checking HEAD and file doesn't exist (new file), return null
    if (gitRef === "HEAD") {
      try {
        return execSync(`git show HEAD:"${filePath}"`, {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "ignore"]
        });
      } catch (e) {
        return null;
      }
    }
    // For staged files (using :path syntax)
    return execSync(`git show :"${filePath}"`, { encoding: "utf8" });
  } catch (e) {
    throw new Error(`Failed to read ${filePath} from ${gitRef}`);
  }
}

function checkChangelog() {
  const stagedFiles = getStagedFiles();
  const packageJsonFiles = stagedFiles.filter(f => f.endsWith("package.json"));

  if (packageJsonFiles.length === 0) {
    return;
  }

  let errorCount = 0;

  for (const pkgFile of packageJsonFiles) {
    try {
      const stagedContent = getFileContent("", pkgFile);
      const headContent = getFileContent("HEAD", pkgFile);

      if (!stagedContent) continue; // Should fail? If staged file is empty?

      const stagedJson = JSON.parse(stagedContent);
      const headJson = headContent ? JSON.parse(headContent) : {};

      const newVersion = stagedJson.version;
      const oldVersion = headJson.version;

      if (newVersion && newVersion !== oldVersion) {
        console.info(
          `Detected version change in ${pkgFile}: ${oldVersion} -> ${newVersion}`
        );

        const pkgDir = path.dirname(pkgFile);
        const changelogFile = path.join(pkgDir, "CHANGELOG.md");
        const expectedHeader = `## ${newVersion}`;
        // Check if changelog is staged
        if (!stagedFiles.includes(changelogFile)) {
          // Handle case where CHANGELOG might be at root for single repo, but this looks like a monorepo
          // prompting user said "packages/pkgname/changelog.md".
          console.error(
            `ERROR: Version bumped for ${stagedJson.name || pkgFile} but ${changelogFile} is not staged. Please add a changelog entry like ${expectedHeader} to ${changelogFile}`
          );
          errorCount++;
          continue;
        }

        // Read staged content of changelog
        const changelogContent = getFileContent("", changelogFile);
        // Look for "## <newVersion>" or similar.
        // The example changelog showed: "## 0.1.0 (2023-05-30)"
        // So we look for "## <newVersion>"

        if (!changelogContent.includes(expectedHeader)) {
          console.error(
            `ERROR: ${changelogFile} does not contain an entry for version ${newVersion}`
          );
          console.error(`Expected header to start with: "${expectedHeader}"`);
          errorCount++;
        } else {
          console.info(
            `✅ Verified changelog entry for ${newVersion} in ${changelogFile}`
          );
        }
      }
    } catch (err) {
      console.error(`Error processing ${pkgFile}:`, err.message);
      errorCount++;
    }
  }

  if (errorCount > 0) {
    console.error(`\nFound ${errorCount} error(s). Commit aborted.`);
    process.exit(1);
  }
}

checkChangelog();
