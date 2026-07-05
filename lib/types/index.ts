export interface Movie {
    imdbID: string;
    title: string;
    year: string;
    poster: string;
}

export interface IWatchlistItem extends Movie {
    addedAt: string;
}

export interface IWatchedItem extends Movie {
    watchedAt: string;
    rating: number;
    note?: string;
}

export interface IMovieStore {
    watchlist: IWatchlistItem[];
    watched: IWatchedItem[];
}