"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSnapshot } from "valtio";
import { Input } from "@/components/ui/input";
import { IMovie } from "@/types";
import { searchMovies } from "../../api/movie.api";
import { toast } from "sonner";
import debounce from 'lodash/debounce';
import { MovieCard } from "../../Common/MovieCard";
import { MoviePagination } from "./MoviePaginations";
import { Film, Loader2, SearchX } from "lucide-react";
import { EmptyState } from "../../Common/EmptyState";
import { AddToLists } from "../AddToLists/AddToLists";

const RESULTS_PER_PAGE = 10;
const MAX_PAGES = 10;

export function MovieSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<IMovie[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<IMovie | undefined>(undefined);

    const queryRef = useRef(query);
    queryRef.current = query;

    const performSearch = async (query: string, searchPage: number) => {
        try {
            const q = query.trim();
            if (!q) {
                setResults([]);
                return;
            }
            setLoading(true);
            setResults([]);
            const found = await searchMovies(query, searchPage);
            if (found && found.Response === 'True') {
                setLoading(false);
                setTotalResults(found.totalResults)
                setResults(found.Search);
            }
            setLoading(false);
        }
        catch (err) {
            console.log(err);
            toast.error('Failed to perform the search.')
        }
    }
    const debouncedSearch = useCallback(
        debounce((query) => {
            setPage(1);

            performSearch(query, 1);
        }, 200), // Wait 500 milliseconds after the last keystroke
        []
    );
    const handleChange = (e: any) => {
        setResults([])
        const value = e.target.value;
        setQuery(value);
        debouncedSearch(value);
    };

    const goToPage = (nextPage: number) => {
        setPage(nextPage);
        performSearch(queryRef.current, nextPage);
    };

    const totalPages = Math.min(
        MAX_PAGES,
        Math.max(1, Math.ceil(totalResults / RESULTS_PER_PAGE))
    );


    return (
        <div className="flex flex-1 flex-col items-center gap-6 px-4 py-10 w-full">
            <div className="w-full max-w-md text-center">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Find your next watch
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Search thousands of movies and shows, powered by IMDb data.
                </p>

                <Input
                    className="mt-6"
                    value={query}
                    onChange={handleChange}
                    placeholder="Search for a movie"
                />
            </div>

            {query.trim() && (
                <div className="mt-8 w-full ">
                    <div className="flex items-baseline justify-between border-b pb-3">
                        <h2 className="text-lg font-medium text-foreground">
                            Results for &ldquo;{query}&rdquo;
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {results.length} result{results.length === 1 ? "" : "s"}
                        </p>
                    </div>
                </div>
            )}
            {loading &&
                <div className="flex h-1/2 items-center justify-center p-6 w-full flex-1">
                    <Loader2 className="animate-spin text-primary w-10 h-10" />
                </div>
            }

            {results.length > 0 ? (
                <div className="mt-8 w-full">
                    <div className="flex w-full  flex-wrap justify-center gap-4 lg:grid lg:grid-cols-5 mb-4">
                        {results.map((movie) => {
                            return <MovieCard key={movie.imdbID} movie={movie} onAddTolist={() => {
                                setSelectedMovie(movie);
                                setOpenDrawer(true)
                            }} />;
                        })}
                    </div>

                    <MoviePagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                        disabled={loading}
                    />
                </div>
            ) : !loading && query.trim() ? (
                <EmptyState
                    icon={SearchX}
                    title="No results found"
                    description={`We couldn't find anything for "${query}". Try a different title.`}
                />
            ) : !loading ? (
                <EmptyState
                    icon={Film}
                    title="Find your next watch"
                    description="Start typing above to search thousands of movies and shows."
                />
            ) : null}
            {selectedMovie && <AddToLists onOpenChange={(open) => setOpenDrawer(open)} open={openDrawer} selectedMovie={selectedMovie} />}
        </div>
    );
}