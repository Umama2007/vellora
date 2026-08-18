const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../../setup-check.cjs');
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('Using local SQLite database')) {
    content = content.replace(
      'async function main() {',
      'async function main() {\n  const envContent = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf8") : "";\n  if (envContent.includes("DATABASE_URL=\\"file:") || envContent.includes("DATABASE_URL=file:")) {\n    console.log("  Using local SQLite database.");\n    console.log("");\n    return;\n  }'
    );
    fs.writeFileSync(file, content);
    console.log('Successfully updated setup-check.cjs');
  }
}
