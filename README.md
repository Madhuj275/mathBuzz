# Mathbuzz Daily Challenge

Mathbuzz is a daily math puzzle game. Solve the target equation to earn XP, build streaks, unlock badges, and compete on the weekly leaderboard.

## Features

- Daily equation puzzles with color-coded guess feedback
- XP, levels, streaks, badges, and a weekly leaderboard
- Username/password authentication
- Server-side validation for submissions and rewards
- Responsive CRT-vaporwave arcade interface, with reduced-motion support

## Tech stack

- Next.js 16, React 19, and TypeScript
- Tailwind CSS 4 and Radix UI
- NextAuth.js authentication
- Prisma ORM with PostgreSQL
- Biome for linting and formatting

## Run locally

### Requirements

- Node.js 20.9 or newer
- Yarn Classic (1.22)
- A PostgreSQL database and its connection URL
- Git

### 1. Clone the repository

Replace `<repository-url>` with this repository's Git URL:

```sh
git clone <repository-url>
cd mathbuzz
```

### 2. Install dependencies

```sh
yarn install 
```

If Yarn Classic is not installed, enable it with Corepack:

```sh
corepack enable
corepack prepare yarn@1.22.22 --activate
```

### 3. Configure environment variables

Copy the example file to `.env` (PowerShell):

```powershell
Copy-Item env.example .env
```

Or in macOS/Linux:

```sh
cp env.example .env
```

Edit `.env` and set `DATABASE_URL` to your PostgreSQL connection string, for example:

```env
DATABASE_URL="postgresql://localhost:5432/mathler?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="paste-a-generated-secret-here"
```

Replace the local database URL with the connection URL for your PostgreSQL server if it is not running locally. Generate a secret with Node.js:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Set up the database

Apply the Prisma schema to the database specified by `DATABASE_URL`:

```sh
yarn db:push
```

### 5. Start the app

```sh
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
| --- | --- |
| `yarn dev` | Start the development server |
| `yarn build` | Build the production app |
| `yarn start` | Run the production build |
| `yarn lint` | Check the project with Biome |
| `yarn format` | Format files with Biome |
| `yarn db:push` | Apply the Prisma schema to the database |
| `yarn db:studio` | Open Prisma Studio |

## Game rules

- Each guess is a six-character equation that includes at least one `+`, `-`, `*`, or `/` operator.
- The equation must evaluate to the puzzle's target; multiplication and division follow standard operator precedence.
- Numbers and operators may be reused. Equivalent commutative solutions are accepted.
- To load a specific day's puzzle, add `?date=YYYYMMDD` or `?date=YYYY-MM-DD` to the URL.

## Project structure

```text
prisma/          Prisma schema
public/          Static images and icons
src/app/         Next.js pages, layout, and API routes
src/components/  Game and UI components
src/hooks/       React hooks
src/lib/         Shared utilities and Prisma client
src/providers/   Game state providers
src/types/       Shared TypeScript types
src/utils/       Puzzle validation and game logic
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for hosting guidance.

## Weekly leaderboard scoring

Completed daily results are submitted to `POST /api/leaderboard/weekly` with a
`guesses` array and an optional `date` (`YYYYMMDD` or `YYYY-MM-DD`). The server
validates each guess against that day's puzzle and determines whether it was
solved; client-supplied scores or win flags are not trusted. A solved game earns
50 XP plus 5 XP for each unused guess. An unsuccessful game earns 5 XP per
valid guess. A streak of at least seven days multiplies game XP by 1.5 (rounded
down). The weekly leaderboard ranks players by XP logged from Monday through
Sunday in UTC; equal scores are ordered alphabetically by username.
