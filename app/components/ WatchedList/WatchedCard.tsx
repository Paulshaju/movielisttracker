"use client";

import { useState } from "react";
import Image from "next/image";
import { Snapshot } from "valtio";
import { Star, X, Clock, Trophy, MessageSquareText } from "lucide-react";
import { getRatingBadges } from "@/lib/utils";
import { IPlaylistListItem, IRating } from "@/types";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AddTagsPopover } from "../AddTags/AddTagsPopover";
import {
    useTagsForMovie,
} from "@/store/store";
import { TagBadge } from "@/app/Common/TagBadge";

function formatWatchedDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function WatchedCard({
    entry,
    onRemove,
}: {
    entry: Snapshot<IPlaylistListItem>;
    onRemove: (imdbID: string) => void;
}) {
    const [imgError, setImgError] = useState(false);
    const {
        Genre,
        Poster,
        Title,
        Ratings,
        note,
        watchedAt,
        Awards,
        Runtime,
        imdbID,
        Plot,
        Year,
        userRating,
    } = entry;
    const showPoster = Poster !== "N/A" && !imgError;
    const genre = (Genre || "").split(",")[0]?.trim();
    const badges = getRatingBadges(Ratings as IRating[]);
    const tags = useTagsForMovie(entry.imdbID);

    return (
        <div className="group flex gap-4 rounded-2xl border border-border/60 bg-card p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="relative h-full w-30 shrink-0 overflow-hidden rounded-xl bg-muted">
                {showPoster ? (
                    <Image
                        src={Poster}
                        alt={Title}
                        fill
                        sizes="80px"
                        className="object-cover"
                        onError={() => setImgError(true)}
                        unoptimized
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        N/A
                    </div>
                )}
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-row items-center gap-4">
                        <p className="truncate text-[15px] font-semibold leading-tight text-foreground">
                            {Title}
                        </p>
                        <AddTagsPopover
                            imdbID={entry.imdbID}
                            availableTags={useTagsForMovie(entry.imdbID)}
                        />
                    </div>

                    <Button
                        data-testid={"Remove"}
                        onClick={() => onRemove(imdbID)}
                        aria-label={`Remove ${Title} from watched`}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white opacity-0 transition-colors group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                    >
                        <X size={13} />
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span>{Year}</span>
                    {Runtime && Runtime !== "N/A" && (
                        <>
                            <span className="text-border">•</span>
                            <span className="flex items-center gap-1">
                                <Clock size={11} />
                                {Runtime}
                            </span>
                        </>
                    )}
                    {genre && (
                        <>
                            <span className="text-border">•</span>
                            <span>{genre}</span>
                        </>
                    )}
                </div>

                {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {badges.map((b) => (
                            <span
                                key={b.label}
                                className="rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                            >
                                {b.label} {b.value}
                            </span>
                        ))}
                    </div>
                )}

                {Plot && Plot !== "N/A" && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {Plot}
                    </p>
                )}

                {Awards && Awards !== "N/A" && (
                    <div className="flex items-start gap-1 text-[11px] text-muted-foreground">
                        <Trophy size={11} className="mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{Awards}</span>
                    </div>
                )}

                {/* User IRating */}
                <div className="p-2 border rounded-md space-y-2">
                    <div className="flex flex-col items-start justify-between pt-0.5 gap-2">
                        <div className="flex flex-row w-full justify-between items-start gap-1.5">
                            <p className="text-xs font-medium">My Ratings:</p>
                            <div className="flex items-center gap-0.5">
                                {userRating &&
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={13}
                                            className={
                                                i < userRating
                                                    ? "fill-[#F4B400] text-[#F4B400]"
                                                    : "text-muted-foreground/30"
                                            }
                                        />
                                    ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
                            <Clock size={10} />
                            {watchedAt && formatWatchedDate(watchedAt)}
                        </div>
                    </div>

                    {/* User's note, if left one */}
                    {note && (
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="flex items-start gap-1.5 rounded-md bg-muted/50 px-2 py-1.5 text-left">
                                    <MessageSquareText
                                        size={12}
                                        className="mt-0.5 shrink-0 text-muted-foreground"
                                    />
                                    <p className="line-clamp-2 text-xs italic text-muted-foreground">
                                        {note}
                                    </p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p>{note}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag) => (
                                <TagBadge key={tag} tag={tag} />
                            ))}
                        </div>
                    )}
                </div>
                <div></div>
            </div>
        </div>
    );
}
