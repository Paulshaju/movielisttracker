import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { searchMovies, getMovieDetails } from "./movie.api";

describe("searchMovies", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("doesn't call the API for queries under the minimum length", async () => {
    const result = await searchMovies("in");

    expect(result).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("trims whitespace before checking length", async () => {
    // " in " is 4 chars raw but trims to 2 — should still short-circuit
    const result = await searchMovies(" in ");

    expect(result).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("calls OMDb with the encoded query and page number", async () => {
    (fetch as any).mockResolvedValue({
      json: async () => ({ Search: [], totalResults: "0", Response: "True" }),
    });

    await searchMovies("blade runner", 2);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("s=blade%20runner&page=2"),
    );
  });

  it("returns the parsed response on success", async () => {
    const mockResponse = {
      Search: [{ Title: "Inception" }],
      totalResults: "1",
      Response: "True",
    };
    (fetch as any).mockResolvedValue({ json: async () => mockResponse });

    const result = await searchMovies("inception");

    expect(result).toEqual(mockResponse);
  });
});

describe("getMovieDetails", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches and returns movie details", async () => {
    const mockMovie = {
      imdbID: "tt1375666",
      Title: "Inception",
      Response: "True",
    };
    (fetch as any).mockResolvedValue({ json: async () => mockMovie });

    const result = await getMovieDetails("tt1375666");

    expect(result).toEqual(mockMovie);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("serves the second request from cache without hitting fetch again", async () => {
    const mockMovie = {
      imdbID: "tt1375667",
      Title: "The Matrix",
      Response: "True",
    };
    (fetch as any).mockResolvedValue({ json: async () => mockMovie });

    await getMovieDetails("tt1375667");
    await getMovieDetails("tt1375667");

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("dedupes concurrent calls for the same imdbID into a single fetch", async () => {
    let resolveFetch: (v: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    (fetch as any).mockReturnValue(fetchPromise);

    const call1 = getMovieDetails("tt1375668");
    const call2 = getMovieDetails("tt1375668");

    resolveFetch!({
      json: async () => ({
        imdbID: "tt1375668",
        Title: "Dunkirk",
        Response: "True",
      }),
    });

    const [result1, result2] = await Promise.all([call1, call2]);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result1).toEqual(result2);
  });

  it("throws using OMDb's own error message when Response is False", async () => {
    (fetch as any).mockResolvedValue({
      json: async () => ({ Response: "False", Error: "Incorrect IMDb ID." }),
    });

    await expect(getMovieDetails("tt0000000")).rejects.toThrow(
      "Incorrect IMDb ID.",
    );
  });

  it("falls back to a generic message if OMDb omits Error", async () => {
    (fetch as any).mockResolvedValue({
      json: async () => ({ Response: "False" }),
    });

    await expect(getMovieDetails("tt0000001")).rejects.toThrow(
      "Failed to fetch Movie details",
    );
  });

  it("clears the in-flight entry after a failure, so a retry actually refetches", async () => {
    (fetch as any)
      .mockResolvedValueOnce({
        json: async () => ({ Response: "False", Error: "boom" }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          imdbID: "tt0000002",
          Title: "Retry",
          Response: "True",
        }),
      });

    await expect(getMovieDetails("tt0000002")).rejects.toThrow("boom");

    const result = await getMovieDetails("tt0000002");

    expect(result.Title).toBe("Retry");
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
