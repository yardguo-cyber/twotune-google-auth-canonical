# Production dependency (GitHub, immutable)

## Repository (to be created)

- **GitHub:** `yardguo-cyber/twotune-google-auth-canonical`
- **Package:** `@twotune/google-auth-canonical`
- **Release:** `package.json` version `1.0.0`, git tag `v1.0.0`

After the first release commit is tagged, record the **full commit SHA** for `v1.0.0`:

```bash
git rev-parse v1.0.0^{commit}
```

## Recommended `package.json` dependency (Web and Collection)

Pin the **exact commit**, not a branch. Use the same SHA in both apps.

```json
{
  "dependencies": {
    "@twotune/google-auth-canonical": "github:yardguo-cyber/twotune-google-auth-canonical#<FULL_COMMIT_SHA>"
  }
}
```

Equivalent forms npm accepts (pick one style; keep SHA identical in Web and Collection):

```json
"@twotune/google-auth-canonical": "git+https://github.com/yardguo-cyber/twotune-google-auth-canonical.git#<FULL_COMMIT_SHA>"
```

**Do not use** for production:

- `github:yardguo-cyber/twotune-google-auth-canonical#main`
- `#master`, `#latest`, or any moving branch ref **without** a commit SHA
- Relying on tag alone without verifying lockfile `resolved` commit (tags can be moved; SHA pin is integrity)

The git **tag** `v1.0.0` is for humans and release notes; **package.json + lockfile** should pin `<FULL_COMMIT_SHA>`.

Placeholder until the remote repo exists:

```json
"@twotune/google-auth-canonical": "github:yardguo-cyber/twotune-google-auth-canonical#REPLACE_AFTER_v1.0.0_TAG"
```

Replace `REPLACE_AFTER_v1.0.0_TAG` with the 40-character commit hash from `git rev-parse`.

## Web (Cloudflare Pages)

1. Build command must include **`npm ci`** or **`npm install`** (not a static-only deploy with no install).
2. **`postinstall`** runs `materialize:google-auth-canonical` → writes `assets/js/vendor/twotune-google-auth-canonical.mjs` (gitignored).
3. Deploy artifact must include that vendor file from the install step; no sibling `file:` folder on the build machine.

## Collection (Vercel / Node CI)

1. **`npm ci`** / **`npm install`** resolves `@twotune/google-auth-canonical` from GitHub into `node_modules`.
2. Next.js bundles from `node_modules` at build time; no vendor copy in the app repo.

## Lockfiles

After switching from local `file:` to GitHub SHA:

- Commit **`package-lock.json`** in Web and Collection.
- Confirm both lockfiles list the **same** `resolved` git URL / commit for `@twotune/google-auth-canonical@1.0.0`.

## Local development (until GitHub pin is merged)

Keep using `file:` paths to this directory; switch both apps to the GitHub SHA pin in the same PR when the canonical repo is live.
