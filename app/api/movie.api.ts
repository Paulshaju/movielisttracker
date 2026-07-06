'use server'
import { IMovieSearchResponse, IMovie, IMovieDetails } from "@/types";

const MIN_QUERY_LENGTH = 3;

export async function searchMovies(query: string, page: number = 1): Promise<IMovieSearchResponse | undefined> {
    const q = query.trim();
    if (q.length < MIN_QUERY_LENGTH) return undefined;

    const key = process.env.NEXT_OMDB_API_KEY;
    const res = await fetch(
        `https://www.omdbapi.com/?apikey=${key}&s=${encodeURIComponent(q)}&page=${page}`,
    );
    const data: IMovieSearchResponse = await res.json();

    return data;
}

// Module-level cache: survives across MovieCard instances/re-renders for
// the page refresh.
const detailsCache = new Map<string, IMovieDetails>();

// In-flight requests, keyed by imdbID — prevents duplicate fetches if a
// user double-clicks a card.
const inFlight = new Map<string, Promise<IMovieDetails>>();

const API_KEY = process.env.NEXT_OMDB_API_KEY;

export async function getMovieDetails(imdbID: string): Promise<IMovieDetails> {
    const cached = detailsCache.get(imdbID);
    if (cached) return cached;

    const pending = inFlight.get(imdbID);
    if (pending) return pending;

    const request = (async () => {
        const res = await fetch(
            `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=full`
        );
        const data = await res.json();

        if (data.Response === "False") {
            throw new Error(data.Error || "Failed to fetch Movie details");
        }

        const IMovie = data as IMovieDetails;
        detailsCache.set(imdbID, IMovie);
        return IMovie;
    })();

    inFlight.set(imdbID, request);

    try {
        return await request;
    } finally {
        inFlight.delete(imdbID);
    }
}