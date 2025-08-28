/**
 * Governance Analyzer - Analyzes need for new governance
 * Finds similar policies and procedures to prevent duplication
 * Recommends whether to create, extend, or reuse existing governance
 */
export class GovernanceAnalyzer {
    config;
    verodatHandler; // Will be injected
    policiesCache = [];
    proceduresCache = [];
    lastCacheUpdate = 0;
    cacheInterval = 5 * 60 * 1000; // 5 minutes
    constructor(config) {
        this.config = config;
    }
    /**
     * Initialize with Verodat handler
     */
    initialize(verodatHandler) {
        this.verodatHandler = verodatHandler;
        if (process.argv[2] === 'call') {
            console.log('GovernanceAnalyzer initialized with algorithm:', this.config.algorithm);
        }
    }
    /**
     * Analyze if new governance is needed
     */
    async analyze(request) {
        // Refresh cache if needed
        await this.refreshCacheIfNeeded();
        // Find similar policies
        const similarPolicies = this.findSimilarPolicies(request);
        // Find similar procedures
        const similarProcedures = this.findSimilarProcedures(request);
        // Determine recommendation
        const recommendation = this.determineRecommendation(similarPolicies, similarProcedures, request);
        // Check if new governance is needed
        const needsNewPolicy = similarPolicies.every(p => p.similarity < this.config.threshold);
        const needsNewProcedure = similarProcedures.every(p => p.similarity < this.config.threshold);
        return {
            needsNewPolicy,
            needsNewProcedure,
            similarPolicies,
            similarProcedures,
            recommendation
        };
    }
    /**
     * Find similar policies
     */
    findSimilarPolicies(request) {
        const results = [];
        for (const policy of this.policiesCache) {
            const similarity = this.calculatePolicySimilarity(request, policy);
            if (similarity > 0.3) { // Only include if at least 30% similar
                results.push({
                    id: policy.id,
                    similarity,
                    canExtend: similarity > 0.6 && similarity < this.config.threshold
                });
            }
        }
        // Sort by similarity descending
        results.sort((a, b) => b.similarity - a.similarity);
        return results.slice(0, 5); // Return top 5 matches
    }
    /**
     * Find similar procedures
     */
    findSimilarProcedures(request) {
        const results = [];
        for (const procedure of this.proceduresCache) {
            const similarity = this.calculateProcedureSimilarity(request, procedure);
            if (similarity > 0.3) { // Only include if at least 30% similar
                results.push({
                    id: procedure.id,
                    similarity,
                    canReuse: similarity >= this.config.threshold
                });
            }
        }
        // Sort by similarity descending
        results.sort((a, b) => b.similarity - a.similarity);
        return results.slice(0, 5); // Return top 5 matches
    }
    /**
     * Calculate policy similarity
     */
    calculatePolicySimilarity(request, policy) {
        const factors = [];
        // Tool match
        if (policy.tools.includes(request.toolName)) {
            factors.push(1.0);
        }
        else {
            factors.push(0.0);
        }
        // Purpose similarity (simple word matching)
        const requestWords = request.toolName.toLowerCase().split(/[-_]/);
        const policyWords = policy.purpose.toLowerCase().split(/\s+/);
        const commonWords = requestWords.filter(w => policyWords.includes(w));
        factors.push(commonWords.length / Math.max(requestWords.length, 1));
        // Operation type match
        const operationMatch = policy.purpose.toLowerCase().includes(request.operation.toLowerCase());
        factors.push(operationMatch ? 0.8 : 0.2);
        // Calculate weighted average
        return factors.reduce((a, b) => a + b, 0) / factors.length;
    }
    /**
     * Calculate procedure similarity
     */
    calculateProcedureSimilarity(request, procedure) {
        const factors = [];
        // Tool match
        if (procedure.tools.includes(request.toolName)) {
            factors.push(1.0);
        }
        else {
            factors.push(0.0);
        }
        // Operation match
        if (procedure.operations.includes(request.operation.toLowerCase())) {
            factors.push(1.0);
        }
        else {
            factors.push(0.0);
        }
        // Purpose similarity
        const requestWords = request.toolName.toLowerCase().split(/[-_]/);
        const procedureWords = procedure.purpose.toLowerCase().split(/\s+/);
        const commonWords = requestWords.filter(w => procedureWords.includes(w));
        factors.push(commonWords.length / Math.max(requestWords.length, 1));
        // Calculate weighted average with higher weight for tool and operation match
        const weights = [2.0, 2.0, 1.0]; // Tool and operation have double weight
        const weightedSum = factors.reduce((sum, factor, i) => sum + factor * weights[i], 0);
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        return weightedSum / totalWeight;
    }
    /**
     * Determine recommendation based on analysis
     */
    determineRecommendation(similarPolicies, similarProcedures, request) {
        // If we have a highly similar procedure that can be reused
        if (similarProcedures.some(p => p.canReuse)) {
            return 'reuse';
        }
        // If we have a moderately similar policy that can be extended
        if (similarPolicies.some(p => p.canExtend)) {
            return 'extend';
        }
        // Otherwise, create new governance
        return 'create';
    }
    /**
     * Refresh cache if needed
     */
    async refreshCacheIfNeeded() {
        const now = Date.now();
        if (now - this.lastCacheUpdate < this.cacheInterval) {
            return; // Cache is still fresh
        }
        try {
            // Load policies from cache (simplified - would query Verodat in real implementation)
            await this.loadPoliciesFromCache();
            // Load procedures from cache (simplified - would query Verodat in real implementation)
            await this.loadProceduresFromCache();
            this.lastCacheUpdate = now;
        }
        catch (error) {
            if (process.argv[2] === 'call') {
                console.error('Failed to refresh governance cache:', error);
            }
        }
    }
    /**
     * Load policies from cache (simplified implementation)
     */
    async loadPoliciesFromCache() {
        // In a real implementation, this would query the Business_Policies dataset
        // For now, we'll use some example policies
        this.policiesCache = [
            {
                id: 'POL-DATA-EXPORT',
                title: 'Data Export Policy',
                purpose: 'Govern data export operations',
                rules: ['Audit all exports', 'Require approval for sensitive data'],
                tools: ['get-dataset-output', 'export-data']
            },
            {
                id: 'POL-DATA-IMPORT',
                title: 'Data Import Policy',
                purpose: 'Govern data import operations',
                rules: ['Validate all imports', 'Check data integrity'],
                tools: ['upload-dataset-rows', 'import-data']
            }
        ];
    }
    /**
     * Load procedures from cache (simplified implementation)
     */
    async loadProceduresFromCache() {
        // In a real implementation, this would query the AI_Agent_Procedures dataset
        // For now, we'll use some example procedures
        this.proceduresCache = [
            {
                id: 'PROC-EXPORT-DATA',
                title: 'Data Export Procedure',
                purpose: 'Procedure for exporting data',
                tools: ['get-dataset-output'],
                operations: ['read', 'export']
            },
            {
                id: 'PROC-IMPORT-DATA',
                title: 'Data Import Procedure',
                purpose: 'Procedure for importing data',
                tools: ['upload-dataset-rows'],
                operations: ['write', 'import']
            }
        ];
    }
    /**
     * Consolidate similar governance
     */
    async consolidateGovernance(policyIds) {
        // This would merge similar policies into a consolidated one
        // For now, return the first policy ID as the consolidated one
        return policyIds[0] || 'POL-CONSOLIDATED';
    }
    /**
     * Get similarity score between two text strings
     */
    getTextSimilarity(text1, text2) {
        switch (this.config.algorithm) {
            case 'jaccard':
                return this.jaccardSimilarity(text1, text2);
            case 'levenshtein':
                return this.levenshteinSimilarity(text1, text2);
            case 'cosine':
                return this.cosineSimilarity(text1, text2);
            default:
                return this.jaccardSimilarity(text1, text2);
        }
    }
    /**
     * Jaccard similarity between two strings
     */
    jaccardSimilarity(text1, text2) {
        const set1 = new Set(text1.toLowerCase().split(/\s+/));
        const set2 = new Set(text2.toLowerCase().split(/\s+/));
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return intersection.size / union.size;
    }
    /**
     * Levenshtein similarity (normalized)
     */
    levenshteinSimilarity(text1, text2) {
        const maxLength = Math.max(text1.length, text2.length);
        if (maxLength === 0)
            return 1.0;
        const distance = this.levenshteinDistance(text1, text2);
        return 1 - (distance / maxLength);
    }
    /**
     * Calculate Levenshtein distance
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }
        return matrix[str2.length][str1.length];
    }
    /**
     * Cosine similarity between two strings
     */
    cosineSimilarity(text1, text2) {
        const vector1 = this.textToVector(text1);
        const vector2 = this.textToVector(text2);
        const dotProduct = this.dotProduct(vector1, vector2);
        const magnitude1 = this.magnitude(vector1);
        const magnitude2 = this.magnitude(vector2);
        if (magnitude1 === 0 || magnitude2 === 0)
            return 0;
        return dotProduct / (magnitude1 * magnitude2);
    }
    /**
     * Convert text to term frequency vector
     */
    textToVector(text) {
        const vector = new Map();
        const words = text.toLowerCase().split(/\s+/);
        for (const word of words) {
            vector.set(word, (vector.get(word) || 0) + 1);
        }
        return vector;
    }
    /**
     * Calculate dot product of two vectors
     */
    dotProduct(vector1, vector2) {
        let product = 0;
        for (const [word, count1] of vector1) {
            const count2 = vector2.get(word) || 0;
            product += count1 * count2;
        }
        return product;
    }
    /**
     * Calculate magnitude of a vector
     */
    magnitude(vector) {
        let sum = 0;
        for (const count of vector.values()) {
            sum += count * count;
        }
        return Math.sqrt(sum);
    }
}
