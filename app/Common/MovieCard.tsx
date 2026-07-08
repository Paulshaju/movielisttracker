"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Trophy, Bookmark, BookmarkPlusIcon } from "lucide-react";
import { IMovie, IMovieDetails } from "@/types";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { getMovieDetails } from "@/app/api/movie.api";
import { useSnapshot } from "valtio";
import { movieStore } from "@/store/store";
import { toast } from "sonner";
import { formatRuntime, getRatingBadges } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AddToLists } from "../components/AddToLists/AddToLists";





function DetailsContent({
    loading,
    error,
    details,
}: {
    loading: boolean;
    error: boolean;
    details: IMovieDetails | null;
}) {
    if (loading) {
        return (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 size={14} className="animate-spin" />
                Loading details…
            </div>
        );
    }

    if (error || !details) {
        return <p className="py-4 text-sm text-destructive">Couldn&apos;t load details.</p>;
    }

    const badges = getRatingBadges(details.Ratings);

    return (
        <div className="space-y-3">
            <div>
                <p className="text-[15px] font-semibold text-foreground">{details.Title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    {details.Rated && details.Rated !== "N/A" && (
                        <span className="rounded-[4px] border px-1.5 py-0.5 text-[11px]">
                            {details.Rated}
                        </span>
                    )}
                    {details.Runtime && details.Runtime !== "N/A" && (
                        <span>{formatRuntime(details.Runtime)}</span>
                    )}
                    <span>{details.Year}</span>
                    <span className="text-border">•</span>
                    <span>{details.Genre}</span>
                </div>
            </div>

            {badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {badges.map((b) => (
                        <span
                            key={b.label}
                            className="rounded-full bg-[#D4A24E]/10 px-2 py-0.5 text-[11px] font-medium text-[#B8935A]"
                        >
                            {b.label} {b.value}
                        </span>
                    ))}
                </div>
            )}

            <p className="text-[13px] leading-relaxed text-muted-foreground">{details.Plot}</p>

            <div className="space-y-1 text-[12px] text-muted-foreground">
                <p>
                    <span className="text-foreground">Director:</span> {details.Director}
                </p>
                <p>
                    <span className="text-foreground">Cast:</span> {details.Actors}
                </p>
            </div>

            {details.Awards && details.Awards !== "N/A" && (
                <div className="flex items-start gap-1.5 text-[12px] text-muted-foreground">
                    <Trophy size={13} className="mt-0.5 shrink-0 text-[#D4A24E]" />
                    <span>{details.Awards}</span>
                </div>
            )}
        </div>
    );
}

export function MovieCard({
    movie,
    onAddTolist,
}: {
    movie: IMovie;
    onAddTolist: () => void;
}) {
    const [imgError, setImgError] = useState(false);
    const [details, setDetails] = useState<IMovieDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [error, setError] = useState(false);

    const showPoster = movie.Poster !== "N/A" && !imgError;



    const handleOpenChange = async (open: boolean) => {
        if (open && !details && !loadingDetails) {
            setLoadingDetails(true);
            setError(false);
            try {
                const full = await getMovieDetails(movie.imdbID);
                setDetails(full);
            } catch {
                setError(true);
            } finally {
                setLoadingDetails(false);
            }
        }
    };

    return (
        <div className="relative w-full overflow-hidden rounded-lg bg-[#0D0D10] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)]">
            <div className="relative h-[280px] w-full overflow-hidden">
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

                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0D0D10] to-transparent pointer-events-none" />

                <span className="absolute bottom-2 left-2 rounded-[4px] bg-black/50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#EDEAE3] backdrop-blur-sm">
                    {movie.Type}
                </span>
            </div>
            <div className="flex flex-col flex-1 justify-between items-start p-3 gap-2">
                <Popover onOpenChange={handleOpenChange}>
                    <PopoverTrigger className={'w-5/6'}>
                        <span className="w-full p-1 text-left cursor-pointer w-1/2">
                            <Tooltip>
                                <TooltipTrigger render={
                                    <h3 className="text-[19px] font-semibold text-[#F5F3EE] truncate cursor-default">
                                        {movie.Title}
                                    </h3>
                                }>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{movie.Title}</p>
                                </TooltipContent>
                            </Tooltip>
                            <p className="mt-1 text-[12px] text-[#9A9AA2]">
                                {movie.Year} • Tap for details
                            </p>
                        </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" side="right" align="start">
                        <DetailsContent loading={loadingDetails} error={error} details={details} />
                    </PopoverContent>
                </Popover>
                <div className="w-full">
                    <Button variant={'default'} size={'sm'} className={'w-full'} onClick={onAddTolist}>
                        <BookmarkPlusIcon className="w-5 h-5" /> Add to list
                    </Button>
                </div>
            </div>

        </div >
    );
}