#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the alias name from the script filename
const aliasName = path.basename(__filename, '.js');

// Path to the main CLI (adjust path based on location)
const cliPath = path.join(__dirname, '..', '..', 'docker-cli.js');

// Forward all arguments to the main CLI with the alias name
const args = [cliPath, aliasName, ...process.argv.slice(2)];

const child = spawn('node', args, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
