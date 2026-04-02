# RevenueOS AI

A multi-page dashboard starter built with Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui, and Recharts.

## Stack

- Next.js 16 with the App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Recharts

## Local Setup

1. Install Node.js 20.11+ and npm.
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```text
app/
  (dashboard)/
components/
  dashboard/
  ui/
lib/
public/
```

- `app/`: App Router entrypoints, layouts, and page routes.
- `components/dashboard/`: Dashboard-specific layout and presentational components.
- `components/ui/`: Reusable shadcn/ui primitives.
- `lib/`: Shared utilities and mock dashboard data.
- `public/`: Static assets served by Next.js.

## Scripts

- `npm run dev`: Start the local development server.
- `npm run build`: Create a production build.
- `npm run start`: Run the production build.
- `npm run lint`: Run ESLint.
