"use client";

import { useSnapshot } from "valtio";
import { movieStore } from "@/store/store";
import { WatchlistCard } from "./WatchListCard";
import { Separator } from "@/components/ui/separator";

export function WatchlistContainer() {
    const snap = useSnapshot(movieStore);

    const watchListItems = snap.playlists.get("watchlist") ?? [];

    if (watchListItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                <p className="text-sm font-medium text-foreground">
                    Your watchlist is empty
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Search for a movie and add it to see it here.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-2">
            <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-medium text-foreground">Watchlist</h2>
                {watchListItems && (
                    <span className="text-sm text-muted-foreground">
                        {watchListItems.length}
                    </span>
                )}
            </div>
            <Separator />
            <div className="lg:grid flex flex-wrap grid-cols-2 gap-2">
                {watchListItems.map((movie) => (
                    <WatchlistCard key={movie.imdbID} movieDetails={movie} />
                ))}
            </div>
        </div>
    );
}
