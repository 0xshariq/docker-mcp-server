#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Docker MCP Helper - Shared utility for all bin scripts
 * 
 * This helper provides common functionality for executing Docker MCP operations
 * from individual bin scripts.
 */

class DockerMCPHelper {
  constructor() {
    // Path to the compiled MCP server
    this.serverPath = path.join(__dirname, '..', 'dist', 'index.js');
  }

  async callTool(toolName, args = {}) {
    return new Promise((resolve, reject) => {
      const message = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: { name: toolName, arguments: args }
      };

      const child = spawn('node', [this.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      child.on('close', (code) => {
        if (errorOutput) {
          console.error('❌ Error:', errorOutput);
        }

        try {
          const response = JSON.parse(output);
          if (response.result && response.result.content && response.result.content[0]) {
            const contentText = response.result.content[0].text;
            
            try {
              const contentObj = JSON.parse(contentText);
              if (contentObj.content && contentObj.content[0]) {
                console.log(contentObj.content[0].text);
                resolve(contentObj.content[0].text);
              } else if (contentObj.success === false) {
                console.error('❌ Operation failed:', contentObj.message);
                reject(new Error(contentObj.message));
              } else {
                console.log(contentText);
                resolve(contentText);
              }
            } catch (parseError) {
              console.log(contentText);
              resolve(contentText);
            }
          } else if (response.error) {
            console.error('❌ MCP Error:', response.error.message);
            reject(new Error(response.error.message));
          } else {
            console.error('❌ Unexpected response format');
            reject(new Error('Unexpected response format'));
          }
        } catch (parseError) {
          console.error('❌ Parse error:', parseError.message);
          reject(parseError);
        }
      });

      child.on('error', (error) => {
        console.error('❌ Spawn error:', error.message);
        reject(error);
      });

      child.stdin.write(JSON.stringify(message) + '\n');
      child.stdin.end();
    });
  }
}

export { DockerMCPHelper };
