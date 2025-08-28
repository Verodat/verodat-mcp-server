import { execSync } from 'child_process';

console.log('Testing Three-Tier PoP Enforcement');
console.log('=====================================\n');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

function testOperation(server, operation, args, expectedBehavior) {
  const command = `node build/src/${server}.js call ${operation} '${JSON.stringify(args)}'`;
  
  try {
    console.log(`${colors.blue}Testing ${server.toUpperCase()} server: ${operation}${colors.reset}`);
    const result = execSync(command, { encoding: 'utf8' });
    
    if (expectedBehavior === 'ALLOW') {
      console.log(`${colors.green}✓ Operation allowed without procedure (as expected)${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ Operation allowed but should require procedure${colors.reset}`);
      return false;
    }
  } catch (error) {
    const errorMessage = error.message || '';
    
    if (expectedBehavior === 'BLOCK' && errorMessage.includes('PROCEDURE_REQUIRED')) {
      console.log(`${colors.green}✓ Operation correctly blocked - procedure required${colors.reset}`);
      return true;
    } else if (expectedBehavior === 'ALLOW') {
      console.log(`${colors.red}✗ Operation blocked but should be allowed${colors.reset}`);
      return false;
    } else {
      console.log(`${colors.red}✗ Unexpected error: ${error.message}${colors.reset}`);
      return false;
    }
  }
}

// Test configuration
const testConfig = {
  accountId: 130,
  workspaceId: 238
};

let totalTests = 0;
let passedTests = 0;

console.log('==================================================');
console.log('1. DESIGN SERVER - No PoP Enforcement');
console.log('==================================================\n');

// Design server should allow all operations without procedures
const designTests = [
  { op: 'get-datasets', type: 'READ' },
  { op: 'execute-ai-query', type: 'WRITE' },
  { op: 'create-dataset', type: 'WRITE' },
  { op: 'upload-dataset-rows', type: 'WRITE' }
];

console.log('Design server should allow ALL operations without procedures:\n');

for (const test of designTests) {
  let args = { ...testConfig };
  
  if (test.op === 'get-datasets') {
    args.filter = 'vscope=DRAFT and vstate=ACTIVE';
  } else if (test.op === 'execute-ai-query') {
    args.query = 'SELECT COUNT(*) FROM datasets';
  } else if (test.op === 'create-dataset') {
    args.name = 'Test_Dataset_' + Date.now();
    args.targetFields = [{ name: 'id', type: 'string', mandatory: true }];
  } else if (test.op === 'upload-dataset-rows') {
    args.datasetId = 5568; // Core_RAIDA
    args.data = [
      { header: [{ name: 'test_field', type: 'string' }] },
      { rows: [['test_value']] }
    ];
  }
  
  totalTests++;
  if (testOperation('design', test.op, args, 'ALLOW')) {
    passedTests++;
  }
  console.log(`   ${test.type} operation: ${test.op}\n`);
}

console.log('\n==================================================');
console.log('2. MANAGE SERVER - PoP on WRITE Operations');
console.log('==================================================\n');

const manageTests = [
  { op: 'get-datasets', type: 'READ', expect: 'ALLOW' },
  { op: 'get-dataset-output', type: 'READ', expect: 'ALLOW' },
  { op: 'execute-ai-query', type: 'WRITE', expect: 'BLOCK' },
  { op: 'create-dataset', type: 'WRITE', expect: 'BLOCK' },
  { op: 'upload-dataset-rows', type: 'WRITE', expect: 'BLOCK' }
];

console.log('Manage server should allow READ but block WRITE without procedures:\n');

for (const test of manageTests) {
  let args = { ...testConfig };
  
  if (test.op === 'get-datasets') {
    args.filter = 'vstate=ACTIVE';
  } else if (test.op === 'get-dataset-output') {
    args.datasetId = 5568;
    args.filter = 'vstate=ACTIVE';
  } else if (test.op === 'execute-ai-query') {
    args.query = 'SELECT COUNT(*) FROM datasets';
  } else if (test.op === 'create-dataset') {
    args.name = 'Test_Dataset_' + Date.now();
    args.targetFields = [{ name: 'id', type: 'string', mandatory: true }];
  } else if (test.op === 'upload-dataset-rows') {
    args.datasetId = 5568;
    args.data = [
      { header: [{ name: 'test_field', type: 'string' }] },
      { rows: [['test_value']] }
    ];
  }
  
  totalTests++;
  if (testOperation('manage', test.op, args, test.expect)) {
    passedTests++;
  }
  console.log(`   ${test.type} operation (${test.expect}): ${test.op}\n`);
}

console.log('\n==================================================');
console.log('3. CONSUME SERVER - PoP on WRITE Operations');
console.log('==================================================\n');

const consumeTests = [
  { op: 'get-datasets', type: 'READ', expect: 'ALLOW' },
  { op: 'get-dataset-output', type: 'READ', expect: 'ALLOW' },
  { op: 'get-ai-context', type: 'READ', expect: 'ALLOW' },
  { op: 'execute-ai-query', type: 'WRITE', expect: 'BLOCK' }
];

console.log('Consume server should allow READ but block WRITE (execute-ai-query) without procedures:\n');

for (const test of consumeTests) {
  let args = { ...testConfig };
  
  if (test.op === 'get-datasets') {
    args.filter = 'vscope=PUBLISHED and vstate=ACTIVE';
  } else if (test.op === 'get-dataset-output') {
    args.datasetId = 5568;
    args.filter = 'vscope=PUBLISHED and vstate=ACTIVE';
  } else if (test.op === 'get-ai-context') {
    // No additional args needed
  } else if (test.op === 'execute-ai-query') {
    args.query = 'UPDATE datasets SET name = "Modified" WHERE id = 1';
  }
  
  totalTests++;
  if (testOperation('consume', test.op, args, test.expect)) {
    passedTests++;
  }
  console.log(`   ${test.type} operation (${test.expect}): ${test.op}\n`);
}

console.log('\n==================================================');
console.log('TEST SUMMARY');
console.log('==================================================\n');

const successRate = Math.round((passedTests / totalTests) * 100);
const statusColor = successRate === 100 ? colors.green : successRate >= 70 ? colors.yellow : colors.red;

console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${colors.green}${passedTests}${colors.reset}`);
console.log(`Failed: ${colors.red}${totalTests - passedTests}${colors.reset}`);
console.log(`Success Rate: ${statusColor}${successRate}%${colors.reset}\n`);

if (successRate === 100) {
  console.log(`${colors.green}🎉 All tests passed! Three-tier PoP enforcement is working correctly.${colors.reset}`);
} else {
  console.log(`${colors.yellow}⚠️  Some tests failed. Review the implementation.${colors.reset}`);
}

console.log('\n==================================================');
console.log('KEY INSIGHTS');
console.log('==================================================\n');

console.log('✅ DESIGN Server: No procedures required (bootstrap capability)');
console.log('✅ MANAGE Server: Procedures required for WRITE operations only');
console.log('✅ CONSUME Server: Procedures required for WRITE operations only');
console.log('✅ READ operations: Free access for data analysis');
console.log('✅ WRITE operations: Governed for data integrity\n');

process.exit(successRate === 100 ? 0 : 1);
