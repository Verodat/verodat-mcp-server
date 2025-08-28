/**
 * Security Validation Tests
 *
 * Tests to ensure the runId hijacking vulnerability has been fixed
 * and that procedures properly govern tool access.
 */
import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { runIdValidator } from '../src/services/runIdValidator.js';
import { procedureService } from '../src/services/procedureService.js';
import { procedureLoader } from '../src/services/procedureLoader.js';
import { auditService } from '../src/services/auditService.js';
describe('Security Validation - RunId Hijacking Prevention', () => {
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        // Clear any previous violations
        runIdValidator.clearViolations();
        auditService.clearLog();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('RunId Validation', () => {
        it('should prevent using PROC-EXPORT-DATA runId for create-dataset', async () => {
            // Mock an active run for PROC-EXPORT-DATA-V1
            const exportProcRun = {
                runId: 'run-export-123',
                procedureId: 'PROC-EXPORT-DATA-V1',
                currentStepIndex: 0,
                status: 'active',
                startedAt: new Date().toISOString(),
                completedSteps: [],
                stepResponses: new Map(),
                context: {},
                expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
            };
            // Mock the procedure definition for PROC-EXPORT-DATA-V1
            const exportProcedure = {
                id: 'PROC-EXPORT-DATA-V1',
                name: 'Export Data Procedure',
                triggers: {
                    tools: ['get-dataset-output', 'get-datasets'], // Only READ tools
                    operations: ['READ']
                },
                steps: [
                    {
                        id: 'step-1',
                        name: 'Export Data',
                        tools: ['get-dataset-output']
                    }
                ]
            };
            // Mock service methods
            sandbox.stub(procedureService, 'getActiveRun').returns(exportProcRun);
            sandbox.stub(procedureLoader, 'getProcedure').resolves(exportProcedure);
            // Attempt to use the export runId for create-dataset (WRITE operation)
            const validation = await runIdValidator.validateRunIdForTool('run-export-123', 'create-dataset', { name: 'Hijacked Dataset' });
            // Validation should fail
            expect(validation.isValid).to.equal(false);
            expect(validation.violation).to.exist;
            expect(validation.violation?.type).to.equal('RUNID_HIJACK');
            expect(validation.reason).to.contain('SECURITY VIOLATION');
            expect(validation.reason).to.contain('unauthorized tool create-dataset');
            // Check that violation was logged
            const violations = runIdValidator.getViolations();
            expect(violations.length).to.be.greaterThan(0);
            expect(violations[0].type).to.equal('RUNID_HIJACK');
            expect(violations[0].attemptedTool).to.equal('create-dataset');
        });
        it('should allow using correct runId for authorized tools', async () => {
            // Mock an active run for a WRITE procedure
            const writeProcRun = {
                runId: 'run-write-456',
                procedureId: 'PROC-CREATE-DATASET-V1',
                currentStepIndex: 0,
                status: 'active',
                startedAt: new Date().toISOString(),
                completedSteps: [],
                stepResponses: new Map(),
                context: {},
                expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
            };
            // Mock the procedure definition that allows create-dataset
            const writeProcedure = {
                id: 'PROC-CREATE-DATASET-V1',
                name: 'Create Dataset Procedure',
                triggers: {
                    tools: ['create-dataset', 'upload-dataset-rows'],
                    operations: ['WRITE']
                },
                steps: [
                    {
                        id: 'step-1',
                        name: 'Create Dataset',
                        tools: ['create-dataset']
                    }
                ]
            };
            // Mock service methods
            sandbox.stub(procedureService, 'getActiveRun').returns(writeProcRun);
            sandbox.stub(procedureLoader, 'getProcedure').resolves(writeProcedure);
            // Use the correct runId for create-dataset
            const validation = await runIdValidator.validateRunIdForTool('run-write-456', 'create-dataset', { name: 'Legitimate Dataset' });
            // Validation should pass
            expect(validation.isValid).to.equal(true);
            expect(validation.violation).to.be.undefined;
            expect(validation.procedureId).to.equal('PROC-CREATE-DATASET-V1');
            // No violations should be logged
            const violations = runIdValidator.getViolations();
            expect(violations.length).to.equal(0);
        });
        it('should reject expired runIds', async () => {
            // Mock an expired run
            const expiredRun = {
                runId: 'run-expired-789',
                procedureId: 'PROC-EXPORT-DATA-V1',
                currentStepIndex: 0,
                status: 'active',
                startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                completedSteps: [],
                stepResponses: new Map(),
                context: {},
                expiresAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() // Expired
            };
            // getActiveRun should return undefined for expired runs
            sandbox.stub(procedureService, 'getActiveRun').returns(undefined);
            // Attempt to use expired runId
            const validation = await runIdValidator.validateRunIdForTool('run-expired-789', 'get-dataset-output', {});
            // Validation should fail
            expect(validation.isValid).to.equal(false);
            expect(validation.violation?.type).to.equal('EXPIRED_RUN');
            expect(validation.reason).to.contain('Invalid or expired runId');
        });
        it('should enforce step-level tool restrictions', async () => {
            // Mock a multi-step procedure
            const multiStepRun = {
                runId: 'run-multistep-111',
                procedureId: 'PROC-MULTI-STEP-V1',
                currentStepIndex: 1, // On second step
                status: 'active',
                startedAt: new Date().toISOString(),
                completedSteps: ['step-1'],
                stepResponses: new Map(),
                context: {},
                expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
            };
            const multiStepProcedure = {
                id: 'PROC-MULTI-STEP-V1',
                name: 'Multi-Step Procedure',
                triggers: {
                    tools: ['get-datasets', 'create-dataset', 'upload-dataset-rows'],
                    operations: ['READ', 'WRITE']
                },
                steps: [
                    {
                        id: 'step-1',
                        name: 'Read Data',
                        tools: ['get-datasets']
                    },
                    {
                        id: 'step-2',
                        name: 'Create Dataset',
                        tools: ['create-dataset'] // Only create-dataset allowed in step 2
                    },
                    {
                        id: 'step-3',
                        name: 'Upload Data',
                        tools: ['upload-dataset-rows']
                    }
                ]
            };
            // Mock service methods
            sandbox.stub(procedureService, 'getActiveRun').returns(multiStepRun);
            sandbox.stub(procedureLoader, 'getProcedure').resolves(multiStepProcedure);
            // Try to use upload-dataset-rows in step 2 (should fail)
            const invalidStepValidation = await runIdValidator.validateRunIdForTool('run-multistep-111', 'upload-dataset-rows', {});
            expect(invalidStepValidation.isValid).to.equal(false);
            expect(invalidStepValidation.violation?.type).to.equal('INVALID_STEP');
            expect(invalidStepValidation.reason).to.contain('not allowed in current step');
            // Try to use create-dataset in step 2 (should pass)
            const validStepValidation = await runIdValidator.validateRunIdForTool('run-multistep-111', 'create-dataset', {});
            expect(validStepValidation.isValid).to.equal(true);
            expect(validStepValidation.violation).to.be.undefined;
        });
    });
    describe('Audit Logging', () => {
        it('should log security violations to audit service', async () => {
            // Mock setup for hijack attempt
            const exportProcRun = {
                runId: 'run-audit-test',
                procedureId: 'PROC-EXPORT-DATA-V1',
                currentStepIndex: 0,
                status: 'active',
                startedAt: new Date().toISOString(),
                completedSteps: [],
                stepResponses: new Map(),
                context: {},
                expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
            };
            const exportProcedure = {
                id: 'PROC-EXPORT-DATA-V1',
                name: 'Export Data Procedure',
                triggers: {
                    tools: ['get-dataset-output'],
                    operations: ['READ']
                },
                steps: [
                    {
                        id: 'step-1',
                        name: 'Export Data',
                        tools: ['get-dataset-output']
                    }
                ]
            };
            sandbox.stub(procedureService, 'getActiveRun').returns(exportProcRun);
            sandbox.stub(procedureLoader, 'getProcedure').resolves(exportProcedure);
            // Attempt hijack
            await runIdValidator.validateRunIdForTool('run-audit-test', 'delete-dataset', // Attempting dangerous operation
            { datasetId: 123 });
            // Check audit log
            const securityViolations = auditService.getSecurityViolations();
            expect(securityViolations.length).to.be.greaterThan(0);
            const violation = securityViolations[0];
            expect(violation.eventType).to.equal('RUNID_HIJACK_ATTEMPT');
            expect(violation.severity).to.equal('CRITICAL');
            expect(violation.toolName).to.equal('delete-dataset');
            expect(violation.runId).to.equal('run-audit-test');
        });
    });
    describe('Wildcard Pattern Expansion', () => {
        it('should correctly expand tool patterns with wildcards', async () => {
            const procRun = {
                runId: 'run-pattern-222',
                procedureId: 'PROC-WILDCARD-V1',
                currentStepIndex: 0,
                status: 'active',
                startedAt: new Date().toISOString(),
                completedSteps: [],
                stepResponses: new Map(),
                context: {},
                expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
            };
            const wildcardProcedure = {
                id: 'PROC-WILDCARD-V1',
                name: 'Wildcard Procedure',
                triggers: {
                    tools: ['get-*', '*-dataset'], // Wildcard patterns
                    operations: ['READ', 'WRITE']
                },
                steps: [
                    {
                        id: 'step-1',
                        name: 'Any Operation',
                        tools: ['*-dataset']
                    }
                ]
            };
            sandbox.stub(procedureService, 'getActiveRun').returns(procRun);
            sandbox.stub(procedureLoader, 'getProcedure').resolves(wildcardProcedure);
            // Should allow get-datasets (matches get-*)
            const getValidation = await runIdValidator.validateRunIdForTool('run-pattern-222', 'get-datasets', {});
            expect(getValidation.isValid).to.equal(true);
            // Should allow create-dataset (matches *-dataset)
            const createValidation = await runIdValidator.validateRunIdForTool('run-pattern-222', 'create-dataset', {});
            expect(createValidation.isValid).to.equal(true);
            // Should NOT allow upload-dataset-rows (doesn't match patterns)
            const uploadValidation = await runIdValidator.validateRunIdForTool('run-pattern-222', 'upload-dataset-rows', {});
            expect(uploadValidation.isValid).to.equal(false);
        });
    });
});
