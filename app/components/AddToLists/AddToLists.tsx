import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
    addNewCustomList,
    addToList,
    movieStore,
    removeFromList,
    setMovieNote,
    setMovieRating,
} from "@/store/store";
import { IMovie } from "@/types";
import { DrawerRootChangeEventDetails } from "@base-ui/react";
import { Loader2, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { useSnapshot } from "valtio";
import { ListCard } from "./ListCard";
import { getMovieDetails } from "@/app/api/movie.api";
import { toast } from "sonner";

export function AddToLists({
    open,
    onOpenChange,
    selectedMovie,
}: {
    open: boolean;
    onOpenChange: (
        open: boolean,
        eventDetails: DrawerRootChangeEventDetails,
    ) => void;
    selectedMovie: IMovie;
}) {
    const { playlists } = useSnapshot(movieStore);
    const [newListName, setNewListName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const newListRef = useRef<HTMLInputElement>(null);
    const [listNameError, setListNameError] = useState<string | null>(null);
    const [pendingList, setPendingList] = useState<string | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);

    async function handleAddNewList() {
        const trimmed = newListName.trim();
        if (!trimmed) return;

        if (movieStore.playlists.has(trimmed)) {
            setListNameError("A list with this name already exists");
            return;
        }

        setListNameError(null);
        setIsCreating(true);
        try {
            addNewCustomList(trimmed);
            setNewListName("");
            toast.success(`Created list "${trimmed}"`);
        } catch (err) {
            console.error(err);
            toast.error("Failed to create list", {
                description: "Please try again.",
            });
        } finally {
            await new Promise((resolve) => setTimeout(resolve, 400));
            setIsCreating(false);
        }
    }

    const handleToggleList = async (listName: string) => {
        const alreadyInList = playlists
            .get(listName)
            ?.some((elm) => elm.imdbID === selectedMovie.imdbID);

        if (alreadyInList) {
            removeFromList(listName, selectedMovie.imdbID);
            toast.success(`Removed from ${listName}`);
            return;
        }

        setPendingList(listName);
        try {
            const movieDetail = await getMovieDetails(selectedMovie.imdbID);
            addToList(listName, {
                ...movieDetail,
                addedAt: new Date().toDateString(),
                watchedAt: new Date().toDateString(),
            });
            // watched and watchlist are mutually exclusive — adding to one
            // pulls the movie out of the other.
            if (
                listName === "watched" &&
                playlists
                    .get("watchlist")
                    ?.some((elm) => elm.imdbID === selectedMovie.imdbID)
            ) {
                removeFromList("watchlist", selectedMovie.imdbID);
            } else if (
                listName === "watchlist" &&
                playlists
                    .get("watched")
                    ?.some((elm) => elm.imdbID === selectedMovie.imdbID)
            ) {
                removeFromList("watched", selectedMovie.imdbID);
            }
            toast.success(`Added to ${listName}`);
        } catch (err) {
            console.error(err);
            toast.error(`Couldn't add to ${listName}`, {
                description: "Please try again.",
            });
        } finally {
            setPendingList(null);
        }
    };
    const handleSave = async () => {
        setIsSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsSaving(false);
        closeRef.current?.click();
    };

    return (
        <Drawer swipeDirection="left" open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle className={"font-semibold"}>Add to Lists</DrawerTitle>
                    <DrawerDescription>
                        Save &quot;{selectedMovie.Title}&quot; to a list.
                    </DrawerDescription>
                </DrawerHeader>
                <div className="flex-1 p-4">
                    <div className="size-full rounded-md bg-muted/50 p-2 space-y-4">
                        <div>
                            <p className="mb-1 text-md font-semibold">Available lists</p>
                            <p className="mb-2 text-sm font-medium text-muted-foreground">
                                Click a list to add or remove this movie
                            </p>
                            <div className="flex flex-wrap gap-2 w-full">
                                <ListCard
                                    listName={"watchlist"}
                                    noOfMovies={playlists.get("watchlist")?.length ?? 0}
                                    toggleList={() => handleToggleList("watchlist")}
                                    inList={
                                        playlists
                                            .get("watchlist")
                                            ?.some((elm) => elm.imdbID === selectedMovie.imdbID) ??
                                        false
                                    }
                                    isLoading={pendingList === "watchlist"}
                                />
                                <ListCard
                                    listName={"watched"}
                                    noOfMovies={playlists.get("watched")?.length ?? 0}
                                    toggleList={() => handleToggleList("watched")}
                                    inList={
                                        playlists
                                            .get("watched")
                                            ?.some((elm) => elm.imdbID === selectedMovie.imdbID) ??
                                        false
                                    }
                                    isLoading={pendingList === "watched"}
                                    userRating={
                                        playlists
                                            .get("watched")
                                            ?.find((elm) => elm.imdbID === selectedMovie.imdbID)
                                            ?.userRating
                                    }
                                    note={
                                        playlists
                                            .get("watched")
                                            ?.find((elm) => elm.imdbID === selectedMovie.imdbID)?.note
                                    }
                                    setRating={(r) =>
                                        setMovieRating("watched", selectedMovie.imdbID, r)
                                    }
                                    setNote={(n) =>
                                        setMovieNote("watched", selectedMovie.imdbID, n)
                                    }
                                />
                                {[...playlists.entries()]
                                    .filter(([key]) => key !== "watched" && key !== "watchlist")
                                    .map(([key,]) => (
                                        <ListCard
                                            key={key}
                                            listName={key}
                                            noOfMovies={playlists.get(key)?.length ?? 0}
                                            toggleList={() => handleToggleList(key)}
                                            inList={
                                                playlists
                                                    .get(key)
                                                    ?.some(
                                                        (elm) => elm.imdbID === selectedMovie.imdbID,
                                                    ) ?? false
                                            }
                                            isLoading={pendingList === key}
                                        />
                                    ))}
                            </div>
                        </div>

                        <div>
                            <p className="mb-1 text-md font-semibold">New list</p>
                            <p className="mb-2 text-xs font-medium text-muted-foreground">
                                Or make your own
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    ref={newListRef}
                                    value={newListName}
                                    onChange={(e) => {
                                        setNewListName(e.target.value);
                                        if (listNameError) setListNameError(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                                        if (e.key === "Enter") handleAddNewList();
                                    }}
                                    placeholder="List name…"
                                    className="h-9 bg-muted/40 border-border text-sm"
                                />
                                <Button
                                    size="sm"
                                    variant="default"
                                    onClick={handleAddNewList}
                                    disabled={!newListName.trim()}
                                    className="shrink-0"
                                >
                                    {isCreating ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-1" />
                                            Create
                                        </>
                                    )}
                                </Button>
                            </div>
                            {listNameError && (
                                <p className="mt-1.5 text-xs text-destructive">
                                    {listNameError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <DrawerFooter>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : "Save"}
                    </Button>
                    <DrawerClose
                        render={
                            <Button ref={closeRef} variant="outline">
                                Close
                            </Button>
                        }
                    />
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
