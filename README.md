# GameVault v0.2 — Private Cloud

A premium, English-language, mobile-first video-game inventory for **five platforms**: PlayStation 5, PlayStation 4, Nintendo Switch 2, Nintendo Switch / OLED, and Windows PC.

**Architecture:** GitHub Pages (public static UI) + Firebase Authentication (Google login) + Cloud Firestore (private collection). No NAS, home IP, self-hosted service, or VPN is required.

## What's working

- Google sign-in and private, UID-gated Firestore sync across devices.
- Cover-first responsive library, platform views, search, sort, format filters, details.
- Quick Add with a small reference catalogue **or manual title**.
- Bulk Import by pasting game titles; manual metadata matches can be corrected later.
- One record per title/platform; physical + digital formats on the same record.
- Independent edition fields for physical/digital; editable with free-text override.
- Recoverable delete / restore (`deletedAt`); no hard deletion via security rules.
- PS4 backward-compatibility view in the PS5 section (opt-in per owned PS4 game).
- JSON/CSV export, private JSON import including first seven games.
- Firestore owner-UID gate shows a **copyable UID** on initial sign-in.

**Not implemented yet:** Full IGDB/RAWG live search, automatic US edition cover matching, image hosting/upload, managed edition picker from official stores, Cloudflare Workers. Existing cover URLs are candidates only, marked for review. Firebase setup is preconfigured from the user's supplied web app settings. The application is real, but only live validation in the user's Firebase project can confirm end-to-end login and Firestore access.

## Important: private data is NOT in the public repository

The distributable ZIP includes **only the application files**, never the user's owned games. The seven initial records are supplied separately as `GameVault_Private_Seed.json` and must be imported from the authenticated GameVault app **after owner rules are deployed**. Do not upload the seed JSON to GitHub.

## Deployment checklist (do these in order)

1. On GitHub, create a repository named `gamevault` (public visibility is compatible with free GitHub Pages), or use an existing one. Upload the **contents** of this folder at repository root (`index.html`, `app.js`, etc.), not the ZIP itself.
2. Under GitHub repo **Settings → Pages**, select **Deploy from a branch → main → /(root)** and save. Wait for GitHub Pages to report the published URL: `https://camushellraiser.github.io/gamevault/`.
3. In Firebase Console, keep **Authentication → Sign-in method → Google enabled** and **Authorized domains** containing `camushellraiser.github.io` (already configured by user).
4. Open the published GameVault URL and choose **Continue with Google**. The initial Firestore read will be denied (the current rules are `allow read, write: if false;`). This is **expected**.
5. GameVault displays your Firebase **UID**. Click **Copy UID**. Keep it private if convenient; it is an identifier, not a password.
6. In Firebase Console → **Firestore Database → Rules**, copy `firestore.rules` and replace the exact text `YOUR_FIREBASE_AUTH_UID` with the UID from step 5. **Publish**. Do **not** change the rule to `request.auth != null` alone; that would let every Google account access records.
7. Return to GameVault and click **Retry access**. The private collection will initially show zero records.
8. Click **Import JSON** and select the separate file `GameVault_Private_Seed.json`; confirm the import. Your seven games will be saved to Firestore.
9. Open GameVault on your iPhone and sign in with the **same Google account**. The library will sync through Firestore. For Home Screen installation, use Safari Share → Add to Home Screen.
10. Test one edition correction, physical + digital toggle, trash / restore, and JSON export. If satisfied, proceed to live game API integration.

## Security properties

- Firestore rules restrict `/users/{uid}/games/{gameId}` to exactly one pinned Firebase Auth UID and block all other paths. Irreversible delete is disabled.
- No owned game data or API server secrets are committed to the public repository. The Firebase web config (including `apiKey`) is a browser-app identifier **not a Firestore admin secret**.
- Google login alone does not grant access. Firestore rules are the real access control.
- Do not use the Firebase service account private key anywhere in this static app.
- Users without the configured owner UID cannot read or write the collection.
- External cover candidates load from third-party hosts. Their durability, region, edition and licensing remain unverified.
- This app only requests the user's own Firestore path and doesn't perform an automatic public inventory dump.

## Limitations and future work

- Live catalogue search still uses a small public reference list, plus manual input. Do **not** assume all platform editions are in its dropdown.
- The client currently stores metadata mostly as plain Firestore document fields; when adding a commercial game API, retain immutable owned-record IDs and separate edition fields.
- Firebase/Cloudflare free tiers have quotas, subject to change. No promise of indefinite cost-free operation is made.
- Firestore is cloud-only in this release; no local offline editing queue or conflict-resolution UI.
- `firestore.rules` is a **template**. Publishing it in Firebase Console is a separate manual step; including the file in GitHub does not deploy rules.

## Contents

- `index.html` — app shell
- `styles.css`, `cloud.css` — visual system and owner-login overlay
- `data.js` — public reference catalogue / five platform definitions, **no owned records**
- `app.js` — UI, Add, Edit, import, trash, filters, JSON/CSV exports
- `cloud.js` — Firebase Auth + Firestore adapter (SDK 13.4.0)
- `firestore.rules` — owner-only Firestore rules template; requires UID replacement in Firebase Console
- `manifest.webmanifest`, `assets/favicon.svg`, `.nojekyll` — PWA / GitHub Pages resources

## Public repo hygiene

Never commit `GameVault_Private_Seed.json`, private export backups, service-account JSON, passwords, Google OAuth client secrets, Cloudflare API tokens, or any Firebase Admin SDK credentials.
