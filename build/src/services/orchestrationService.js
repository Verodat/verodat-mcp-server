/**
 * Orchestration Service - Central coordinator for governance creation
 * Manages communication between agents and orchestrates the governance creation workflow
 */
import { v4 as uuidv4 } from 'uuid';
import { defaultOrchestrationConfig } from '../config/orchestrationConfig.js';
import { AgentCommunicator } from './agentCommunicator.js';
import { GovernanceAnalyzer } from './governanceAnalyzer.js';
import { agentLoader } from './agentLoader.js';
export class OrchestrationService {
    activeSessions = new Map();
    config;
    agentCommunicator;
    governanceAnalyzer;
    verodatHandler; // Will be injected
    constructor(config) {
        this.config = { ...defaultOrchestrationConfig, ...config };
        this.agentCommunicator = new AgentCommunicator(this.config.messaging);
        this.governanceAnalyzer = new GovernanceAnalyzer(this.config.similarity);
    }
    /**
     * Initialize with Verodat handler
     */
    async initialize(verodatHandler) {
        this.verodatHandler = verodatHandler;
        this.governanceAnalyzer.initialize(verodatHandler);
        // Initialize agent loader with Verodat handler
        agentLoader.initialize(verodatHandler);
        // Load agents from dataset
        const agents = await agentLoader.loadAgents();
        // Register loaded agents with communicator
        for (const agent of agents.values()) {
            // Convert AgentDefinition to AgentCapability format for registration
            const capability = {
                agentId: agent.agentId,
                actions: agent.capabilities,
                datasets: [agent.primaryDataset],
                canCreatePolicy: agent.agentId === 'AGENT-POLICIES-OPS',
                canCreateProcedure: agent.agentId === 'AGENT-PROCEDURES-OPS',
                canAnalyze: agent.agentId === 'AGENT-VERA'
            };
            this.agentCommunicator.registerAgent(capability);
        }
        if (process.argv[2] === 'call') {
            console.log('OrchestrationService initialized with agents from dataset:', Array.from(agents.keys()));
        }
    }
    /**
     * Start an orchestration session for governance creation
     */
    async startOrchestration(request) {
        if (!this.config.enabled) {
            return {
                success: false,
                session: null,
                error: 'Orchestration is disabled'
            };
        }
        const sessionId = uuidv4();
        const session = {
            sessionId,
            initiator: request.toolName,
            operation: request.operation,
            status: 'active',
            agents: ['VERA', 'AGENT-POLICIES-OPS', 'AGENT-PROCEDURES-OPS'],
            messages: [],
            createdGovernance: {},
            startTime: new Date().toISOString()
        };
        this.activeSessions.set(sessionId, session);
        try {
            // Step 1: Analyze if new governance is needed
            const analysis = await this.analyzeGovernanceNeed(request);
            if (analysis.recommendation === 'reuse') {
                // Can reuse existing governance
                return this.reuseExistingGovernance(session, analysis);
            }
            // Step 2: Send orchestration request to Vera
            const veraMessage = {
                from: 'ORCHESTRATION_SERVICE',
                to: 'VERA',
                action: 'orchestrate-governance-creation',
                context: {
                    request,
                    analysis
                },
                priority: request.urgency === 'immediate' ? 'urgent' : 'normal',
                sessionId,
                timestamp: new Date().toISOString()
            };
            await this.agentCommunicator.sendMessage(veraMessage);
            session.messages.push(veraMessage);
            // Step 3: Create policy if needed
            let policyDraft;
            if (analysis.needsNewPolicy) {
                policyDraft = await this.orchestratePolicyCreation(sessionId, request, analysis);
                if (policyDraft) {
                    session.createdGovernance.policyId = policyDraft.policy_id;
                }
            }
            // Step 4: Create procedure if needed
            let procedureDraft;
            if (analysis.needsNewProcedure) {
                procedureDraft = await this.orchestrateProcedureCreation(sessionId, request, policyDraft);
                if (procedureDraft) {
                    session.createdGovernance.procedureId = procedureDraft.procedure_id;
                }
            }
            // Step 5: Complete orchestration
            session.status = 'completed';
            session.endTime = new Date().toISOString();
            return {
                success: true,
                session,
                createdPolicy: policyDraft,
                createdProcedure: procedureDraft,
                recommendations: this.generateRecommendations(analysis)
            };
        }
        catch (error) {
            session.status = 'failed';
            session.endTime = new Date().toISOString();
            return {
                success: false,
                session,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    /**
     * Analyze if new governance is needed
     */
    async analyzeGovernanceNeed(request) {
        return this.governanceAnalyzer.analyze(request);
    }
    /**
     * Orchestrate policy creation with Policy Agent
     */
    async orchestratePolicyCreation(sessionId, request, analysis) {
        const session = this.activeSessions.get(sessionId);
        if (!session)
            throw new Error('Session not found');
        // Send message to Policy Agent
        const message = {
            from: 'VERA',
            to: 'AGENT-POLICIES-OPS',
            action: 'create-policy',
            context: {
                toolName: request.toolName,
                operation: request.operation,
                similarPolicies: analysis.similarPolicies,
                requirements: request.context
            },
            priority: 'normal',
            sessionId,
            timestamp: new Date().toISOString()
        };
        await this.agentCommunicator.sendMessage(message);
        session.messages.push(message);
        // Simulate policy creation (will be replaced with actual agent logic)
        const policyDraft = {
            policy_id: `POL-${request.toolName.toUpperCase()}-${Date.now()}`,
            title: `Policy for ${request.toolName} ${request.operation} operations`,
            purpose: `Govern ${request.operation} operations for ${request.toolName}`,
            rules: [
                `All ${request.operation} operations must be audited`,
                `User must acknowledge data protection requirements`,
                `Operation must be reversible or have compensating controls`
            ],
            owner: 'AGENT-POLICIES-OPS',
            status: 'draft'
        };
        // Log policy creation
        if (process.argv[2] === 'call') {
            console.log(`Created policy draft: ${policyDraft.policy_id}`);
        }
        return policyDraft;
    }
    /**
     * Orchestrate procedure creation with Procedure Agent
     */
    async orchestrateProcedureCreation(sessionId, request, policy) {
        const session = this.activeSessions.get(sessionId);
        if (!session)
            throw new Error('Session not found');
        // Send message to Procedure Agent
        const message = {
            from: 'VERA',
            to: 'AGENT-PROCEDURES-OPS',
            action: 'create-procedure',
            context: {
                toolName: request.toolName,
                operation: request.operation,
                policy: policy,
                requirements: request.context
            },
            priority: 'normal',
            sessionId,
            timestamp: new Date().toISOString()
        };
        await this.agentCommunicator.sendMessage(message);
        session.messages.push(message);
        // Simulate procedure creation (will be replaced with actual agent logic)
        const procedureDraft = {
            procedure_id: `PROC-${request.toolName.toUpperCase()}-${Date.now()}`,
            title: `Procedure for ${request.toolName} ${request.operation}`,
            purpose: `Implement governance for ${request.operation} operations`,
            steps: [
                {
                    type: 'information',
                    description: 'Review operation requirements and compliance',
                    required: true
                },
                {
                    type: 'approval',
                    description: 'Obtain approval for sensitive operation',
                    required: request.operation === 'WRITE'
                },
                {
                    type: 'tool',
                    description: `Execute ${request.toolName} operation`,
                    required: true
                }
            ],
            triggers: {
                tools: [request.toolName],
                operations: [request.operation.toLowerCase()]
            },
            policyId: policy?.policy_id || '',
            owner: 'AGENT-PROCEDURES-OPS',
            status: 'draft'
        };
        // Log procedure creation
        if (process.argv[2] === 'call') {
            console.log(`Created procedure draft: ${procedureDraft.procedure_id}`);
        }
        return procedureDraft;
    }
    /**
     * Reuse existing governance instead of creating new
     */
    async reuseExistingGovernance(session, analysis) {
        const existingProcedure = analysis.similarProcedures.find(p => p.canReuse);
        session.status = 'completed';
        session.endTime = new Date().toISOString();
        return {
            success: true,
            session,
            recommendations: [
                `Reusing existing procedure: ${existingProcedure?.id}`,
                'No new governance creation needed'
            ]
        };
    }
    /**
     * Generate recommendations based on analysis
     */
    generateRecommendations(analysis) {
        const recommendations = [];
        if (analysis.similarPolicies.length > 0) {
            recommendations.push(`Found ${analysis.similarPolicies.length} similar policies that could be consolidated`);
        }
        if (analysis.recommendation === 'extend') {
            recommendations.push('Consider extending existing governance rather than creating new');
        }
        if (analysis.needsNewPolicy && analysis.needsNewProcedure) {
            recommendations.push('Both policy and procedure creation recommended for full governance');
        }
        return recommendations;
    }
    /**
     * Handle missing governance (called from BaseToolHandler)
     */
    async handleMissingGovernance(toolName, operation, context) {
        const request = {
            toolName,
            operation: operation,
            requester: 'system',
            context: context || {},
            urgency: 'immediate'
        };
        return this.startOrchestration(request);
    }
    /**
     * Complete an orchestration session
     */
    async completeOrchestration(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session)
            return;
        session.status = 'completed';
        session.endTime = new Date().toISOString();
        // Archive session after completion
        setTimeout(() => {
            this.activeSessions.delete(sessionId);
        }, 60000); // Keep for 1 minute for reference
    }
    /**
     * Get session status
     */
    getSessionStatus(sessionId) {
        return this.activeSessions.get(sessionId) || null;
    }
    /**
     * Get all active sessions
     */
    getActiveSessions() {
        return Array.from(this.activeSessions.values())
            .filter(s => s.status === 'active');
    }
    /**
     * Check if orchestration is enabled
     */
    isEnabled() {
        return this.config.enabled;
    }
}
// Export singleton instance
export const orchestrationService = new OrchestrationService();
