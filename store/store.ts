'use client'
import { IMovieStore, IMovieDetails, IWatchlistItem } from "@/types";
import { proxy, subscribe } from "valtio";

const STORAGE_KEY = "movie-store";
export const movieStore = proxy<IMovieStore>({ watched: [], watchlist: [] })
export function loadInitialState(): IMovieStore {
    if (typeof window === "undefined") {
        return { watchlist: [], watched: [] }; // SSR guard
    }
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { watchlist: [], watched: [] };
        const parsed = JSON.parse(raw);
        return {
            watchlist: Array.isArray(parsed.watchlist) ? parsed.watchlist : [],
            watched: Array.isArray(parsed.watched) ? parsed.watched : [],
        };
    } catch {
        return { watchlist: [], watched: [] };
    }
}



if (typeof window !== "undefined") {
    subscribe(movieStore, () => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    watchlist: movieStore.watchlist,
                    watched: movieStore.watched,
                })
            );
        } catch (error) {
            throw error;
        }
    });
}


export const addToWatchlist = (newMovieItem: IWatchlistItem) => {
    if (movieStore.watchlist.find((elm) => elm.imdbID === newMovieItem.imdbID)) {
        return;
    }
    movieStore.watchlist.push({ ...newMovieItem, addedAt: new Date().toDateString() });
}

export const moveToWatched = (movieId: string, IRating: number, note?: string) => {
    const currentMovieItem = movieStore.watched.find((elm) => elm.imdbID === movieId);
    if (currentMovieItem) return;
    const movieItem = movieStore.watchlist.find((elm) => elm.imdbID === movieId);
    if (!movieItem) return;
    movieStore.watchlist = movieStore.watchlist.filter((elm) => elm.imdbID !== movieId)
    movieStore.watched.push({ ...movieItem, watchedAt: new Date().toDateString(), userRating: IRating, note: note })

}


export const removeFromWatched = (movieId: string) => {
    if (movieStore.watched.find((elm) => elm.imdbID === movieId)) {
        movieStore.watched = movieStore.watched.filter((elm) => elm.imdbID !== movieId)
    }
}

export const removeFromWatchlist = (movieId: string) => {
    if (movieStore.watchlist.find((elm) => elm.imdbID === movieId)) {
        movieStore.watchlist = movieStore.watchlist.filter((elm) => elm.imdbID !== movieId)
    }
}