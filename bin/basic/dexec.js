#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the alias name from the script filename
const aliasName = path.basename(__filename, '.js');

// Path to the main CLI (adjust path based on location)
const cliPath = path.join(__dirname, '..', '..', 'docker-cli.js');


const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  const helpPath = path.join(__dirname, '..', '..', 'help', 'basic', 'docker-exec.json');
  if (fs.existsSync(helpPath)) {
    const helpContent = JSON.parse(fs.readFileSync(helpPath, 'utf8'));
    console.log(`\n🔧 ${helpContent.name.toUpperCase()}${helpContent.aliases ? ` (${helpContent.aliases.join(', ')})` : ''}\n`);
    console.log(`📋 Category: ${helpContent.category}`);
    console.log(`📖 Description: ${helpContent.description}`);
    console.log(`📝 Usage: ${helpContent.usage}\n`);
    if (helpContent.examples) helpContent.examples.forEach(e => console.log(`   ${e.command} # ${e.description}`));
    if (helpContent.options) helpContent.options.forEach(o => console.log(`   ${o.flag} - ${o.description}`));
    if (helpContent.notes) helpContent.notes.forEach(n => console.log(`   ${n}`));
  } else {
    console.log('Help not found for dexec');
  }
  process.exit(0);
}

// Forward all arguments to the main CLI with the alias name
const args = [cliPath, aliasName, ...process.argv.slice(2)];
const child = spawn('node', args, {
  stdio: 'inherit',
  cwd: process.cwd()
});
child.on('exit', (code) => {
  process.exit(code || 0);
});
