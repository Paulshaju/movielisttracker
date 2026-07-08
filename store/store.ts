'use client'
import { IMovieStore, IMovieDetails, IPlaylistListItem } from "@/types";
import { proxy, subscribe, useSnapshot } from "valtio";
import { proxyMap } from "valtio/utils";

const STORAGE_KEY = "movie-store";
export const movieStore = proxy<IMovieStore>({
    playlists: proxyMap<string, IPlaylistListItem[]>([
        ['watched', []],
        ['watchlist', []],
    ]), tags: proxyMap<string, string[]>([]),
})
let hasHydrated = false;
export function loadInitialState() {
    if (hasHydrated) return { playlists: movieStore.playlists, tags: movieStore.tags };
    hasHydrated = true;
    const defaultPlaylists = () => proxyMap<string, IPlaylistListItem[]>([
        ['watched', []],
        ['watchlist', []],
    ]);
    const defaultTags = () => proxyMap<string, string[]>([]);

    if (typeof window === "undefined") {
        return { playlists: defaultPlaylists(), tags: defaultTags() };
    }
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { playlists: defaultPlaylists(), tags: defaultTags() };

        const parsed = JSON.parse(raw);
        return {
            playlists: proxyMap<string, IPlaylistListItem[]>(parsed.playlists),
            tags: proxyMap<string, string[]>(parsed.tags ?? []),
        };
    } catch {
        return { playlists: defaultPlaylists(), tags: defaultTags() };
    }
}


if (typeof window !== "undefined") {
    subscribe(movieStore, () => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    playlists: [...movieStore.playlists.entries()],
                    tags: [...movieStore.tags.entries()],
                })
            );
        } catch (error) {
            throw error;
        }
    });
}

export const getList = (key: string): IPlaylistListItem[] => movieStore.playlists.get(key) ?? [];

const setList = (key: string, items: IPlaylistListItem[]) => {
    movieStore.playlists.set(key, items);
};

// --- Watchlist ---
export const addToWatchlist = (newMovieItem: IPlaylistListItem) => {
    const watchlist = getList('watchlist');
    if (watchlist.some((elm) => elm.imdbID === newMovieItem.imdbID)) return;

    setList('watchlist', [...watchlist, { ...newMovieItem, addedAt: new Date().toDateString() }]);
};

export const removeFromWatchlist = (movieId: string) => {
    const watchlist = getList('watchlist');
    setList('watchlist', watchlist.filter((elm) => elm.imdbID !== movieId));
};

// --- Watched (needs userRating/note) ---
export const moveToWatched = (movieId: string, userRating: number, note?: string) => {
    const watched = getList('watched');
    if (watched.some((elm) => elm.imdbID === movieId)) return;

    const watchlist = getList('watchlist');
    const movieItem = watchlist.find((elm) => elm.imdbID === movieId);
    if (!movieItem) return;

    setList('watched', [...watched, { ...movieItem, userRating, note, addedAt: new Date().toDateString() }]);
    setList('watchlist', watchlist.filter((elm) => elm.imdbID !== movieId));
};

export const removeFromWatched = (movieId: string) => {
    const watched = getList('watched');
    setList('watched', watched.filter((elm) => elm.imdbID !== movieId));
};

// --- Custom lists (generic, works for any list name incl. watchlist) ---
export const addNewCustomList = (listName: string) => {
    if (movieStore.playlists.has(listName)) return;
    movieStore.playlists.set(listName, []);
};

export const addToList = (listName: string, newMovieItem: IPlaylistListItem) => {
    const list = getList(listName);
    if (list.some((elm) => elm.imdbID === newMovieItem.imdbID)) return;
    setList(listName, [...list, { ...newMovieItem, addedAt: new Date().toDateString() }]);
};

export const removeFromList = (listName: string, movieId: string) => {
    const list = getList(listName);
    setList(listName, list.filter((elm) => elm.imdbID !== movieId));
};

export const deleteCustomList = (listName: string) => {
    if (listName === 'watched' || listName === 'watchlist') return; // protect predefined lists
    movieStore.playlists.delete(listName);
};

export const addTagToMovie = (movieId: string, tag: string) => {
    const movieIds = movieStore.tags.get(tag) ?? [];
    if (!movieIds.includes(movieId)) {
        movieStore.tags.set(tag, [...movieIds, movieId]);
    }
};
export const removeTagFromMovie = (movieId: string, tag: string) => {
    const movieIds = movieStore.tags.get(tag) ?? [];
    movieStore.tags.set(tag, movieIds.filter((id) => id !== movieId));
};
export const getTagsForMovie = (movieId: string): string[] => {
    return [...movieStore.tags.entries()]
        .filter(([, movieIds]) => movieIds.includes(movieId))
        .map(([tag]) => tag);
};

export const useTagsForMovie = (movieId: string): string[] => {
    const { tags } = useSnapshot(movieStore);
    return [...tags.entries()]
        .filter(([, movieIds]) => movieIds.includes(movieId))
        .map(([tag]) => tag);
};

export const getAllTags = (): string[] => [...movieStore.tags.keys()];

export const setMovieRating = (listName: string, movieId: string, userRating: number) => {
    const list = getList(listName);
    const updated = list.map((elm) =>
        elm.imdbID === movieId ? { ...elm, userRating } : elm
    );
    setList(listName, updated);
};

export const setMovieNote = (listName: string, movieId: string, note: string) => {
    const list = getList(listName);
    const updated = list.map((elm) =>
        elm.imdbID === movieId ? { ...elm, note } : elm
    );
    setList(listName, updated);
};

export const renameList = (oldName: string, newName: string) => {
    if (oldName === 'watched' || oldName === 'watchlist') return; // protect predefined lists
    if (!movieStore.playlists.has(oldName) || movieStore.playlists.has(newName)) return;

    const items = getList(oldName);
    movieStore.playlists.delete(oldName);
    movieStore.playlists.set(newName, items);
};