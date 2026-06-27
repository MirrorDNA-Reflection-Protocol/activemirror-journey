import { existsSync, readFileSync } from "node:fs";

const failures = [];

function read(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

if (existsSync("CNAME")) {
  failures.push("Product source repo must not contain CNAME. Live domain belongs to active-mirror-site deploy repo.");
}

const deployWorkflow = read(".github/workflows/deploy.yml");
const forbiddenDeployMarkers = [
  /actions-gh-pages/i,
  /deploy-pages/i,
  /upload-pages-artifact/i,
  /\bcname\s*:/i,
];

for (const marker of forbiddenDeployMarkers) {
  if (marker.test(deployWorkflow)) {
    failures.push(`Product source workflow contains live deploy marker: ${marker}`);
  }
}

const packageJson = JSON.parse(read("package.json") || "{}");
if (!String(packageJson.scripts?.deploy || "").includes("Direct deploy is disabled")) {
  failures.push("package.json deploy script must stay disabled in the product source repo.");
}

const readme = read("README.md");
for (const required of [
  "Canonical product repo",
  "/Users/mirror-pro/repos/active-mirror-site",
  "does not deploy directly",
]) {
  if (!readme.includes(required)) {
    failures.push(`README.md is missing canonical source/deploy wording: ${required}`);
  }
}

if (failures.length) {
  console.error("Canonical source guard failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Canonical source guard passed.");
