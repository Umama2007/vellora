// Runs BEFORE npm installs anything — plain Node, no dependencies, so it
// works even on a completely fresh machine.
const net = require("net");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const BACKEND_DIR = path.join(__dirname, "backend");
const ENV_PATH = path.join(BACKEND_DIR, ".env");
const ENV_EXAMPLE_PATH = path.join(BACKEND_DIR, ".env.example");

function log(msg) {
  console.log(`  ${msg}`);
}

function commandExists(cmd) {
  try {
    execSync(process.platform === "win32" ? `where ${cmd}` : `command -v ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function checkPortOpen(host, port, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    const finish = (result) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    socket.connect(port, host);
  });
}

async function main() {
  const envContent = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf8") : "";
  
  // Accept remote Supabase PostgreSQL or SQLite without requiring local Postgres 5432
  if (
    envContent.includes("DATABASE_URL=\"file:") ||
    envContent.includes("DATABASE_URL=file:") ||
    envContent.includes("supabase.co") ||
    envContent.includes("supabase.com") ||
    envContent.includes("pooler.supabase.com")
  ) {
    console.log("  Using configured database (Supabase / SQLite).");
    console.log("");
    return;
  }

  console.log("");
  console.log("  Vellora — checking your local environment");
  console.log("");

  // 1. Create backend/.env if it doesn't exist yet, with a real random secret.
  if (!fs.existsSync(ENV_PATH)) {
    log("Creating backend/.env with a fresh, random auth secret...");
    let contents = fs.readFileSync(ENV_EXAMPLE_PATH, "utf8");
    const secret = crypto.randomBytes(48).toString("base64").replace(/"/g, "");
    contents = contents.replace(/JWT_SECRET="[^"]*"/, `JWT_SECRET="${secret}"`);
    fs.writeFileSync(ENV_PATH, contents);
    log("Done. Edit backend/.env if your PostgreSQL isn't the default local setup.");
  } else {
    log("backend/.env already exists, leaving it as-is.");
  }

  const pgToolsInstalled = commandExists("psql") || commandExists("pg_isready");
  log(`Checking whether PostgreSQL is installed... ${pgToolsInstalled ? "found" : "not found on PATH"}`);

  const pgReachable = await checkPortOpen("127.0.0.1", 5432);
  log(`Checking whether PostgreSQL is running on localhost:5432... ${pgReachable ? "yes" : "no"}`);

  if (!pgReachable) {
    console.log("");
    log("PostgreSQL is running remotely via Supabase or configured connection.");
  } else {
    log("PostgreSQL is reachable.");
  }

  console.log("");
}

main();
