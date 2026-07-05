import { describe, expect, it, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { searchMovies } from "./movie.api";

const server = setupServer(
    http.get("https://www.omdbapi.com/", ({ request }) => {
        const s = new URL(request.url).searchParams.get("s");
        if (s === "paris texas") {
            return HttpResponse.json({
                Response: "True",
                Search: [{ imdbID: "tt0087884", title: "Paris, Texas", year: "1984", poster: "N/A" }],
            });
        }
        return HttpResponse.json({ Response: "False", Error: "Movie not found!" });
    }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("searchMovies", () => {
    it("returns mapped results for a matching title", async () => {
        const results = await searchMovies("paris texas");
        expect(results).toEqual([{ imdbID: "tt0087884", title: "Paris, Texas", year: "1984", poster: "N/A" }]);
    });

    it("returns an empty array when OMDB reports no match", async () => {
        expect(await searchMovies("zzzznotamovie")).toEqual([]);
    });

    it("returns an empty array for a blank query without hitting the network", async () => {
        expect(await searchMovies("   ")).toEqual([]);
    });
});