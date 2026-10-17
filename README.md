# QuadAnon

QuadAnon is a pseudonymous campus community web app for university students. Its interface brings together campus posts, short-form media, direct messages, issue reporting, and academic resources.

> **Development status:** Authentication uses Supabase anonymous sign-in and profile rows. Feed, moderation, and messaging features still contain in-memory demo interactions and are not yet fully connected to database storage.

## Features

- **Whispers** (`/whispers`): campus media/reel feed with discussions.
- **The Quad** (`/quad`): campus discussion feed with posts and polls.
- **Shadow DMs** (`/dms`): interface for pseudonymous direct messages.
- **The Radar** (`/radar`): campus issue and grievance tracker.
- **The Library** (`/library`): shared academic resource catalog.
- **Profile and campus identity:** pseudonymous profile stored in the Supabase `profiles` table and launch campus information.
- **Moderation UI** (`/admin`): moderation dashboard route.
- **Privacy page** (`/privacy`), theme toggle, and installable progressive web app (PWA) support.

The launch campus shown in the app is The Co-operative University of Kenya (CUK).

## Run locally on Windows

### 1. Open the project

Open the repository folder in Visual Studio Code. In VS Code, choose **Terminal → New Terminal**. Make sure the terminal is in the project root—the folder containing `package.json`.

Alternatively, open PowerShell and change to the folder where you downloaded the project:

```powershell
cd "C:\path\to\Quad-Anon"
```

### 2. Install Bun and project dependencies

This project includes a `bun.lock` lockfile, so Bun is the recommended package manager. If Bun is installed, run:

```powershell
bun install
```

If the `bun` command is not recognized, install Bun using the instructions at [bun.sh](https://bun.sh), reopen the terminal, and run `bun install` again.

### 3. Start the development server

```powershell
bun run dev
```

When Vite reports that the server is ready, open **http://localhost:3000** in your browser. Leave the terminal open while using the app; press **Ctrl+C** in that terminal to stop the server.

The VS Code **Run and Debug** configuration named **Launch Integrated Browser against localhost** also opens `http://localhost:3000`.

If port 3000 is already in use, stop the other process using it or change the port in the `dev` script in `package.json`, then open the new URL Vite prints.

## Supabase configuration

The repository contains Supabase database migrations and an environment-variable template. To connect a Supabase project:

1. Create a Supabase project and enable anonymous sign-ins in its Auth settings.
2. Copy `.env.example` to `.env` in the project root:

   ```powershell
   Copy-Item .env.example .env
   ```

3. In `.env`, set the project URL and public anon key from the Supabase project settings:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-public-anon-key
   ```

4. Restart the Vite server after changing environment variables.
5. To create the database schema, install the Supabase CLI, authenticate and link the project, then apply the migrations in `supabase/migrations` with `supabase db push`. Follow the CLI prompts if this is the first Supabase CLI setup for the repository.

Only use the **public anon key** in `VITE_SUPABASE_ANON_KEY`. Variables prefixed with `VITE_` are bundled into frontend code. Never put a Supabase service-role key, email hash secret, or other server-side secret in a `VITE_` variable or commit it to the repository. The `.env*` files are ignored by Git except `.env.example`.

The app requires the Supabase URL and public anon key to create a Supabase anonymous session and save a profile. Supabase persists the auth session; the profile itself is fetched from the `profiles` table and is not stored in app local storage. The remaining content features are still demo interactions until their data flows are connected to the database and verified against the row-level security policies.

## Useful commands

Run these from the repository root:

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the local Vite development server on port 3000 |
| `bun run build` | Create a production build in `dist/` |
| `bun run preview` | Preview the production build locally |
| `bun run test` | Run the Vitest test suite |
| `bun run typecheck` | Check TypeScript types |
| `bun run lint` | Run ESLint on `src/` |
| `bun run format:check` | Check formatting in `src/` |

Build before previewing:

```powershell
bun run build
bun run preview
```

Open the local URL printed by Vite's preview command.

## Technology

- React 19 and TypeScript
- Vite 8
- Tailwind CSS 4
- React Router
- TanStack Query
- Supabase JavaScript client and PostgreSQL migration files
- Vitest and ESLint

## Project layout

```text
.
├── public/                 # PWA manifest and app icon
├── src/
│   ├── components/         # Shared layout, modals, theme, and UI components
│   ├── features/           # Auth, Whispers, Quad, DMs, Radar, Library, admin
│   ├── hooks/              # React hooks, including PWA install support
│   ├── lib/                # Supabase client, query client, storage, utilities, tests
│   ├── routes/             # Route definitions and standalone pages
│   └── App.tsx             # Application providers and router entry
├── supabase/
│   └── migrations/         # Database schema, RLS, triggers, and related SQL
├── .env.example            # Environment-variable template
├── package.json            # Scripts and dependencies
└── vite.config.ts          # Vite configuration
```

## Troubleshooting

- **`bun` is not recognized:** Install Bun, close and reopen PowerShell or the VS Code terminal, then try again.
- **`localhost:3000` does not load:** Check that `bun run dev` is still running and use the exact URL printed by Vite.
- **Port 3000 is occupied:** Stop the process using it or change the port in `package.json`.
- **Supabase authentication unavailable:** Check that `.env` exists, both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly, anonymous sign-ins are enabled in Supabase Auth, and restart the dev server. Content feature flows are still demo implementations.
