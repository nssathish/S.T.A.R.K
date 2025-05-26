import {Data} from "./data";
import dotenv from "dotenv";
import {OpenAI} from "openai";

dotenv.config();


const docsDirectory = "../docs/content";
const data = new Data();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function semanticAnalysis(question: string) {
    const context = data.context(question, docsDirectory);
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
