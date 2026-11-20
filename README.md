# GameVault v0.3 — Smart Library

Personal, private, mobile-first video game inventory. Hosted at `https://camushellraiser.github.io/gamevault/` using GitHub Pages + Firebase Authentication + Firestore. **No NAS, fixed IP, home server or paid hosting is required.**

## What changed in v0.3

- **Smart Add:** live title suggestions from Wikidata, platform-filtered curated matches, and optionally IGDB. Explicitly warns when a source does not validate the selected platform.
- **Smart Edit:** choosing a suggested game title corrects its name and recovers available metadata in the edit form while **preserving the existing Firestore record ID, physical/digital ownership and editions**.
- **Restore Metadata:** optional re-fetch of verified source fields (year, publisher, developer, genre). Missing fields are never fabricated.
- **Browse Covers:** Plex-style candidate gallery. Select an image visually, preview it, then save it; the gallery does **not** silently mark artwork as an authentic US platform-specific cover.
- **Smart Bulk Import:** paste up to 50 titles per batch, match through the same discovery layer, review format and matches before applying.
- **Cloud compatibility:** newly introduced `metadataSource`, `metadataId`, `metadataVerified`, and `coverSource` are persisted in Firestore. Old documents remain compatible. No automatic migration or destructive update is needed.
- An **optional** Cloudflare Worker implementation (`worker/`) supports IGDB live search, multiple cover variants, and edition data, with secrets stored server-side and Firebase owner authentication on every request.

## Current catalog data availability

| Capability | Works immediately after website update | With IGDB Worker deployed |
|---|---|---|
| Reference suggestions for known games | Yes | Yes |
| Live public title search via Wikidata | Yes, when Wikidata API is reachable | Yes, fallback |
| Platform filtering | Reference titles only | IGDB platform IDs |
| Automatic publisher/year | For reference titles and some Wikidata years | Richer IGDB fields |
| Cover gallery | Existing artwork and compatible reference candidates | IGDB game and localized covers added |
| Editions | Known manually curated editions, editable at any time | IGDB game-version suggestions if recorded |
| Verified US PS5 / Switch box art | No — requires review | Not guaranteed: verify art before approval |

**Important:** For live IGDB cover suggestions, the Worker MUST be configured. The GitHub Pages frontend cannot directly call IGDB with a private Twitch secret. Avoid putting Twitch Client Secret in this repository, client JS, Firebase config or screenshots. Sources may lack region/platform coverage; the app never claims to verify artwork automatically.

## No need to recreate GitHub / Firebase

1. Your repo `camushellraiser/gamevault`, Google Authentication, Firestore and Pages are **already created**.
2. Deploy updated frontend files to the same repository / branch (e.g. merge the `gamevault-v0.3-smart-library` PR). This updates the UI automatically.
3. Reload the published site. Your Firestore inventory remains **unchanged**. You should still see the same seven initial games.
4. Open the Spider-Man entry → **Edit Game** → search `Spider-Man 2` → select the result → inspect metadata → **Save Changes**. The record ID and ownership do not change.
5. Open Resident Evil Requiem → **Edit Game** → **Browse Covers**. Until the Worker is deployed, the gallery displays current/reference candidates, not the full IGDB feed.

## Enable richer IGDB results when ready (one-time optional setup)

See [worker/README.md](worker/README.md). Requirements: a free Twitch developer application (IGDB API) and a Cloudflare account to deploy the Worker; Cloudflare free usage thresholds apply. You must configure the Worker before gallery suggestions can include all available IGDB cover variants. A user login session does **not** authorize others: the Worker verifies Firebase-signed JWT tokens, project ID and exact owner UID.

## Safety and scope

- The **private inventory is in Firestore**, never in the GitHub repository.
- Ownership records are never replaced by a catalog lookup; the change is saved only after explicit user action.
- The catalog API Worker is optional and secrets are excluded from version control.
- The public website includes Firebase web app config, which is not a service-account key.
- `firestore.rules` in the repository is a **template**, not deployed by GitHub Pages; don't replace existing Firebase rules without validating them first.
- No official platform/edition cover is considered US-verified unless you explicitly approve it.
- Metadata from Wikidata may be incomplete; suggestions aren't proof that a game exists for the selected console.
- Third-party images may cease to be accessible later. A chosen URL is stored in Firestore; no image file is currently copied to Firebase Storage.

## Files

- `index.html`, `styles.css`, `cloud.css` — app shell and premium UI
- `app.js` — inventory, smart Add / Edit / Bulk, search, trash, export
- `discovery.js`, `discovery-config.js`, `discovery.css` — title suggestions, metadata retrieval, gallery
- `cloud.js` — Google login + Firestore with owner-only access
- `data.js` — public reference catalog entries only, **not** your owned games
- `worker/` — optional secure IGDB proxy, separate deployment
