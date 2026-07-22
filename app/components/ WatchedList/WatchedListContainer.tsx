"use client";

import { getList, removeFromWatched } from "@/store/store";
import { Separator } from "@/components/ui/separator";
import { WatchedCard } from "./WatchedCard";

export function WatchedlistContainer() {
    const watchedItems = getList("watched");
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
