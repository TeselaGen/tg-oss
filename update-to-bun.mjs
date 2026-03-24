import fs from "fs";
import { execSync } from "child_process";

const filesCmd =
  'find . -name "package.json" -o -name "project.json" | grep -v node_modules | grep -v "\.git"';
const files = execSync(filesCmd).toString().trim().split("\n").filter(Boolean);

let updatedFiles = 0;

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  let content = original;

  // Global simple replacements
  content = content.replace(/"yarn":/g, '"bun":');
  content = content.replace(/yarn nx/g, "bun nx");
  content = content.replace(/yarn build/g, "bun run build");
  content = content.replace(/yarn install/g, "bun install");
  content = content.replace(/yarn test/g, "bun test");
  content = content.replace(/yarn vite/g, "bun run vite");
  content = content.replace(/yarn gh-pages/g, "bunx gh-pages");

  // Specific catch-all for remaining yarn scripts
  content = content.replace(/ yarn /g, " bun run ");
  content = content.replace(/"yarn /g, '"bun run ');
  content = content.replace(/'yarn /g, "'bun run ");

  // Fix any "bun run install" and "bun run nx" mistakes
  content = content.replace(/bun run install/g, "bun install");
  content = content.replace(/bun run nx/g, "bun nx");

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    updatedFiles++;
    console.log(`Updated: ${file}`);
  }
}

console.log(`Successfully updated ${updatedFiles} files.`);
