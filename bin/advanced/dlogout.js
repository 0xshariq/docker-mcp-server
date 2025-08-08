#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if help is requested
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  try {
    const helpFilePath = path.join(__dirname, '..', '..', 'help', 'advanced', 'docker-login.json');
    const helpContent = JSON.parse(fs.readFileSync(helpFilePath, 'utf8'));
    
    console.log(`\ndocker-logout - Logout from Docker registry\n`);
    console.log(`Usage: docker-logout [server]\n`);
    
    console.log('Examples:');
    console.log(`  dlogout                                  # Logout from Docker Hub`);
    console.log(`  dlogout registry.example.com             # Logout from custom registry`);
    console.log(`  dlogout --help                           # Show this help message`);
    
    console.log('\nOptions:');
    console.log(`  -h, --help                       Show this help message`);
    
    console.log('\nNotes:');
    console.log(`  💡 Removes stored credentials for the specified registry`);
    console.log(`  🔧 Use without server to logout from Docker Hub`);
    console.log(`  🔒 Credentials are removed from ~/.docker/config.json`);
    
    process.exit(0);
  } catch (error) {
    console.error('Help file not found or invalid:', error.message);
    process.exit(1);
  }
}

// Get the alias name from the script filename
const aliasName = path.basename(__filename, '.js');

// Path to the main CLI (adjust path based on location)
const cliPath = path.join(__dirname, '..', '..', 'docker-cli.js');

// Forward all arguments to the main CLI with the alias name
const forwardArgs = [cliPath, aliasName, ...args];

const child = spawn('node', forwardArgs, {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

child.on('close', (code) => {
  process.exit(code);
});
