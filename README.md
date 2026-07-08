# Movie List Tracker

A Next.js app for searching movies, building watchlists, and tracking what you've watched — with ratings, notes, and tags.

## Features

- **Search** — look up movies and shows via the [OMDb API](https://www.omdbapi.com/), with pagination.
- **Watchlist & Watched** — add movies to a default watchlist, then move them to "watched" with your own rating and notes.
- **Custom lists** — create, rename, and delete your own lists beyond the built-in watchlist/watched lists.
- **Tags** — tag movies with preset tags (e.g. "date night", "rewatch", "classic") or your own, with tag suggestions drawn from previously used tags.
- **Local persistence** — all lists and tags are stored in `localStorage`, so your data survives page reloads without a backend.

## Tech Stack

- [Next.js](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Valtio](https://github.com/pmndrs/valtio) for client-side state management
- Tailwind CSS + [shadcn](https://ui.shadcn.com/) components
- [Vitest](https://vitest.dev/) + Testing Library for tests, [MSW](https://mswjs.io/) for API mocking

## Getting Started

### 1. Install dependencies

This project uses pnpm:

```bash
pnpm install
```

### 2. Configure environment variables

Get a free API key from [OMDb](https://www.omdbapi.com/apikey.aspx) and add it to `.env.local`:

```bash
NEXT_OMDB_API_KEY=your_api_key_here
```

### 3. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

| Command              | Description                    |
| -------------------- | ------------------------------ |
| `pnpm dev`           | Start the development server   |
| `pnpm build`         | Build for production           |
| `pnpm start`         | Run the production build       |
| `pnpm lint`          | Lint the codebase              |
| `pnpm test`          | Run tests once                 |
| `pnpm test:watch`    | Run tests in watch mode        |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm test:ui`       | Run tests with the Vitest UI   |

## Project Structure

```
app/
  api/                  # Server actions for OMDb API calls
  components/
    MovieSearch/        # Search bar + results + pagination
    WatchLists/          # Watchlist UI
    WatchedList/         # Watched list UI
    AddToLists/          # Add-to-list / custom list management UI
  consts/                # Preset tags and other constants
store/
  store.ts               # Valtio store: playlists, tags, persistence to localStorage
types/
  index.ts                # Shared TypeScript types (movies, playlist items, store shape)
```

## Notes

- Movie data is sourced from the OMDb API; search requires a query of at least 3 characters.
- The `watched` and `watchlist` lists are protected — they can't be renamed or deleted, unlike custom lists.
