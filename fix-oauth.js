const fs = require('fs');
const path = require('path');

// Read current .env.local
const envPath = path.join(__dirname, '.env.local');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('Creating new .env.local file...');
}

// Update NEXTAUTH_URL to use port 3000
const lines = envContent.split('\n');
let updated = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('NEXTAUTH_URL=')) {
    lines[i] = 'NEXTAUTH_URL="http://localhost:3000"';
    updated = true;
    break;
  }
}

if (!updated) {
  lines.push('NEXTAUTH_URL="http://localhost:3000"');
}

// Write back to file
fs.writeFileSync(envPath, lines.join('\n'));
console.log('✅ Updated NEXTAUTH_URL to http://localhost:3000');
console.log('🔄 Now restart your dev server on port 3000');
