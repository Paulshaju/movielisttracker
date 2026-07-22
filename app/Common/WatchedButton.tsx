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

function StarPicker({
  onChange,
}: {
  onChange: (n: number) => void;
}) {
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
              n <= (hovered)
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
  onConfirm: (rating: number, note?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const handleConfirm = () => {
    console.log("testing", rating);
    if (rating === 0) {
      setAttemptedSubmit(true);
      return;
    }
    onConfirm(rating, note);
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
          setAttemptedSubmit(false);
        }
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant={"outline"}
            size={"sm"}
            className={"hover:bg-primary/10"}
          >
            <Check size={12} />
            Mark as watched
          </Button>
        }
      />

      <PopoverContent className="w-72" side="top" align="start">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Mark as watched
            </p>
            <p className="text-xs text-muted-foreground">
              Rate it to move it to your Watched list.
            </p>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">
              Your rating <span className="text-destructive">*</span>
            </p>
            <StarPicker onChange={setRating} />
            {attemptedSubmit && rating === 0 && (
              <p className="mt-1 text-xs text-destructive">
                Pick a rating to continue.
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
              Move to Watched
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
