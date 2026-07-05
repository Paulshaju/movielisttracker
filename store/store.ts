import { IMovieStore, IWatchedItem, IWatchlistItem, Movie } from "@/lib/types";
import { proxy } from "valtio";



export const movieStore = proxy<IMovieStore>({ watched: [], watchlist: [] })


export const addToWatchlist = (newMovieItem: Movie) => {
    if (movieStore.watchlist.find((elm) => elm.imdbID === newMovieItem.imdbID)) {
        return;
    }
    movieStore.watchlist.push({ ...newMovieItem, addedAt: new Date().toDateString() });
}

export const moveToWatched = (movieId: string, rating: number, note?: string) => {
    const currentMovieItem = movieStore.watched.find((elm) => elm.imdbID === movieId);
    if (currentMovieItem) return;
    const movieItem = movieStore.watchlist.find((elm) => elm.imdbID === movieId);
    if (!movieItem) return;
    movieStore.watchlist = movieStore.watchlist.filter((elm) => elm.imdbID !== movieId)
    movieStore.watched.push({ ...movieItem, watchedAt: new Date().toDateString(), rating: rating, note: note })

}


export const removeFromWatched = (newMovieItem: IWatchedItem) => {
    if (movieStore.watched.find((elm) => elm.imdbID === newMovieItem.imdbID)) {
        movieStore.watched = movieStore.watched.filter((elm) => elm.imdbID !== newMovieItem.imdbID)
    }
}

export const removeFromWatchlist = (movieId: string) => {
    if (movieStore.watchlist.find((elm) => elm.imdbID === movieId)) {
        movieStore.watchlist = movieStore.watchlist.filter((elm) => elm.imdbID !== movieId)
    }
}