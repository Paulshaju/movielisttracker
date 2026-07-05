import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

beforeEach(() => {
  library.watchlist = [];
  library.watched = [];
});

describe("MovieApp", () => {
  it("renders all three tabs with zero counts initially", () => {
    render(<MovieApp />);
    expect(screen.getByRole("tab", { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /watchlist \(0\)/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /watched \(0\)/i })).toBeInTheDocument();
  });

  it("shows an empty state on the watchlist tab when nothing has been added", async () => {
    const user = userEvent.setup();
    render(<MovieApp />);
    await user.click(screen.getByRole("tab", { name: /watchlist/i }));
    expect(screen.getByText(/your watchlist is empty/i)).toBeInTheDocument();
  });

  it("reflects an added movie's title and count on the watchlist tab", async () => {
    const user = userEvent.setup();
    addToWatchlist({ imdbID: "tt0087884", title: "Paris, Texas", year: "1984", poster: "N/A" });
    render(<MovieApp />);
    await user.click(screen.getByRole("tab", { name: /watchlist \(1\)/i }));
    expect(screen.getByText("Paris, Texas")).toBeInTheDocument();
  });
});