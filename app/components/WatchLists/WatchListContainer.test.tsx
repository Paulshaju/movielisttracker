import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { movieStore } from "@/store/store";
import { WatchlistContainer } from "./WatchListContainer";
import { IMovieDetails } from "@/types";

// stubbing WatchlistCard out — we're testing the container's own logic here,
// not the card's rendering, and the real card pulls in a bunch of stuff we don't care about
vi.mock("./WatchListCard", () => ({
    WatchlistCard: ({ movieDetails }: { movieDetails: IMovieDetails }) => <div data-testid="watchlist-card">{movieDetails.Title}</div>,
}));

describe("WatchlistContainer", () => {
    beforeEach(() => {
        // reset the store between tests since it's a module-level singleton
        movieStore.watchlist = [];
    });

    it("shows the empty state when there's nothing in the watchlist", () => {
        render(<WatchlistContainer />);

        expect(screen.getByText("Your watchlist is empty")).toBeInTheDocument();
        expect(screen.queryByText("Watchlist")).not.toBeInTheDocument();
    });

    it("renders a card per movie once items are added", () => {
        movieStore.watchlist = [
            { imdbID: "tt1", Title: "The Matrix" } as any,
            { imdbID: "tt2", Title: "Inception" } as any,
        ];

        render(<WatchlistContainer />);

        expect(screen.getAllByTestId("watchlist-card")).toHaveLength(2);
        expect(screen.getByText("The Matrix")).toBeInTheDocument();
        expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    it("keeps the header count in sync with the list", () => {
        movieStore.watchlist = [{ imdbID: "tt1", Title: "The Matrix" } as any];

        render(<WatchlistContainer />);

        // this is the bit most likely to silently drift out of sync if someone
        // changes how watchlist items get added/removed later
        expect(screen.getByText("1")).toBeInTheDocument();
    });
});