import { describe, expect, it, beforeEach } from "vitest";
import { Movie } from "@/lib/types";
import { addToWatchlist, moveToWatched, movieStore, removeFromWatchlist } from "./store";

const paris: Movie = { imdbID: "tt0087884", title: "Paris, Texas", year: "1984", poster: "N/A" };

beforeEach(() => {
    movieStore.watchlist = [];
    movieStore.watched = [];
});

describe("addToWatchlist", () => {
    it("adds a movie to the watchlist", () => {
        addToWatchlist(paris);
        expect(movieStore.watchlist).toHaveLength(1);
    });

    it("does not add the same movie twice", () => {
        addToWatchlist(paris);
        addToWatchlist(paris);
        expect(movieStore.watchlist).toHaveLength(1);
    });
});

describe("moveToWatched", () => {
    it("moves a movie from watchlist to watched with a rating and note", () => {
        addToWatchlist(paris);
        moveToWatched("tt0087884", 4, "Wenders at his best");
        expect(movieStore.watchlist).toHaveLength(0);
        expect(movieStore.watched[0]).toMatchObject({ imdbID: "tt0087884", rating: 4, note: "Wenders at his best" });
    });

    it("does nothing if the movie isn't on the watchlist", () => {
        moveToWatched("not-there", 5);
        expect(movieStore.watched).toHaveLength(0);
    });
});

describe("removeFromWatchlist / removeFromWatched / updateWatched", () => {
    it("removes and updates correctly", () => {
        addToWatchlist(paris);
        removeFromWatchlist("tt0087884");
        expect(movieStore.watchlist).toHaveLength(0);
    });
});