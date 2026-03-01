import {TeamsActivityHandler} from "botbuilder";
import {semanticAnalysis} from "./process.ts";

export class Agent extends TeamsActivityHandler {
    constructor() {
        super();
        this.onMessage(async (context, next) => {
            const userQuestion = context.activity.text;
            const answer = await this.generateAnswer(userQuestion); // OpenAI integration
            await context.sendActivity(answer);
            await next();
        });
    }

    async generateAnswer(question: string): Promise<string> {
        const answer = await semanticAnalysis(question);
        return answer ?? "I'm sorry, I couldn't find an answer to your question.";
    }
}
