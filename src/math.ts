export class DataMath {
    cosineSimilarity(vecA: number[], vecB: number[]): number {
        if (vecA.length !== vecB.length) {
            throw new Error("Input vectors must be of the same length");
        }
        const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
        const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
        const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
        return normA && normB ? dotProduct / (normA * normB) : 0;
    }
}