"use server";
import { IMovieSearchResponse, IMovieDetails } from "@/types";

const MIN_QUERY_LENGTH = 3;

export async function searchMovies(
    query: string,
    page: number = 1,
): Promise<IMovieSearchResponse | undefined> {
    const q = query.trim();
    if (q.length < MIN_QUERY_LENGTH) return undefined;

    const key = process.env.NEXT_OMDB_API_KEY;
    const res = await fetch(
        `https://www.omdbapi.com/?apikey=${key}&s=${encodeURIComponent(q)}&page=${page}`,
    );
    const data: IMovieSearchResponse = await res.json();

    return data;
}


const API_KEY = process.env.NEXT_OMDB_API_KEY;

export async function getMovieDetails(imdbID: string): Promise<IMovieDetails> {
    const res = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=full`,
        { next: { revalidate: 86400, tags: [`movie-${imdbID}`] } }, // cache 24hr, individually tagged
    );
    const data = await res.json();

    if (data.Response === "False") {
        throw new Error(data.Error || "Failed to fetch Movie details");
    }

    return data as IMovieDetails;
}