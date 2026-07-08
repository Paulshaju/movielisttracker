"use client";

import Image from "next/image";
import { Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { IMovie, IPlaylistListItem } from "@/types";
import { TagBadge } from "../../Common/TagBadge";
import { AddToLists } from "./AddToLists";
import { removeFromList, useTagsForMovie } from "@/store/store";
import { AddTagsPopover } from "../AddTags/AddTagsPopover";

interface MovieListItemProps {
    movie: IPlaylistListItem;
    listId: string;
    readOnly?: boolean;
}

export function MovieListItem({
    movie,
    listId,
    readOnly = false,
}: MovieListItemProps) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [imgError, setImgError] = useState(false);
    const showPoster = movie.Poster !== "N/A" && !imgError;
    const tags = useTagsForMovie(movie.imdbID);

    return (
        <>
            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/30">
                {/* Poster thumbnail */}
                <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {showPoster ? (
                        <Image
                            src={movie.Poster}
                            alt={movie.Title}
                            fill
                            sizes="280px"
                            className="object-cover"
                            onError={() => setImgError(true)}
                            unoptimized
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center  text-sm text-muted-forground">
                            No preview available
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-row gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                            {movie.Title}
                        </p>
                        <AddTagsPopover
                            imdbID={movie.imdbID}
                            availableTags={useTagsForMovie(movie.imdbID)}
                        />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{movie.Year}</span>
                        {movie.userRating && (
                            <>
                                <span aria-hidden>·</span>
                                <span className="flex items-center gap-1 text-amber-400">
                                    <Star className="h-3 w-3 fill-amber-400" />
                                    {movie.userRating}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Tags */}
                    {tags && tags.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                            {tags.map((tag) => (
                                <TagBadge key={tag} tag={tag} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                {!readOnly && (
                    <div className="flex flex-shrink-0 items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => setSheetOpen(true)}
                            aria-label={`Edit tags for ${movie.Title}`}
                            title="Edit tags"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromList(listId, movie.imdbID)}
                            aria-label={`Remove ${movie.Title} from list`}
                            title="Remove"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}
            </div>

            {!readOnly && (
                <AddToLists
                    onOpenChange={setSheetOpen}
                    open={sheetOpen}
                    selectedMovie={movie as IMovie}
                />
            )}
        </>
    );
}
