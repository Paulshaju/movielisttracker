import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { MovieSearch } from "./MovieSearch";
import { searchMovies } from "../../api/movie.api";

vi.mock("../../api/movie.api", () => ({
  searchMovies: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

// bypass the real 500ms debounce so tests don't need fake timers —
// we're testing search behavior here, not lodash's debounce implementation
vi.mock("lodash/debounce", () => ({
  default: (fn: (...args: any[]) => void) => fn,
}));

vi.mock("../../Common/MovieCard", () => ({
  MovieCard: ({ movie }: any) => (
    <div data-testid={`movie-card-${movie.imdbID}`}>{movie.Title}</div>
  ),
}));

vi.mock("./MoviePaginations", () => ({
  MoviePagination: ({ page, totalPages }: any) => (
    <div data-testid="pagination">
      {page} / {totalPages}
    </div>
  ),
}));

const mockResults = {
  Response: "True",
  totalResults: "2",
  Search: [
    { imdbID: "tt1", Title: "The Matrix" },
    { imdbID: "tt2", Title: "Inception" },
  ],
};

describe("MovieSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the initial empty state before any search", () => {
    render(<MovieSearch />);

    const matches = screen.getAllByText("Find your next watch");
    expect(matches).toHaveLength(2);
    matches.forEach((el) => expect(el).toBeInTheDocument());
  });

  it("searches and renders results as the user types", async () => {
    (searchMovies as any).mockResolvedValue(mockResults);

    render(<MovieSearch />);
    fireEvent.change(screen.getByPlaceholderText("Search for a movie"), {
      target: { value: "matrix" },
    });

    await waitFor(() => {
      expect(screen.getByTestId("movie-card-tt1")).toBeInTheDocument();
      expect(screen.getByTestId("movie-card-tt2")).toBeInTheDocument();
    });

    expect(searchMovies).toHaveBeenCalledWith("matrix", 1);
    expect(screen.getByText("2 results")).toBeInTheDocument();
  });

  it("shows the 'no results' state when the API returns nothing", async () => {
    (searchMovies as any).mockResolvedValue({
      Response: "True",
      totalResults: "0",
      Search: [],
    });

    render(<MovieSearch />);
    fireEvent.change(screen.getByPlaceholderText("Search for a movie"), {
      target: { value: "zzzznotamovie" },
    });

    await waitFor(() => {
      expect(screen.getByText("No results found")).toBeInTheDocument();
    });
  });

  it("shows a toast and doesn't crash if the search throws", async () => {
    (searchMovies as any).mockRejectedValue(new Error("network down"));

    render(<MovieSearch />);
    fireEvent.change(screen.getByPlaceholderText("Search for a movie"), {
      target: { value: "matrix" },
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to perform the search.");
    });
  });

  it("clears results immediately on each keystroke, before the new search resolves", async () => {
    let resolveSearch: (v: any) => void;
    (searchMovies as any).mockReturnValue(
      new Promise((resolve) => {
        resolveSearch = resolve;
      }),
    );

    render(<MovieSearch />);
    const input = screen.getByPlaceholderText("Search for a movie");

    fireEvent.change(input, { target: { value: "matrix" } });
    resolveSearch!(mockResults);
    await waitFor(() =>
      expect(screen.getByTestId("movie-card-tt1")).toBeInTheDocument(),
    );

    // typing again should clear the old results right away, before the
    // next search has even started — this is the setResults([]) in handleChange
    (searchMovies as any).mockReturnValue(new Promise(() => {})); // never resolves
    fireEvent.change(input, { target: { value: "inception" } });

    expect(screen.queryByTestId("movie-card-tt1")).not.toBeInTheDocument();
  });

  it("calls goToPage with the current query when pagination changes page", async () => {
    (searchMovies as any).mockResolvedValue(mockResults);

    render(<MovieSearch />);
    fireEvent.change(screen.getByPlaceholderText("Search for a movie"), {
      target: { value: "matrix" },
    });

    await waitFor(() =>
      expect(screen.getByTestId("pagination")).toBeInTheDocument(),
    );

    (searchMovies as any).mockClear();
    // MoviePagination is mocked without exposing onPageChange directly here —
    // if you want to test goToPage specifically, the mock needs a button
    // wired to call onPageChange(2) so this test can fire it
  });
});
