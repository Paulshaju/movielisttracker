'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Check, Link2, Pencil, Bookmark } from 'lucide-react'
import { useSnapshot } from 'valtio'
import { movieStore, renameList } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { TagBadge } from '../../Common/TagBadge'
import { EmptyState } from '../../Common/EmptyState'
import { MovieListItem } from './MovieListItem'

interface ListDetailViewProps {
    listName: string
    onBack: () => void
}

const PREDEFINED_LISTS = ['watched', 'watchlist']

export function ListDetailView({ listName, onBack }: ListDetailViewProps) {
    const snap = useSnapshot(movieStore)
    const entries = snap.playlists.get(listName) ?? []
    const isPredefined = PREDEFINED_LISTS.includes(listName)

    const [editingName, setEditingName] = useState(false)
    const [nameValue, setNameValue] = useState(listName)
    const [activeTag, setActiveTag] = useState<string | null>(null)
    const nameRef = useRef<HTMLInputElement>(null)

    const entryIds = new Set(entries.map((e) => e.imdbID));

    const allTags = [...snap.tags.entries()]
        .filter(([, movieIds]) => movieIds.some((id) => entryIds.has(id)))
        .map(([tag]) => tag);

    const filtered = activeTag
        ? entries.filter((e) => (snap.tags.get(activeTag) ?? []).includes(e.imdbID))
        : entries;

    function commitRename() {
        const trimmed = nameValue.trim()
        if (trimmed && trimmed !== listName) {
            renameList(listName, trimmed)
            setEditingName(false)
            onBack() // list key changed, so this view's listName prop is now stale
        } else {
            setNameValue(listName)
            setEditingName(false)
        }
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={onBack}
                    aria-label="Back to lists"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>

                {editingName ? (
                    <Input
                        ref={nameRef}
                        value={nameValue}
                        autoFocus
                        onChange={(e) => setNameValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                            if (e.nativeEvent.isComposing || e.keyCode === 229) return
                            if (e.key === 'Enter') commitRename()
                            if (e.key === 'Escape') { setNameValue(listName); setEditingName(false) }
                        }}
                        className="h-8 text-base font-semibold bg-transparent border-0 border-b border-primary rounded-none px-0 focus-visible:ring-0"
                    />
                ) : (
                    <button
                        className="flex items-center gap-1.5 text-base font-semibold text-foreground hover:text-primary transition-colors disabled:opacity-60 disabled:pointer-events-none"
                        onClick={() => { setNameValue(listName); setEditingName(true) }}
                        aria-label="Rename list"
                        disabled={isPredefined}
                    >
                        {listName}
                        {!isPredefined && <Pencil className="h-3.5 w-3.5 text-muted-foreground" />}
                    </button>
                )}

                <span className="ml-auto text-xs text-muted-foreground shrink-0">
                    {entries.length} {entries.length === 1 ? 'movie' : 'movies'}
                </span>
            </div>

            {/* Tag filter bar */}
            {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {allTags.map((tag) => (
                        <TagBadge
                            key={tag}
                            tag={tag}
                            active={activeTag === tag}
                            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                        />
                    ))}
                    {activeTag && (
                        <button
                            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                            onClick={() => setActiveTag(null)}
                        >
                            Clear filter
                        </button>
                    )}
                </div>
            )}

            {/* Movie list */}
            {filtered.length === 0 ? (
                <EmptyState
                    icon={Bookmark}
                    title="No movies here yet"
                    description="Search for a movie and add it to this list."
                />
            ) : (
                <div className="flex flex-col gap-2">
                    {filtered.map((entry) => (
                        <MovieListItem
                            key={entry.imdbID}
                            movie={entry}
                            listId={listName}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}