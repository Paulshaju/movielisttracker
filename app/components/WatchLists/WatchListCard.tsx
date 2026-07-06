"use client";

import { useState } from "react";
import Image from "next/image";
import { Snapshot } from "valtio";
import { IMovieDetails, IRating } from "@/types";
import { X, Clock, Trophy } from "lucide-react";
import { getRatingBadges } from "@/lib/utils";
import { WatchedButton } from "../Common/WatchedButton";
import { moveToWatched, removeFromWatchlist } from "@/store/store";

export function WatchlistCard({
    movieDetails,
}: {
    movieDetails: Snapshot<IMovieDetails>;
}) {
    const [imgError, setImgError] = useState(false);
    // check for Image errors
    const showPoster = movieDetails.Poster !== "N/A" && !imgError;
    // we only show the first one here to keep the card compact
    const genre = (movieDetails.Genre || "").split(",")[0]?.trim();
    const badges = getRatingBadges(movieDetails.Ratings as IRating[]);

    return (
        <div data-testid={`watchlist-card-${movieDetails.imdbID}`} className="group flex gap-4 rounded-2xl border border-border/60 bg-card p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
            <div className="relative w-30 shrink-0 overflow-hidden rounded-xl bg-muted">
                {showPoster ? (
                    <Image
                        src={movieDetails.Poster}
                        alt={movieDetails.Title}
                        fill
                        sizes="80px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        N/A
                    </div>
                )}
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-[15px] font-semibold leading-tight text-foreground">
                        {movieDetails.Title}
                    </p>
                    <button
                        onClick={() => removeFromWatchlist(movieDetails.imdbID)}
                        aria-label={`Remove ${movieDetails.Title} from watchlist`}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                        <X size={13} />
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span>{movieDetails.Year}</span>
                    {movieDetails.Runtime && movieDetails.Runtime !== "N/A" && (
                        <>
                            <span className="text-border">•</span>
                            <span className="flex items-center gap-1">
                                <Clock size={11} />
                                {movieDetails.Runtime}
                            </span>
                        </>
                    )}
                    {genre && (
                        <span className="rounded-full bg-[#D4A24E]/10 px-2 py-0.5 text-[11px] font-medium text-[#B8935A]">
                            {genre}
                        </span>
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

                {movieDetails.Plot && movieDetails.Plot !== "N/A" && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {movieDetails.Plot}
                    </p>
                )}

                {movieDetails.Awards && movieDetails.Awards !== "N/A" && (
                    <div className="flex items-start gap-1 text-[11px] text-muted-foreground">
                        <Trophy size={11} className="mt-0.5 shrink-0 text-[#D4A24E]" />
                        <span className="line-clamp-1">{movieDetails.Awards}</span>
                    </div>
                )}

                <div className="pt-1">
                    <WatchedButton
                        onConfirm={(IRating, note) => moveToWatched(movieDetails.imdbID, IRating, note)}
                    />
                </div>
            </div>
        </div>
    );
}