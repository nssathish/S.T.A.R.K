import {Embedding} from "./model/Embedding.ts";
import {OpenAI} from "openai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import {DataMath} from "./math.ts";

export class Data {
    private openai: OpenAI;
    private dataMath: DataMath;

    constructor() {
        dotenv.config();
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.dataMath = new DataMath();
    }

    async context(question: string, docsDirectory: string): Promise<string> {
        const [questionVector, docEmbeddings] = await this.createEmbeddings(question, docsDirectory);
        const rankedDocs = docEmbeddings
            .map((doc) => ({
                filePath: (<Embedding>doc).FilePath,
                content: (<Embedding>doc).Content,
                embedding: (<Embedding>doc).Embedding,
                similarity: this.dataMath.cosineSimilarity(<number[]>questionVector, (<Embedding>doc).Embedding),
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5); // Top 5 relevant documents

        return rankedDocs
            .map((doc) => doc.content.slice(0, 1000)) // Limit per chunk
            .join("\n---\n");
    }

    private createEmbeddings = async (question: string, docsDirectory: string) => {
        const questionEmbedding = await this.openai.embeddings.create({
            model: "text-embedding-3-small",
            input: question,
        })
        const questionVector = questionEmbedding.data[0].embedding;
        const docs = this.loadDocs(docsDirectory);
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

    private loadDocs(docsDirectory: string): { content: string; filePath: string }[] {
        const files = fs.readdirSync(docsDirectory, {recursive: true});
        const markdownFiles = files.filter((file) => {
            const fileName = file.toString().toLowerCase();
            return fileName.endsWith(".md") || fileName.endsWith(".mdx");
        });
        return markdownFiles.map((file) => {
            const filePath = path.join(docsDirectory, file.toString());
            const content = fs.readFileSync(filePath, "utf-8");
            return {content, filePath};
        });
    }
}
