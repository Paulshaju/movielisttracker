'use server'
import { Movie } from "@/lib/types";

export async function searchMovies(query: string): Promise<Movie[]> {
    const q = query.trim();
    if (!q) return [];
    const key = process.env.NEXT_OMDB_API_KEY;
    const res = await fetch(`https://www.omdbapi.com/?apikey=${key}&s=${encodeURIComponent(q)}&type=movie`);
    const data = await res.json();
    if (data.Response === "False") return []; // covers "no results" AND malformed/empty query
    return data.Search;
}