import {Embedding} from "./model/Embedding";
import {Content} from "./content";
import {OpenAI} from "openai";
import dotenv from "dotenv";

export class Data {
    private openai: OpenAI;

    constructor() {
        dotenv.config();
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    // Find the most relevant documents
    cosineSimilarity(vecA: number[], vecB: number[]): number {
        const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }

    async context(question: string, docsDirectory: string): Promise<string> {
        const docsContent = new Content(docsDirectory);
        const [questionVector, docEmbeddings] = await this.createEmbeddings(question, docsContent);
        const rankedDocs = docEmbeddings
            .map((doc) => ({
                filePath: (<Embedding>doc).FilePath,
                content: (<Embedding>doc).Content,
                embedding: (<Embedding>doc).Embedding,
                similarity: this.cosineSimilarity(<number[]>questionVector, (<Embedding>doc).Embedding),
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5); // Top 5 relevant documents

        return rankedDocs
            .map((doc) => doc.content.slice(0, 1000)) // Limit per chunk
            .join("\n---\n");
    }

    private createEmbeddings = async (question: string, docsContent: Content) => {
        const questionEmbedding = await this.openai.embeddings.create({
            model: "text-embedding-3-small",
            input: question,
        })
        const questionVector = questionEmbedding.data[0].embedding;
        const docs = docsContent.load();
        const embeddings = await Promise.all(
            docs.map(async (doc) => {
                const embedding = await this.openai.embeddings.create({
                    model: "text-embedding-3-small",
                    input: doc.content,
                });
                return new Embedding(doc.filePath, doc.content, embedding.data[0].embedding);
            })
        );
        return [questionVector, embeddings];
    }
}