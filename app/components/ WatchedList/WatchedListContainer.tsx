"use client";

import { getList, removeFromWatched } from "@/store/store";
import { Separator } from "@/components/ui/separator";
import { WatchedCard } from "./WatchedCard";

export function WatchedlistContainer() {
    const watchedItems = getList("watched");
    if (watchedItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                <p className="text-sm font-medium text-foreground">
                    Your watchedlist is empty
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Search for a Movie and add it to see it here.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-2">
            <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-medium text-foreground">Watched</h2>
                <span className="text-sm text-muted-foreground">
                    {watchedItems.length}
                </span>
            </div>
            <Separator />
            <div className="lg:grid flex flex-wrap grid-cols-2 gap-2">
                {watchedItems.map((movie) => (
                    <WatchedCard
                        key={movie.imdbID}
                        entry={movie}
                        onRemove={() => removeFromWatched(movie.imdbID)}
                    />
                ))}
            </div>
        </div>
    );
}
