# S.T.A.R.K - Slick Technical Assistant Resolving Knowledge

S.T.A.R.K is a local Microsoft Teams bot that answers questions using your documentation files and OpenAI.
It currently performs local retrieval from `.mdx` docs and sends context-grounded prompts to an LLM for responses.

## What It Does Today

- Exposes a bot endpoint at `POST /api/messages`.
- Receives user messages from Microsoft Teams.
- Loads docs from a local folder (`../docs/content`), embeds question + docs with OpenAI embeddings, and ranks relevance with cosine similarity.
- Sends top-ranked context to OpenAI Chat Completions and returns the answer.
- If no answer is produced, returns: `I'm sorry, I couldn't find an answer to your question.`

## Planned Direction (Not Yet Implemented)

- Persist and query embeddings in Pinecone instead of embedding docs on every request.
- Make documentation path configurable through an environment variable (instead of hardcoding `../docs/content`).

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm
- Microsoft Teams Developer Portal access
- Azure access to manage your bot identity (Microsoft Entra app)
- ngrok
- OpenAI API key

## Environment Variables

Create `src/.env`:

```env
PORT=3978
BOT_ID=your-microsoft-app-client-id
BOT_PASSWORD=your-microsoft-app-client-secret
OPENAI_API_KEY=your-openai-api-key

# Optional/tenant-specific (currently read by server.ts if present)
MicrosoftAppType=
MicrosoftAppTenantId=
```

### How to Get `BOT_ID`

`BOT_ID` must be the Microsoft App ID (Application/Client ID) used by your bot.

1. Open your bot in Azure Portal.
2. Go to `Settings` -> `Configuration`.
3. Select `Manage` to open the linked Microsoft Entra app.
4. Copy `Application (client) ID`.
5. Set that value as `BOT_ID` in `src/.env`.

Important: do not use the Teams app manifest ID for `BOT_ID`.

Reference: [Azure Bot Service overview](https://learn.microsoft.com/azure/bot-service/bot-service-overview)

### How to Get `BOT_PASSWORD`

`BOT_PASSWORD` must be the client secret value from the same Entra app as `BOT_ID`.

1. Open the linked Microsoft Entra app.
2. Go to `Certificates & secrets`.
3. Create a new client secret.
4. Copy the secret value immediately.
5. Set that value as `BOT_PASSWORD` in `src/.env`.

Reference: [Register a Microsoft Entra app and create secrets for bots](https://learn.microsoft.com/microsoftteams/platform/bots/how-to/authentication/add-authentication)

### How to Get `OPENAI_API_KEY`

1. Go to OpenAI API keys management in your OpenAI account.
2. Create a new API key.
3. Copy the key and set it as `OPENAI_API_KEY` in `src/.env`.

Reference: [OpenAI API keys](https://platform.openai.com/api-keys)

## Documentation Source

Current code expects documentation files in:

- `../docs/content` (relative to `src/`)
- file type: `.mdx`

Example layout:

```text
project-root/
  src/
  docs/
    content/
      intro.mdx
      guides/
        setup.mdx
```

## Install and Run

1. Install dependencies:

```bash
npm install
```

2. Start the bot server:

```bash
npm run start
```

3. In a second terminal, expose the local port:

```bash
ngrok http 3978
```

If you changed `PORT`, use that value with ngrok.

### ngrok Setup (First-Time)

1. Install ngrok.
2. Sign in to ngrok and copy your authtoken.
3. Configure your machine once:

```bash
ngrok config add-authtoken <YOUR_NGROK_AUTHTOKEN>
```

4. Start your app (`npm run start`).
5. Run `ngrok http <PORT>` (for example, `ngrok http 3978`).
6. Copy the HTTPS forwarding URL shown by ngrok.

Reference: [ngrok getting started](https://ngrok.com/docs/getting-started/)

## Configure in Microsoft Teams

1. Go to Teams Developer Portal: `https://dev.teams.microsoft.com/apps`
2. Create a new app (or open existing).
3. Add a bot.
4. Set messaging endpoint to:

```text
https://<your-ngrok-subdomain>.ngrok.io/api/messages
```

5. Copy bot credentials and place them in `src/.env`.
6. Download app package from the portal.
7. Upload/install the package in Teams (`Apps` section).

If you restart ngrok and get a new URL, update the messaging endpoint again.

Reference: [Manage your apps in Teams Developer Portal](https://learn.microsoft.com/microsoftteams/platform/concepts/build-and-test/manage-your-apps-in-developer-portal)

## Quick Verification

- Open the installed app in Teams.
- Send a question that is covered by your `.mdx` docs.
- Confirm you receive a response grounded in your documentation.

## Known Limitations

- Pinecone is listed as a dependency but is not used in runtime retrieval yet.
- Docs path is currently hardcoded to `../docs/content`.
- Embedding docs on each question can increase response time and token cost.

## Reference Links

- Teams Developer Portal: https://dev.teams.microsoft.com/apps
- Teams app management docs: https://learn.microsoft.com/microsoftteams/platform/concepts/build-and-test/manage-your-apps-in-developer-portal
- Azure Bot Service overview: https://learn.microsoft.com/azure/bot-service/bot-service-overview
- Bot authentication and Entra app setup: https://learn.microsoft.com/microsoftteams/platform/bots/how-to/authentication/add-authentication
- ngrok getting started: https://ngrok.com/docs/getting-started/
- OpenAI API keys: https://platform.openai.com/api-keys
