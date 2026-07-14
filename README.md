<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bf9d82a2-24c7-47bf-8733-cb9103a5cb79

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## API documentation

The complete HTTP surface, request conventions, endpoint catalog, FinanceOS examples,
and known compatibility routes are documented in [docs/API_REFERENCE.md](docs/API_REFERENCE.md).
The running server also exposes its currently registered OpenAPI document at
`GET /api/openapi-spec`.

Run `npm run docs:check` whenever routes change. The check fails if an Express route
is missing from the API reference.
