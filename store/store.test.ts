import { describe, expect, it, beforeEach } from "vitest";
import { IMovieDetails, IPlaylistListItem } from "@/types";
import { proxyMap } from "valtio/utils";
import {
  movieStore,
  getList,
  addToWatchlist,
  removeFromWatchlist,
  moveToWatched,
  removeFromWatched,
  addNewCustomList,
  addToList,
  removeFromList,
  deleteCustomList,
  addTagToMovie,
  removeTagFromMovie,
  setMovieRating,
  setMovieNote,
  renameList,
  useTagsForMovie,
} from "./store";
import { renderHook } from "@testing-library/react";

const inception: IMovieDetails = {
  Title: "Inception",
  Year: "2010",
  Rated: "PG-13",
  Released: "16 Jul 2010",
  Runtime: "148 min",
  Genre: "Action, Adventure, Sci-Fi",
  Director: "Christopher Nolan",
  Writer: "Christopher Nolan",
  Actors: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page",
  Plot: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO, but his tragic past may doom the project and his team to disaster.",
  Language: "English, Japanese, French",
  Country: "United Kingdom, United States",
  Awards: "Won 4 Oscars. 160 wins & 220 nominations total",
  Poster:
    "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_QL75_UX380_CR0,0,380,562_.jpg",
  Ratings: [
    { Source: "Internet Movie Database", Value: "8.8/10" },
    { Source: "Rotten Tomatoes", Value: "87%" },
    { Source: "Metacritic", Value: "74/100" },
  ],
  Metascore: "74",
  imdbRating: "8.8",
  imdbVotes: "2,811,614",
  imdbID: "tt0087884",
  Type: "movie",
  DVD: "N/A",
  BoxOffice: "$292,587,330",
  Production: "N/A",
  Website: "N/A",
  Response: "True",
};

const interstellar: IMovieDetails = {
  ...inception,
  Title: "Interstellar",
  Year: "2014",
  imdbID: "tt0816692",
};

function asListItem(movie: IMovieDetails): IPlaylistListItem {
  return { ...movie, addedAt: new Date().toDateString() } as IPlaylistListItem;
}

beforeEach(() => {
  movieStore.playlists = proxyMap<string, IPlaylistListItem[]>([
    ["watched", []],
    ["watchlist", []],
  ]);
  movieStore.tags = proxyMap<string, string[]>([["must-watched", []]]);
});

describe("addToWatchlist", () => {
  it("adds a movie to the watchlist", () => {
    addToWatchlist(asListItem(inception));
    expect(getList("watchlist")).toHaveLength(1);
    expect(getList("watchlist")[0]).toMatchObject({ imdbID: "tt0087884" });
  });

  it("does not add the same movie twice", () => {
    addToWatchlist(asListItem(inception));
    addToWatchlist(asListItem(inception));
    expect(getList("watchlist")).toHaveLength(1);
  });

  it("sets addedAt when adding", () => {
    addToWatchlist(asListItem(inception));
    expect(getList("watchlist")[0].addedAt).toBeDefined();
  });
});

describe("removeFromWatchlist", () => {
  it("removes a movie from the watchlist", () => {
    addToWatchlist(asListItem(inception));
    removeFromWatchlist("tt0087884");
    expect(getList("watchlist")).toHaveLength(0);
  });

  it("does nothing if the movie isn't in the watchlist", () => {
    addToWatchlist(asListItem(inception));
    removeFromWatchlist("not-there");
    expect(getList("watchlist")).toHaveLength(1);
  });
});

describe("moveToWatched", () => {
  it("moves a movie from watchlist to watched with userRating and note", () => {
    addToWatchlist(asListItem(inception));
    moveToWatched("tt0087884", 4, "Great movie");
    expect(getList("watchlist")).toHaveLength(0);
    expect(getList("watched")[0]).toMatchObject({
      imdbID: "tt0087884",
      userRating: 4,
      note: "Great movie",
    });
  });

  it("works without a note (optional param)", () => {
    addToWatchlist(asListItem(inception));
    moveToWatched("tt0087884", 5);
    expect(getList("watched")[0]).toMatchObject({
      imdbID: "tt0087884",
      userRating: 5,
    });
  });

  it("does nothing if the movie isn't on the watchlist", () => {
    moveToWatched("not-there", 5);
    expect(getList("watched")).toHaveLength(0);
  });

  it("does not move a movie already in watched", () => {
    addToWatchlist(asListItem(inception));
    moveToWatched("tt0087884", 4);
    // re-add to watchlist and try moving again
    addToWatchlist(asListItem(inception));
    moveToWatched("tt0087884", 2);
    expect(getList("watched")).toHaveLength(1);
    expect(getList("watched")[0].userRating).toBe(4); // unchanged
  });
});

describe("removeFromWatched", () => {
  it("removes a movie from watched", () => {
    addToWatchlist(asListItem(inception));
    moveToWatched("tt0087884", 4);
    removeFromWatched("tt0087884");
    expect(getList("watched")).toHaveLength(0);
  });

  it("does nothing if the movie isn't in watched", () => {
    removeFromWatched("not-there");
    expect(getList("watched")).toHaveLength(0);
  });
});

describe("addNewCustomList", () => {
  it("creates a new empty list", () => {
    addNewCustomList("comedies");
    expect(movieStore.playlists.has("comedies")).toBe(true);
    expect(getList("comedies")).toHaveLength(0);
  });

  it("does not overwrite an existing list with the same name", () => {
    addNewCustomList("comedies");
    addToList("comedies", asListItem(inception));
    addNewCustomList("comedies");
    expect(getList("comedies")).toHaveLength(1);
  });
});

describe("addToList", () => {
  it("adds a movie to a custom list", () => {
    addNewCustomList("comedies");
    addToList("comedies", asListItem(inception));
    expect(getList("comedies")).toHaveLength(1);
  });

  it("does not add the same movie twice to a custom list", () => {
    addNewCustomList("comedies");
    addToList("comedies", asListItem(inception));
    addToList("comedies", asListItem(inception));
    expect(getList("comedies")).toHaveLength(1);
  });

  it("creates the list implicitly via setList if it doesn't exist yet", () => {
    addToList("new-list", asListItem(inception));
    expect(getList("new-list")).toHaveLength(1);
  });
});

describe("removeFromList", () => {
  it("removes a movie from a custom list", () => {
    addNewCustomList("comedies");
    addToList("comedies", asListItem(inception));
    removeFromList("comedies", "tt0087884");
    expect(getList("comedies")).toHaveLength(0);
  });

  it("does nothing if the movie isn't in the list", () => {
    addNewCustomList("comedies");
    addToList("comedies", asListItem(inception));
    removeFromList("comedies", "not-there");
    expect(getList("comedies")).toHaveLength(1);
  });
});

describe("deleteCustomList", () => {
  it("deletes a custom list entirely", () => {
    addNewCustomList("comedies");
    deleteCustomList("comedies");
    expect(movieStore.playlists.has("comedies")).toBe(false);
  });

  it("refuses to delete the watched list", () => {
    deleteCustomList("watched");
    expect(movieStore.playlists.has("watched")).toBe(true);
  });

  it("refuses to delete the watchlist", () => {
    deleteCustomList("watchlist");
    expect(movieStore.playlists.has("watchlist")).toBe(true);
  });
});

describe("addTagToMovie", () => {
  it("adds a tag to a movie in a list", () => {
    addToWatchlist(asListItem(inception));
    addTagToMovie("tt0087884", "must-rewatch");
    const { result } = renderHook(() => useTagsForMovie("tt0087884"));
    expect(result.current).toEqual(["must-rewatch"]);
  });

  it("does not add a duplicate tag to the same movie", () => {
    addToWatchlist(asListItem(inception));
    addTagToMovie("tt0087884", "must-rewatch");
    addTagToMovie("tt0087884", "must-rewatch");
    const { result } = renderHook(() => useTagsForMovie("tt0087884"));
    expect(result.current).toEqual(["must-rewatch"]);
  });

  it("adds the tag to the global allTags registry", () => {
    addToWatchlist(asListItem(inception));
    addTagToMovie("tt0087884", "must-rewatch");
    expect(movieStore.tags.keys()).toContain("must-rewatch");
  });

  it("does not duplicate entries in allTags across movies", () => {
    addToWatchlist(asListItem(inception));
    addToWatchlist(asListItem(interstellar));
    addTagToMovie("tt0087884", "sci-fi");
    addTagToMovie("tt0816692", "sci-fi");
    expect(
      [...movieStore.tags.keys()].filter((t) => t === "sci-fi"),
    ).toHaveLength(1);
  });
});

describe("removeTagFromMovie", () => {
  it("removes a tag from a movie", () => {
    addToWatchlist(asListItem(inception));
    addTagToMovie("tt0087884", "must-rewatch");
    removeTagFromMovie("tt0087884", "must-rewatch");
    const { result } = renderHook(() => useTagsForMovie("tt0087884"));
    expect(result.current).toEqual([]);
  });

  it("does nothing if the tag isn't present", () => {
    addToWatchlist(asListItem(inception));
    removeTagFromMovie("tt0087884", "not-a-tag");
    const { result } = renderHook(() => useTagsForMovie("tt0087884"));
    expect(result.current).toEqual([]);
  });

  it("only removes the specified tag, keeping others", () => {
    addToWatchlist(asListItem(inception));
    addTagToMovie("tt0087884", "tag-a");
    addTagToMovie("tt0087884", "tag-b");
    removeTagFromMovie("tt0087884", "tag-a");
    const { result } = renderHook(() => useTagsForMovie("tt0087884"))
    expect(result.current).toEqual(["tag-b"]);
  });
});

describe("setMovieRating", () => {
  it("sets a rating on a movie", () => {
    addToWatchlist(asListItem(inception));
    moveToWatched("tt0087884", 3);
    setMovieRating("watched", "tt0087884", 5);
    expect(getList("watched")[0].userRating).toBe(5);
  });

  it("only updates the targeted movie", () => {
    addToWatchlist(asListItem(inception));
    addToWatchlist(asListItem(interstellar));
    moveToWatched("tt0087884", 3);
    moveToWatched("tt0816692", 3);
    setMovieRating("watched", "tt0087884", 5);
    const other = getList("watched").find((m) => m.imdbID === "tt0816692");
    expect(other?.userRating).toBe(3);
  });
});

describe("setMovieNote", () => {
  it("sets a note on a movie", () => {
    addToWatchlist(asListItem(inception));
    moveToWatched("tt0087884", 3);
    setMovieNote("watched", "tt0087884", "Updated thoughts");
    expect(getList("watched")[0].note).toBe("Updated thoughts");
  });

  it("only updates the targeted movie", () => {
    addToWatchlist(asListItem(inception));
    addToWatchlist(asListItem(interstellar));
    moveToWatched("tt0087884", 3);
    moveToWatched("tt0816692", 3, "original note");
    setMovieNote("watched", "tt0087884", "new note");
    const other = getList("watched").find((m) => m.imdbID === "tt0816692");
    expect(other?.note).toBe("original note");
  });
});

describe("renameList", () => {
  it("renames a custom list, preserving its items", () => {
    addNewCustomList("comedies");
    addToList("comedies", asListItem(inception));
    renameList("comedies", "funny-movies");
    expect(movieStore.playlists.has("comedies")).toBe(false);
    expect(getList("funny-movies")).toHaveLength(1);
  });

  it("refuses to rename the watched list", () => {
    renameList("watched", "seen");
    expect(movieStore.playlists.has("watched")).toBe(true);
    expect(movieStore.playlists.has("seen")).toBe(false);
  });

  it("refuses to rename the watchlist", () => {
    renameList("watchlist", "to-watch");
    expect(movieStore.playlists.has("watchlist")).toBe(true);
    expect(movieStore.playlists.has("to-watch")).toBe(false);
  });

  it("refuses to rename a list that doesn't exist", () => {
    renameList("nonexistent", "new-name");
    expect(movieStore.playlists.has("new-name")).toBe(false);
  });

  it("refuses to rename into a name that's already taken", () => {
    addNewCustomList("comedies");
    addNewCustomList("dramas");
    renameList("comedies", "dramas");
    expect(movieStore.playlists.has("comedies")).toBe(true); // unchanged
  });
});
