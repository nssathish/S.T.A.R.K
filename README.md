# S.T.A.R.K - Slick Technical Assistant Resolving Knowledge

A local Microsoft Teams bot (RAG based AI agent) named Agent that uses OpenAI and Pinecone to
answer questions from Docusaurus docs.

# Teams Development

- Go to https://dev.teams.microsoft.com/apps and create a new app.
- Go to the App
- Add a bot and set the messaging endpoint to `https://<your-ngrok-subdomain>.ngrok.io/api/messages`
- Add a secret to the bot and copy it.
- Go to the Apps. Click the ellipsis next to the app and select "Download app package".
- Open teams app or via the browser.
- Upload the app package you just downloaded to the teams app in the 'Apps' section (in the left sidebar).

# How to Run

- terminal tab 1 -> `cd src; sudo tsx server.ts`
- terminal tab 2 -> `ngrok http 3978`
