'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadInitialState, movieStore } from "@/store/store";
import { useSnapshot } from "valtio";
import { MovieSearch } from "./MovieSearch/MovieSearch";
import { EmptyState } from "./Common/EmptyState";
import { Clapperboard, Film, Video } from "lucide-react";
import { WatchlistContainer } from "./WatchLists/WatchListContainer";
import { WatchedlistContainer } from "./ WatchedList/WatchedListContainer";
import { useLayoutEffect } from "react";

export const HomeContainer = () => {
    useLayoutEffect(() => {
        loadInitialState();
    }, []);
    const snap = useSnapshot(movieStore);

    return (
        <div className=" flex flex-1 flex-col h-full px-4 py-10 w-full">
            <header className="mb-8 text-center flex flex-col items-center gap-2">
                <div className="bg-primary/10 h-16 w-16 rounded-md p-2 flex items-center flex-row justify-center">
                    <Video className="w-8 h-8 text-primary" />
                </div>

                <h1 className="text-2xl font-semibold tracking-tight">Cinelog</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Track what you want to watch, and what you already have.
                </p>
            </header>

            <Tabs defaultValue="search" className={'h-full flex-1'}>
                <TabsList className="mx-auto flex w-full max-w-sm">
                    <TabsTrigger value="search" className="flex-1">
                        Search
                    </TabsTrigger>
                    <TabsTrigger value="watchlist" className="flex-1">
                        Watchlist ({snap.watchlist.length})
                    </TabsTrigger>
                    <TabsTrigger value="watched" className="flex-1">
                        Watched ({snap.watched.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="mt-6 h-full flex">
                    <MovieSearch />
                </TabsContent>

                <TabsContent value="watchlist" className="mt-6 flex justify-center">
                    {snap.watchlist.length === 0 ? (
                        <EmptyState
                            icon={Film}
                            title="Your watchlist is empty"
                            description="Search for a IMovie to add it here."
                        />
                    ) : (
                        <WatchlistContainer />
                    )}
                </TabsContent>

                <TabsContent value="watched" className="mt-6">
                    {snap.watched.length === 0 ? (
                        <EmptyState
                            icon={Clapperboard}
                            title="No watched movies yet"
                            description="Move something from your watchlist once you've seen it."
                        />
                    ) : (
                        <WatchedlistContainer />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );

}