import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { proxyMap } from "valtio/utils";
import { movieStore, removeFromWatched } from "@/store/store";
import { WatchedlistContainer } from "./WatchedListContainer";
import { IPlaylistListItem } from "@/types";

// stubbing WatchedCard out — same reasoning as WatchlistCard's test: we're
// testing the container's list/empty-state logic, not the card's own rendering
vi.mock("./WatchedCard", () => ({
  WatchedCard: ({ entry, onRemove }: any) => (
    <div data-testid={`watched-card-${entry.imdbID}`}>
      {entry.Title}
      <button onClick={onRemove}>Remove</button>
    </div>
  ),
}));

// keep the real movieStore (a genuine Valtio proxy with a real playlists Map)
// so useSnapshot inside the component works correctly — only replace
// removeFromWatched so we can assert on it without touching real state.
vi.mock("@/store/store", async () => {
  const actual =
    await vi.importActual<typeof import("@/store/store")>("@/store/store");
  return {
    ...actual,
    removeFromWatched: vi.fn(),
  };
});

describe("WatchedlistContainer", () => {
  beforeEach(() => {
    // reset between tests since movieStore is a module-level singleton
    movieStore.playlists = proxyMap<string, IPlaylistListItem[]>([
      ["watched", []],
      ["watchlist", []],
    ]);
    vi.clearAllMocks();
  });

  it("shows the empty state when watched is empty, regardless of watchlist", () => {
    // watchlist having items shouldn't affect this component at all —
    // this is the exact bug that was here before (checking the wrong array)
    movieStore.playlists.set("watchlist", [
      { imdbID: "tt9", Title: "Unrelated" } as any,
    ]);

    render(<WatchedlistContainer />);

    expect(screen.getByText("Your watchedlist is empty")).toBeInTheDocument();
  });

  it("renders a card per watched movie, ignoring watchlist contents", () => {
    movieStore.playlists.set("watched", [
      { imdbID: "tt1", Title: "The Matrix" } as any,
      { imdbID: "tt2", Title: "Inception" } as any,
    ]);
    movieStore.playlists.set("watchlist", []); // empty watchlist shouldn't hide watched items

    render(<WatchedlistContainer />);

    expect(screen.getAllByTestId(/^watched-card-/)).toHaveLength(2);
    expect(screen.getByText("The Matrix")).toBeInTheDocument();
    expect(screen.getByText("Inception")).toBeInTheDocument();
  });

  it("keeps the header count in sync with the watched list", () => {
    movieStore.playlists.set("watched", [
      { imdbID: "tt1", Title: "The Matrix" } as any,
    ]);

    render(<WatchedlistContainer />);

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("calls removeFromWatched with the correct imdbID when a card's remove is triggered", () => {
    movieStore.playlists.set("watched", [
      { imdbID: "tt1", Title: "The Matrix" } as any,
    ]);

    render(<WatchedlistContainer />);
    fireEvent.click(screen.getByText("Remove"));

    expect(removeFromWatched).toHaveBeenCalledWith("tt1");
  });
});
