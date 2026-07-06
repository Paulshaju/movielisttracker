"use client";

import { useState } from "react";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(n)}
                    onMouseEnter={() => setHovered(n)}
                    aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
                    className="p-0.5"
                >
                    <Star
                        size={20}
                        className={
                            n <= (hovered || value)
                                ? "fill-[#F4B400] text-[#F4B400]"
                                : "text-muted-foreground"
                        }
                    />
                </button>
            ))}
        </div>
    );
}

export function WatchedButton({
    onConfirm,
}: {
    onConfirm: (IRating: number, note?: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [IRating, setRating] = useState(0);
    const [note, setNote] = useState("");
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    const handleConfirm = () => {
        if (IRating === 0) {
            setAttemptedSubmit(true);
            return;
        }
        onConfirm(IRating, note);
        setOpen(false);
        setRating(0);
        setNote("");
        setAttemptedSubmit(false);
    };

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (!next) {
                    // Reset validation state on close without submitting,
                    // but keep IRating/note in case they reopen to finish.
                    setAttemptedSubmit(false);
                }
            }}
        >
            <PopoverTrigger render={<Button variant={'outline'} size={'sm'} className={'hover:bg-primary/10'}>
                <Check size={12} />
                Watched
            </Button>} />

            <PopoverContent className="w-72" side="top" align="start">
                <div className="space-y-3">
                    <div>
                        <p className="mb-1.5 text-sm font-medium text-foreground">
                            Your IRating <span className="text-destructive">*</span>
                        </p>
                        <StarPicker value={IRating} onChange={setRating} />
                        {attemptedSubmit && IRating === 0 && (
                            <p className="mt-1 text-xs text-destructive">
                                Pick a IRating to continue.
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="mb-1.5 text-sm font-medium text-foreground">
                            Note <span className="text-muted-foreground">(optional)</span>
                        </p>
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Any thoughts worth remembering?"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleConfirm}>
                            Confirm
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}