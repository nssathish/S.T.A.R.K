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
- ngrok
- OpenAI API key

## Environment Variables

Create `src/.env`:

```env
PORT=3978
BOT_ID=your-bot-app-id
BOT_PASSWORD=your-bot-password
OPENAI_API_KEY=your-openai-api-key

# Optional/tenant-specific (currently read by server.ts if present)
MicrosoftAppType=
MicrosoftAppTenantId=
```

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

## Quick Verification

- Open the installed app in Teams.
- Send a question that is covered by your `.mdx` docs.
- Confirm you receive a response grounded in your documentation.

## Known Limitations

- Pinecone is listed as a dependency but is not used in runtime retrieval yet.
- Docs path is currently hardcoded to `../docs/content`.
- Embedding docs on each question can increase response time and token cost.
