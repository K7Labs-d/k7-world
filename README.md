# عالم خالد · K7 World

عالم ثلاثي الأبعاد بالعربية: كوكب للمهام، كوكب للمشاريع، ومعرض صور، مع نجوم
متعددة الطبقات ومجرة حلزونية. الشيفرة متاحة برخصة MIT.

Arabic-first 3D personal workspace with procedural planets, layered stars,
a spiral galaxy, task and project-link management, and an image gallery.
Built with React, Three.js, vinext, and local Cloudflare D1/R2 emulation.

## What is included

- The original application UI, galaxy/planet shaders, API handlers, and schema
- Touch orbit/zoom, keyboard-accessible navigation, reduced-motion support,
  WebGL fallback, image upload, and reversible soft deletion
- Local-only mock sign-in and empty local storage for development
- MIT license and preserved third-party attribution notices

No personal tasks, saved links, uploaded images, credentials, deployment IDs,
or prior Git history are included. Opening this project does not connect to
the author's private Site or its data.

## Local development

Use Node.js 22.13 or newer. From this directory:

```sh
npm ci
npm run db:migrate:local
npm run dev
```

Open http://127.0.0.1:5173. The local sign-in route creates a fixed demonstration
identity automatically. It does not sign in to a real account. D1 and R2 are
emulated on your machine; local content stays in ignored `.wrangler/` state.
The all-zero database ID in `wrangler.jsonc` is an inert local placeholder.
No cloud account or production database is configured.

```sh
npm run typecheck
npm run lint
npm run build
```

Schema changes: edit `db/schema.ts`, run `npm run db:generate`, then apply new
local migrations. Never rewrite an already-applied migration.

## Production authentication is intentionally unconfigured

This is a runnable local development/source release, not a turnkey public
multi-user hosting service. The original hosted Site relies on its platform's
trusted sign-in gateway. `app/chatgpt-auth.ts` consumes authenticated identity
headers supplied by that gateway; those headers are not proof of identity on
an arbitrary public server.

`build/worker.ts` therefore returns HTTP 503 in production builds until a
maintainer implements and verifies real authentication. Do not simply remove
that guard. For your own deployment, verify sessions/tokens server-side,
replace the identity adapter, reject untrusted identity headers, enforce
owner isolation, provision your own DB and bucket, and run security tests.

Never expose or tunnel the development server. Mock sign-in is intended only
for loopback, with one demonstration identity. Browser automation tools
registered through experimental WebMCP can access the current session's
content and create tasks; use trusted browser agents only.

## Main files

- `app/scene.tsx`: planets, interaction, and camera
- `app/cosmos.ts`: layered stars and galaxy
- `app/world.tsx`: Arabic workspace interface
- `app/api/`: task/link and image handlers
- `db/` and `drizzle/`: schema, owner-scoped queries, and migrations
- `build/local-auth.ts`: loopback-only demonstration sign-in

## License

MIT for the original code. See `LICENSE` and `THIRD_PARTY_NOTICES.md`.
Dependencies keep their own licenses. This release does not include private
content or grant rights to someone else's uploaded files.
