#!/usr/bin/env node

/**
 * Test MCP JSON Protocol
 * Verifies that MCP servers respond with clean JSON without debug output
 */

import { spawn } from 'child_process';

async function testMCPServer(serverName, serverPath) {
  return new Promise((resolve, reject) => {
    console.log(`\nTesting ${serverName}...`);
    console.log('=' .repeat(50));
    
    // Spawn the MCP server
    const server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    let jsonFound = false;
    
    // Set a timeout
    const timeout = setTimeout(() => {
      server.kill();
      resolve({
        server: serverName,
        success: false,
        error: 'Timeout - no response within 2 seconds'
      });
    }, 2000);
    
    // Capture stdout
    server.stdout.on('data', (data) => {
      stdout += data.toString();
      
      // Check if we have a complete JSON response
      try {
        // MCP servers output JSON-RPC messages
        const lines = stdout.split('\n');
        for (const line of lines) {
          if (line.trim() && line.startsWith('{')) {
            const parsed = JSON.parse(line);
            if (parsed.jsonrpc === '2.0') {
              jsonFound = true;
              clearTimeout(timeout);
              server.kill();
              
              // Check for debug output before JSON
              const beforeJson = stdout.substring(0, stdout.indexOf('{'));
              if (beforeJson.trim()) {
                resolve({
                  server: serverName,
                  success: false,
                  error: `Debug output detected before JSON: "${beforeJson.trim()}"`
                });
              } else {
                resolve({
                  server: serverName,
                  success: true,
                  message: 'Clean JSON protocol detected'
                });
              }
            }
          }
        }
      } catch (e) {
        // Not valid JSON yet, keep collecting
      }
    });
    
    // Capture stderr
    server.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    // Send initialize request per MCP protocol
    const initRequest = JSON.stringify({
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '0.1.0',
        capabilities: {}
      },
      id: 1
    }) + '\n';
    
    server.stdin.write(initRequest);
    
    server.on('error', (error) => {
      clearTimeout(timeout);
      resolve({
        server: serverName,
        success: false,
        error: error.message
      });
    });
    
    server.on('exit', (code) => {
      clearTimeout(timeout);
      if (!jsonFound) {
        resolve({
          server: serverName,
          success: false,
          error: stderr || 'Server exited without JSON response'
        });
      }
    });
  });
}

async function main() {
  console.log('MCP JSON Protocol Test');
  console.log('Testing that servers output clean JSON without debug messages');
  console.log('=' .repeat(60));
  
  const servers = [
    { name: 'verodat-design', path: './build/src/design.js' },
    { name: 'verodat-manage', path: './build/src/manage.js' },
    { name: 'verodat-consume', path: './build/src/consume.js' }
  ];
  
  const results = [];
  
  for (const server of servers) {
    const result = await testMCPServer(server.name, server.path);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.server}: ${result.message}`);
    } else {
      console.log(`❌ ${result.server}: ${result.error}`);
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('TEST SUMMARY');
  console.log('=' .repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All MCP servers are outputting clean JSON!');
    console.log('Claude should now be able to connect without errors.');
  } else {
    console.log('\n⚠️  Some servers still have issues with JSON output.');
    console.log('Please check the error messages above.');
  }
  
  process.exit(passed === total ? 0 : 1);
}

main().catch(console.error);
