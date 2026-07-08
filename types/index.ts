export interface IRating {
  Source: string;
  Value: string;
}

export interface IMovieDetails {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: IRating[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: "movie" | "series" | "episode";
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: "True" | "False";
}

export interface IPlaylistListItem extends IMovieDetails {
  addedAt: string;
  watchedAt?: string;
  userRating?: number;
  note?: string;
}

export interface IMovieStore {
  playlists: Map<string, IPlaylistListItem[]>;
  tags: Map<string, string[]>;
}

export interface IMovieSearchResponse {
  Response: string;
  Error: string;
  Search: IMovie[];
  totalResults: number;
}
export interface IMovie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: "Movie" | "series" | "episode";
  Poster: string;
}
