import { OpenAI } from "openai";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const docsDirectory = "../docs/content";

function loadDocumentation(): { content: string; filePath: string }[] {
  const files = fs.readdirSync(docsDirectory, { recursive: true });
  const mdxFiles = files.filter((file) => file.toString().endsWith(".mdx"));
  return mdxFiles.map((file) => {
    const filePath = path.join(docsDirectory, file.toString());
    // console.log("Loading file:", filePath);
    const content = fs.readFileSync(filePath, "utf-8");
    return { content, filePath };
  });
}

export async function answerUserQuestion(question: string) {
  const questionEmbedding = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: question,
  });

  const questionVector = questionEmbedding.data[0].embedding;

  const docs = loadDocumentation();

  // Embed all documentation content
  const docEmbeddings = await Promise.all(
    docs.map(async (doc) => {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: doc.content,
      });
      return {
        filePath: doc.filePath,
        content: doc.content,
        embedding: embedding.data[0].embedding,
      };
    })
  );

  // Find the most relevant documents
  function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  const rankedDocs = docEmbeddings
    .map((doc) => ({
      ...doc,
      similarity: cosineSimilarity(questionVector, doc.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5); // Top 5 relevant documents

  const context = rankedDocs
    .map((doc) => doc.content.slice(0, 1000)) // Limit per chunk
    .join("\n---\n");

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "developer",
        content:
          "You are a helpful assistant that answers questions using the provided documentation.",
      },
      {
        role: "developer",
        content: `Answer this based on the docs:\n\n${context}\n\nQuestion: ${question}`,
      },
    ],
    temperature: 0.2,
  });

  return chatCompletion.choices[0].message.content;
}
