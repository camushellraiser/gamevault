# GameVault v0.4 — iPhone sign-in fix

This update keeps Smart Add, IGDB metadata, bulk import, the existing cover gallery and Firebase inventory unchanged.

### Fixed
- Firebase Google popup now starts synchronously from the user's tap.
- Login stuck on `Opening Google...` recovers after a 15-second watchdog.
- Safari guidance and copyable URL are shown when a standalone iPhone Home Screen app cannot complete popup authentication.
- CSS and module URL cache-busted to load the new client-side authentication code.

### Not changed
- Firebase security rules, Firestore documents, Twitch / Cloudflare secrets, your seven games, and existing catalog search sources.

### Validation
- JavaScript syntax checked locally and GitHub files verified.
- Real-world iOS Safari / standalone login still requires user verification after deployment.
