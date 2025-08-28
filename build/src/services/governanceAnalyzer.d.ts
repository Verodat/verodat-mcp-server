/**
 * Governance Analyzer - Analyzes need for new governance
 * Finds similar policies and procedures to prevent duplication
 * Recommends whether to create, extend, or reuse existing governance
 */
import { GovernanceAnalysis, GovernanceCreationRequest } from '../types/orchestrationTypes.js';
interface SimilarityConfig {
    threshold: number;
    algorithm: 'levenshtein' | 'jaccard' | 'cosine';
}
export declare class GovernanceAnalyzer {
    private config;
    private verodatHandler;
    private policiesCache;
    private proceduresCache;
    private lastCacheUpdate;
    private cacheInterval;
    constructor(config: SimilarityConfig);
    /**
     * Initialize with Verodat handler
     */
    initialize(verodatHandler: any): void;
    /**
     * Analyze if new governance is needed
     */
    analyze(request: GovernanceCreationRequest): Promise<GovernanceAnalysis>;
    /**
     * Find similar policies
     */
    private findSimilarPolicies;
    /**
     * Find similar procedures
     */
    private findSimilarProcedures;
    /**
     * Calculate policy similarity
     */
    private calculatePolicySimilarity;
    /**
     * Calculate procedure similarity
     */
    private calculateProcedureSimilarity;
    /**
     * Determine recommendation based on analysis
     */
    private determineRecommendation;
    /**
     * Refresh cache if needed
     */
    private refreshCacheIfNeeded;
    /**
     * Load policies from cache (simplified implementation)
     */
    private loadPoliciesFromCache;
    /**
     * Load procedures from cache (simplified implementation)
     */
    private loadProceduresFromCache;
    /**
     * Consolidate similar governance
     */
    consolidateGovernance(policyIds: string[]): Promise<string>;
    /**
     * Get similarity score between two text strings
     */
    private getTextSimilarity;
    /**
     * Jaccard similarity between two strings
     */
    private jaccardSimilarity;
    /**
     * Levenshtein similarity (normalized)
     */
    private levenshteinSimilarity;
    /**
     * Calculate Levenshtein distance
     */
    private levenshteinDistance;
    /**
     * Cosine similarity between two strings
     */
    private cosineSimilarity;
    /**
     * Convert text to term frequency vector
     */
    private textToVector;
    /**
     * Calculate dot product of two vectors
     */
    private dotProduct;
    /**
     * Calculate magnitude of a vector
     */
    private magnitude;
}
export {};
