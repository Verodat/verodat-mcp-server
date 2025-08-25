# Proof of Procedure (PoP) Implementation Documentation

## Overview
The Proof of Procedure (PoP) system has been successfully implemented for the Verodat MCP Server. This governance framework enforces procedures before allowing certain operations, with intelligent READ/WRITE differentiation to balance security with usability.

## Key Features Implemented

### 1. READ/WRITE Operation Differentiation
- **READ Operations**: Proceed without procedures by default
  - `get-datasets`
  - `get-dataset-output`
  - `get-dataset-targetfields`
  - `get-workspaces`
  - `get-accounts`
  - `get-queries`
  - `get-ai-context`
  - `list-procedures`

- **WRITE Operations**: Require procedures by default
  - `execute-ai-query` (can execute UPDATE/INSERT/DELETE)
  - `create-dataset`
  - `upload-dataset-rows`
  - `update-dataset`
  - `delete-dataset`
  - `update-dataset-targetfields`
  - `delete-dataset-rows`

### 2. EnforceOnRead Flag
Procedures can optionally enforce governance on READ operations by setting `enforceOnRead: true` in their triggers configuration. This allows selective governance when needed without making the system overly restrictive.

### 3. Multi-Step Procedure Workflows
Supports comprehensive procedure workflows with different step types:

#### Step Types
1. **TOOL**: Execute Verodat operations within procedures
2. **QUIZ**: Test user knowledge before proceeding
3. **APPROVAL**: Require explicit user consent
4. **WAIT**: Add delays between operations
5. **INFORMATION**: Display guidance and warnings

### 4. Dynamic Procedure Loading
- Procedures loaded from Verodat AI_Agent_Procedures dataset
- Support for YAML and JSON formats
- Real-time procedure updates without server restart

### 5. State Management
- File-based persistence in `.procedure-state/procedure-runs.json`
- 5-minute expiry for procedure runs
- Support for resuming interrupted procedures

### 6. Security Features
- RunId validation for all governed operations
- System operation flag with stack trace validation
- Audit logging to Verodat for compliance tracking

## Architecture

### Core Components

#### 1. BaseToolHandler (`src/handlers/BaseToolHandler.ts`)
- Implements procedure enforcement logic
- Checks READ/WRITE operation types
- Validates runId for governed operations

#### 2. ProcedureService (`src/services/procedureService.ts`)
- Manages procedure lifecycle
- Handles state persistence
- Validates and expires procedure runs

#### 3. ProcedureLoader (`src/services/procedureLoader.ts`)
- Loads procedures from Verodat
- Handles system operations bypass
- Caches procedures for performance

#### 4. StepExecutor (`src/services/stepExecutor.ts`)
- Executes different step types
- Manages step state and transitions
- Handles user interactions

#### 5. ProcedureParser (`src/services/procedureParser.ts`)
- Parses YAML and JSON procedure formats
- Validates procedure structure
- Handles variable substitution

#### 6. ProcedureAuditLogger (`src/services/procedureAuditLogger.ts`)
- Logs all procedure actions to Verodat
- Tracks compliance and governance
- Provides audit trail

## Configuration

### Operation Types (`src/config/operationTypes.ts`)
```typescript
export enum OperationType {
  READ = 'READ',
  WRITE = 'WRITE'
}
```

### Procedure Config (`src/config/procedureConfig.ts`)
```typescript
export const PROCEDURE_CONFIG = {
  requireForWrite: true,  // WRITE ops require procedures
  requireForRead: false,  // READ ops don't require procedures by default
  runExpiryMinutes: 5,
  stateFilePath: '.procedure-state/procedure-runs.json'
};
```

## Testing

### Test Scripts Created
1. **test-read-write-differentiation.cjs**: Tests READ/WRITE operation differentiation
2. **test-procedure-step-types.cjs**: Tests all procedure step types
3. **test-procedure.js**: Basic procedure functionality test
4. **test-procedure-complete.js**: Complete end-to-end procedure test

### Test Results
✅ READ operations proceed without procedures
✅ WRITE operations require procedures
✅ Procedure system is active and responding
✅ enforceOnRead flag support is implemented
✅ All step types validated
✅ Complex multi-step procedures working
✅ Conditional execution logic supported

## Usage Examples

### Starting a Procedure
```javascript
// Start a procedure before WRITE operations
const result = await mcpClient.call('start-procedure', {
  procedureId: 'PROC-DATASET-CREATION-V1'
});

const runId = result.runId;
```

### Executing Governed Operation
```javascript
// Include runId with WRITE operations
await mcpClient.call('create-dataset', {
  __runId: runId,  // Required for WRITE operations
  accountId: 123,
  workspaceId: 456,
  name: 'New Dataset',
  targetFields: [...]
});
```

### Creating a Procedure
```yaml
id: PROC-DATASET-CREATION-V1
name: Dataset Creation Procedure
description: Governs dataset creation with compliance checks
triggers:
  tools: ['create-dataset']
  operations: ['WRITE']
  enforceOnRead: false  # Optional: set true to govern READ ops
steps:
  - id: info
    type: information
    config:
      title: Dataset Creation Process
      content: This procedure ensures compliance...
      
  - id: quiz
    type: quiz
    config:
      question: What should you verify before creating a dataset?
      options:
        - Nothing, just create it
        - That the name is unique and follows conventions
      correctAnswer: 1
      
  - id: approval
    type: approval
    config:
      message: Ready to create the dataset?
      confirmText: yes
      
  - id: create
    type: tool
    tool: create-dataset
    config: {}  # Uses original request parameters
```

## Implementation Status

### Completed ✅
- Core procedure enforcement system
- READ/WRITE differentiation logic
- All procedure step types
- Dynamic procedure loading from Verodat
- State persistence and management
- RunId validation system
- Audit logging
- System operation bypass for internal operations
- EnforceOnRead flag support
- Test suite creation

### Future Enhancements
- Web UI for procedure management
- Advanced conditional logic in procedures
- Procedure analytics and reporting
- Integration with external approval systems
- Procedure templates library
- Role-based procedure assignment

## Migration Notes

### For Existing Implementations
1. The system is backward compatible
2. READ operations continue to work without changes
3. WRITE operations now require procedures
4. Procedures can be loaded from AI_Agent_Procedures dataset
5. System operations bypass prevents chicken-egg problems

### Security Considerations
1. Always validate runId for WRITE operations
2. Use enforceOnRead sparingly to avoid over-restriction
3. Implement proper audit logging for compliance
4. Regular review of procedure effectiveness
5. Monitor for bypass attempts

## Troubleshooting

### Common Issues
1. **"Procedure required" error**: Start a procedure before WRITE operations
2. **"Invalid runId"**: RunId may have expired (5-minute timeout)
3. **"Unknown tool"**: Tool may not be registered in the handler
4. **Loading procedures fails**: Check Verodat connectivity and permissions

### Debug Mode
Set environment variable `DEBUG=verodat:*` for detailed logging

## Conclusion
The Proof of Procedure implementation successfully balances security and usability by:
- Enforcing governance on WRITE operations that modify data
- Allowing READ operations to proceed freely for better user experience
- Providing flexibility with the enforceOnRead flag for special cases
- Supporting comprehensive multi-step procedures for complex workflows
- Maintaining audit trails for compliance requirements

This implementation provides a robust governance framework while maintaining system performance and user productivity.
