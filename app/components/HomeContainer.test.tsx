import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addToWatchlist, movieStore } from "@/store/store";
import { HomeContainer } from "./HomeContainer";
import { proxyMap } from "valtio/utils";
import { IPlaylistListItem } from "@/types";

beforeEach(() => {
  movieStore.playlists = proxyMap<string, IPlaylistListItem[]>([
    ["watched", []],
    ["watchlist", []],
  ]);
  movieStore.tags = proxyMap<string, string[]>([["must-watched", []]]);
});

describe("HomeContainer", () => {
  it("renders all three tabs with zero counts initially", () => {
    render(<HomeContainer />);
    expect(screen.getByRole("tab", { name: /search/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /watchlist \(0\)/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /watched \(0\)/i }),
    ).toBeInTheDocument();
  });

  it("shows an empty state on the watchlist tab when nothing has been added", async () => {
    const user = userEvent.setup();
    render(<HomeContainer />);
    await user.click(screen.getByRole("tab", { name: /watchlist/i }));
    expect(screen.getByText(/your watchlist is empty/i)).toBeInTheDocument();
  });

  it("reflects an added Movie's title and count on the watchlist tab", async () => {
    const user = userEvent.setup();
    addToWatchlist({
      imdbID: "tt0087884",
      Title: "Paris, Texas",
      Year: "1984",
      Poster: "N/A",
      Rated: "",
      Released: "",
      Runtime: "",
      Genre: "",
      Director: "",
      Writer: "",
      Actors: "",
      Plot: "",
      Language: "",
      Country: "",
      Awards: "",
      Ratings: [],
      Metascore: "",
      imdbRating: "",
      imdbVotes: "",
      Type: "movie",
      DVD: "",
      BoxOffice: "",
      Production: "",
      Website: "",
      Response: "True",
      addedAt: new Date().toDateString(),
    });
    render(<HomeContainer />);
    await user.click(screen.getByRole("tab", { name: /watchlist \(1\)/i }));
    expect(screen.getByText("Paris, Texas")).toBeInTheDocument();
  });
});
