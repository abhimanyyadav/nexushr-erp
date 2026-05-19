const { execSync } = require("child_process");
const path = require("path");

function runCommand(command, dir) {
  console.log(`\n👉 Running: "${command}" inside ${dir || "root"}`);
  try {
    execSync(command, {
      cwd: dir ? path.join(__dirname, dir) : __dirname,
      stdio: "inherit",
    });
  } catch (error) {
    console.error(`❌ Command failed: "${command}"`);
    process.exit(1);
  }
}

// 1. Install root dependencies
runCommand("npm install --include=dev");

// 2. Install client dependencies
runCommand("npm install --include=dev", "client/client");

// 3. Build client
runCommand("npm run build", "client/client");

// 4. Install server dependencies
runCommand("npm install", "server");

console.log("\n✅ Full monorepo build completed successfully!");
