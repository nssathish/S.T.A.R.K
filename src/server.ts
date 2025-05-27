import express from "express";
import {CloudAdapter, ConfigurationBotFrameworkAuthentication} from "botbuilder";
import {Agent} from "./agent";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT;

const config = {
    MicrosoftAppId: process.env.BOT_ID || '',
    MicrosoftAppPassword: process.env.BOT_PASSWORD || '',
    MicrosoftAppType: process.env.MicrosoftAppType || '',
    MicrosoftAppTenantId: process.env.MicrosoftAppTenantId || '',
};
const botFrameworkAuth = new ConfigurationBotFrameworkAuthentication(config);
const adapter = new CloudAdapter(botFrameworkAuth);
const bot = new Agent();

app.post("/api/messages", (req, res) => {
    adapter.process(req, res, async (context) => {
        // @ts-ignore
        await bot.run(context, async (context) => {
            const userQuestion = context.activity.text;
            const answer = await bot.generateAnswer(userQuestion); // OpenAI integration
            await context.sendActivity(answer);
        });
    }).then(() => {
    });
});

app.listen(port, () => {
    console.log(`Bot is running on http://localhost:${port}`);
});
