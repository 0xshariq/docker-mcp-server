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
    const helpFilePath = path.join(__dirname, '..', '..', 'help', 'advanced', 'docker-publish.json');
    const helpContent = JSON.parse(fs.readFileSync(helpFilePath, 'utf8'));
    
    console.log(`\n${helpContent.name} - ${helpContent.description}\n`);
    console.log(`Usage: ${helpContent.usage}\n`);
    
    console.log('Examples:');
    helpContent.examples.forEach(example => {
      console.log(`  ${example.command.padEnd(60)} # ${example.description}`);
    });
    
    console.log('\nOptions:');
    helpContent.options.forEach(option => {
      console.log(`  ${option.flag.padEnd(35)} ${option.description}`);
    });
    
    console.log('\nRegistry Examples:');
    helpContent.registry_examples.forEach(example => {
      console.log(`  ${example}`);
    });
    
    console.log('\nPublishing Workflow:');
    helpContent.publishing_workflow.forEach(step => {
      console.log(`  ${step}`);
    });
    
    if (helpContent.security_features) {
      console.log('\nSecurity Features:');
      helpContent.security_features.forEach(feature => {
        console.log(`  ${feature}`);
      });
    }
    
    if (helpContent.best_practices) {
      console.log('\nBest Practices:');
      helpContent.best_practices.forEach(practice => {
        console.log(`  ${practice}`);
      });
    }
    
    if (helpContent.notes) {
      console.log('\nNotes:');
      helpContent.notes.forEach(note => {
        console.log(`  ${note}`);
      });
    }
    
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
  cwd: process.cwd()
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
