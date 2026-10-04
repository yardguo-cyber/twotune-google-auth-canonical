# @twotune/google-auth-canonical

Single source of truth for TwoTune Google sign-in, provider linking, collision handling, and UID-safe link flows.

## Versioning

Bump **`version`** in `package.json` for every canonical behavior change. Web and Collection must pin the same version in their `dependencies`.

## Local consumption (current)

Both apps declare:

```json
"@twotune/google-auth-canonical": "file:../twotune-google-auth-canonical"
```

(Collection uses a relative path to this folder from its repo root.)

Run `npm install` in each app after changing this package.

## Production CI

See **[PRODUCTION-DEPENDENCY.md](./PRODUCTION-DEPENDENCY.md)** for GitHub repo `yardguo-cyber/twotune-google-auth-canonical`, tag `v1.0.0`, and **commit SHA–pinned** `package.json` syntax for Web and Collection.

Local dev may still use `file:` until both apps switch to the same GitHub SHA in one coordinated change.

## Web static hosting

The browser loads `firebase-client.js` as native ESM. After `npm install`, run Web’s `materialize:google-auth-canonical` script so the installed package is exposed under `assets/js/vendor/` (build output only — not a second maintained source tree).
