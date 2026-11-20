# GameVault v0.4 — Smart Catalog Workflow

Built on top of the existing private Firebase/Firestore library. No migration or new services needed. The Plex-style cover art gallery is deliberately unchanged.

## Changes

- **Add Game:** selected IGDB/reference game details now hydrate the edit form before saving, updating year, publisher and available editions. A manual edition can always be entered when the API has no reliable edition. No cover is approved as US automatically.
- **Edit Game:** original record IDs and ownership are preserved; the existing edit form and cover gallery remain available.
- **Bulk Import:** up to 50 unique titles per batch (case-insensitive duplicate checks), exact IGDB/platform matches, review screen with format, edition and Skip controls, safe merging into already-owned games, IGDB metadata enrichment before writing to Firestore, and an explicit confirmation.
- **Safety:** an existing format's edition is never silently overwritten. A missing physical/digital format can be added to an existing record. No new game is saved until confirmation. The client's bulk import rolls back its in-memory draft if Firebase reports a failure.
- **Mobile:** batch review rows and action buttons fit a narrow screen.

## Known limitations

- IGDB does not always enumerate special editions. The selector offers returned/curated edition names, but manual entry remains available. The UI does not claim that an edition not returned by IGDB does not exist.
- The date from IGDB can be the game's first release, not necessarily its release on the selected platform.
- IGDB covers may have unknown region; GameVault does not mark them as verified US artwork without your review.
- Live testing here used a simulated IGDB endpoint and simulated Firebase storage; production IGDB/Twitch credentials and Firebase were not accessed from tests.

## Deployment

Update these five files on the existing `camushellraiser/gamevault` main branch: `app.js`, `discovery.js`, `discovery.css`, `index.html`, `README.md`. The existing Firebase rules, Cloudflare Worker, `cloud.js`, `data.js`, and your private inventory do not need changing.

Current app: https://camushellraiser.github.io/gamevault/
