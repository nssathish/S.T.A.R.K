// server.ts
import express from "express";
import { BotFrameworkAdapter, TeamsActivityHandler } from "botbuilder";
import { answerUserQuestion } from "./answerUserQuestion"; // Your earlier code
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT;

const adapter = new BotFrameworkAdapter({
  appId: process.env.BOT_ID,
  appPassword: process.env.BOT_PASSWORD,
});

class Edith extends TeamsActivityHandler {
  constructor() {
    super();
    this.onMessage(async (context, next) => {
      const userQuestion = context.activity.text;
      const answer = await generateAnswer(userQuestion); // OpenAI integration
      await context.sendActivity(answer);
      await next();
    });
  }
}

const bot = new Edith();

app.post("/api/messages", (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    // @ts-ignore
    await bot.run(context, async (context) => {
      const userQuestion = context.activity.text;
      const answer = await generateAnswer(userQuestion); // OpenAI integration
      await context.sendActivity(answer);
    });
  });
});

app.listen(port, () => {
  console.log(`Bot is running on http://localhost:${port}`);
});

async function generateAnswer(question: string): Promise<string> {
  const answer = await answerUserQuestion(question);
  return answer ?? "I'm sorry, I couldn't find an answer to your question.";
}
