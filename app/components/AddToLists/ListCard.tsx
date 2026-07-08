import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check, Loader2, Star } from "lucide-react";
import { useState } from "react";

export const ListCard = ({
    listName,
    inList,
    noOfMovies,
    toggleList,
    userRating,
    note,
    setRating,
    setNote,
    isLoading,
}: {
    listName: string;
    toggleList: () => void;
    noOfMovies: number;
    inList: boolean;
    userRating?: number;
    note?: string;
    setRating?: (rating: number) => void;
    setNote?: (note: string) => void;
    isLoading?: boolean;
}) => {
    const [noteInput, setNoteInput] = useState(note ?? "");

    const isWatched = listName === "watched";

    return (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-background p-3 w-full">
            {/* Toggle row */}
            <button
                type="button"
                className="flex items-center gap-3 text-left w-full"
                onClick={() => toggleList()}
            >
                <span
                    className={cn(
                        "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                        inList
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-transparent",
                    )}
                >
                    {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        inList && <Check className="h-3 w-3" />
                    )}
                </span>
                <span className="text-sm font-medium text-foreground capitalize">
                    {listName}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                    {noOfMovies ?? 0} movies
                </span>
            </button>

            {inList && (
                <div className="pl-8 flex flex-col gap-3">
                    {/* Rating + note — only for watched */}
                    {isWatched && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating?.(star)}
                                        aria-label={`Rate ${star} star`}
                                    >
                                        <Star
                                            className={cn(
                                                "h-4 w-4",
                                                (userRating ?? 0) >= star
                                                    ? "fill-primary text-primary"
                                                    : "text-muted-foreground",
                                            )}
                                        />
                                    </button>
                                ))}
                            </div>
                            <Textarea
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                onBlur={() => setNote?.(noteInput)}
                                placeholder="Notes about this movie…"
                                className="text-xs bg-muted/40 border-border min-h-16"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
