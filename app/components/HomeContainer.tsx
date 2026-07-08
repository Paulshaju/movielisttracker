"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadInitialState, movieStore } from "@/store/store";
import { useSnapshot } from "valtio";
import { MovieSearch } from "./MovieSearch/MovieSearch";
import { EmptyState } from "../Common/EmptyState";
import { Clapperboard, Film } from "lucide-react";
import { WatchlistContainer } from "./WatchLists/WatchListContainer";
import { WatchedlistContainer } from "./ WatchedList/WatchedListContainer";
import { useLayoutEffect } from "react";
import { CustomList } from "./AddToLists/CustomList";

export const HomeContainer = () => {
    useLayoutEffect(() => {
        const { playlists, tags } = loadInitialState();
        movieStore.playlists = playlists;
        movieStore.tags = tags;
    }, []);
    const snap = useSnapshot(movieStore);

    return (
        <div className=" flex flex-1 flex-col h-full w-full">
            <Tabs defaultValue="search" className={"h-full flex-1"}>
                <TabsList className="mx-auto flex w-full max-w-sm">
                    <TabsTrigger value="search" className="flex-1">
                        Search
                    </TabsTrigger>
                    <TabsTrigger name="watchlist" value="watchlist" className="flex-1">
                        Watchlist ({(snap.playlists.get("watchlist") ?? []).length})
                    </TabsTrigger>
                    <TabsTrigger name="watched" value="watched" className="flex-1">
                        Watched ({(snap.playlists.get("watched") ?? []).length})
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="flex-1">
                        My Lists (
                        {
                            [...snap.playlists.keys()].filter(
                                (elm) => !["watched", "watchlist"].includes(elm),
                            ).length
                        }
                        )
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="mt-6 h-full flex">
                    <MovieSearch />
                </TabsContent>

                <TabsContent value="watchlist" className="mt-6 flex justify-center ">
                    {(snap.playlists.get("watchlist") ?? []).length === 0 ? (
                        <EmptyState
                            icon={Film}
                            title="Your watchlist is empty"
                            description="Search for a movie to add it here."
                        />
                    ) : (
                        <WatchlistContainer />
                    )}
                </TabsContent>

                <TabsContent value="watched" className="mt-6">
                    {(snap.playlists.get("watched") ?? []).length === 0 ? (
                        <EmptyState
                            icon={Clapperboard}
                            title="No watched movies yet"
                            description="Move something from your watchlist once you've seen it."
                        />
                    ) : (
                        <WatchedlistContainer />
                    )}
                </TabsContent>
                <TabsContent value="custom" className="mt-6">
                    <CustomList />
                </TabsContent>
            </Tabs>
        </div>
    );
};
