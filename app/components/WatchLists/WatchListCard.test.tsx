import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  moveToWatched,
  removeFromList,
} from "@/store/store";
import { WatchlistCard } from "./WatchListCard";
import { proxy } from "valtio";

vi.mock("@/store/store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/store/store")>();
  return {
    ...actual,
    moveToWatched: vi.fn(),
    removeFromList: vi.fn(),
  };
});

// next/image wants real image optimization config we don't have in tests —
// swap it for a plain img so we can just assert on src/alt
vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

// WatchedButton presumably opens its own rating/note flow — not our concern here,
// we just need something we can click to trigger onConfirm
vi.mock("../../Common/WatchedButton", () => ({
  WatchedButton: ({ onConfirm }: any) => (
    <button onClick={() => onConfirm(4, "great movie")}>Mark watched</button>
  ),
}));

const baseMovie = {
  imdbID: "tt1375666",
  Title: "Inception",
  Year: "2010",
  Poster: "https://example.com/poster.jpg",
  Genre: "Action, Adventure, Sci-Fi",
  Runtime: "148 min",
  Plot: "A thief who steals corporate secrets...",
  Awards: "Won 4 Oscars.",
  Ratings: [{ Source: "Internet Movie Database", Value: "8.8/10" }],
} as any;

describe("WatchlistCard", () => {
  it("renders the movie's title, year, runtime and genre", () => {
    render(<WatchlistCard movieDetails={baseMovie} />);

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("2010")).toBeInTheDocument();
    expect(screen.getByText("148 min")).toBeInTheDocument();
    // only the first genre should show, not the full comma list
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.queryByText("Adventurae")).not.toBeInTheDocument();
  });

  it("shows the poster when one is available", () => {
    render(<WatchlistCard movieDetails={baseMovie} />);

    const img = screen.getByAltText("Inception");
    expect(img).toHaveAttribute("src", baseMovie.Poster);
    expect(screen.queryByText("N/A")).not.toBeInTheDocument();
  });

  it("falls back to the N/A placeholder when Poster is 'N/A'", () => {
    render(<WatchlistCard movieDetails={{ ...baseMovie, Poster: "N/A" }} />);

    expect(screen.getByText("N/A")).toBeInTheDocument();
    expect(screen.queryByAltText("Inception")).not.toBeInTheDocument();
  });

  it("falls back to the placeholder if the poster image fails to load", () => {
    render(<WatchlistCard movieDetails={baseMovie} />);

    const img = screen.getByAltText("Inception");
    fireEvent.error(img);

    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("skips runtime/genre/plot/awards rows when the data is missing or 'N/A'", () => {
    const sparseMovie = {
      ...baseMovie,
      Runtime: "N/A",
      Genre: "",
      Plot: "N/A",
      Awards: "N/A",
      Ratings: [],
    };

    render(<WatchlistCard movieDetails={sparseMovie} />);

    expect(screen.queryByText("148 min")).not.toBeInTheDocument();
    expect(screen.queryByText(/thief who steals/)).not.toBeInTheDocument();
  });

  it("calls removeFromlist with the correct imdbID when the X is clicked", () => {
    render(<WatchlistCard movieDetails={baseMovie} />);

    fireEvent.click(screen.getByLabelText("Remove Inception from watchlist"));

    expect(removeFromList).toHaveBeenCalledWith("watchlist", "tt1375666");
  });

  it("calls moveToWatched with the rating and note from WatchedButton", () => {
    render(<WatchlistCard movieDetails={baseMovie} />);

    fireEvent.click(screen.getByText("Mark watched"));

    expect(moveToWatched).toHaveBeenCalledWith("tt1375666", 4, "great movie");
  });
});
