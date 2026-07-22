import { TagBadge } from "@/app/Common/TagBadge";
import { PRESET_TAGS } from "@/app/consts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { addTagToMovie, movieStore, removeTagFromMovie } from "@/store/store";
import { Plus, TagIcon } from "lucide-react";
import { useState } from "react";
import { useSnapshot } from "valtio/react";

export function AddTagsPopover({
  imdbID,
  availableTags,
}: {
  imdbID: string;
  availableTags: string[];
}) {
  const { tags } = useSnapshot(movieStore);
  const [tagInput, setTagInput] = useState("");

  const suggestions = Array.from(
    new Set([...PRESET_TAGS, ...tags.keys()]),
  ).filter((s) => !availableTags.includes(s));

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    addTagToMovie(imdbID, trimmed);
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === "Enter") handleAddTag(tagInput);
  };

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label="Edit tags"
                >
                  <TagIcon size={13} />
                </Button>
              }
            />
          }
        />
        <TooltipContent>
          <p>Edit tags</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-72" side="top" align="end">
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Tags</p>
          {availableTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  active
                  onRemove={() => removeTagFromMovie(imdbID, tag)}
                />
              ))}
            </div>
          )}

          <div className="relative">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add a tag and press Enter…"
              className="h-8 text-xs bg-muted/40 border-border pr-8"
            />
            {tagInput.trim() && (
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                aria-label="Add tag"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {suggestions.slice(0, 8).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddTag(s)}
                  className="rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:border-primary/60 hover:text-foreground transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
