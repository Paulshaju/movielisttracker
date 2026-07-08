'use client'

import { useState } from 'react'
import { Link2, ListPlus, Trash2, Layers } from 'lucide-react'
import { useSnapshot } from 'valtio'
import { movieStore, addNewCustomList, deleteCustomList, getList } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import Image from 'next/image'
import { EmptyState } from '../../Common/EmptyState'
import { ListDetailView } from './ListDetail'

const PLACEHOLDER = '/placeholder.jpg'
const PREDEFINED_LISTS = ['watched', 'watchlist']

export function CustomList() {
    const snap = useSnapshot(movieStore)
    const [activeListName, setActiveListName] = useState<string | null>(null)
    const [newListName, setNewListName] = useState('')
    const [deletingName, setDeletingName] = useState<string | null>(null)

    if (activeListName) {
        return (
            <ListDetailView
                listName={activeListName}
                onBack={() => setActiveListName(null)}
            />
        )
    }

    const customListNames = [...snap.playlists.keys()].filter(
        (name) => !PREDEFINED_LISTS.includes(name)
    )

    function handleCreateList() {
        if (!newListName.trim()) return
        addNewCustomList(newListName.trim())
        setNewListName('')
    }

    function handleShare(listName: string) {
        const entries = getList(listName)
        const encoded = encodeURIComponent(JSON.stringify({ name: listName, entries }))
        const url = `${window.location.origin}/list/share?data=${encoded}`
        navigator.clipboard.writeText(url).then(() => {
            toast.success('Share link copied to clipboard')
        })
    }

    function confirmDelete(name: string) {
        setDeletingName(name)
    }

    function handleDeleteConfirm() {
        if (!deletingName) return
        deleteCustomList(deletingName)
        toast.success('List deleted')
        setDeletingName(null)
    }

    return (
        <>
            <div className="flex flex-col gap-6">
                {/* Create new list */}
                <div className="flex gap-2">
                    <Input
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.nativeEvent.isComposing || e.keyCode === 229) return
                            if (e.key === 'Enter') handleCreateList()
                        }}
                        placeholder="New list name…"
                        className="h-10 bg-secondary border-border text-sm"
                    />
                    <Button
                        onClick={handleCreateList}
                        disabled={!newListName.trim()}
                        className="shrink-0 gap-1.5"
                    >
                        <ListPlus className="h-4 w-4" />
                        Create
                    </Button>
                </div>

                {/* List cards */}
                {customListNames.length === 0 ? (
                    <EmptyState
                        icon={Layers}
                        title="No lists yet"
                        description="Create your first list above and start adding movies."
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {customListNames.map((listName) => {
                            const entries = snap.playlists.get(listName) ?? []
                            const previewPosters = entries
                                .slice(0, 4)
                                .map((e) => (e.Poster && e.Poster !== 'N/A' ? e.Poster : PLACEHOLDER))

                            return (
                                <div
                                    key={listName}
                                    role="button"
                                    tabIndex={0}
                                    className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-md hover:shadow-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 cursor-pointer"
                                    onClick={() => setActiveListName(listName)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            setActiveListName(listName)
                                        }
                                    }}
                                >
                                    {/* Poster strip */}
                                    <div className="flex gap-1.5 overflow-hidden rounded-md">
                                        {Array.from({ length: 4 }, (_, i) => previewPosters[i]).map((src, i) => (
                                            <div
                                                key={i}
                                                className="relative aspect-[2/3] flex-1 overflow-hidden rounded bg-muted/50"
                                            >
                                                {src && (
                                                    <Image
                                                        src={src}
                                                        alt=""
                                                        fill
                                                        sizes="80px"
                                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                        unoptimized
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* List info + actions */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-semibold text-foreground">
                                                {listName}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {entries.length} {entries.length === 1 ? 'movie' : 'movies'}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                onClick={() => confirmDelete(listName)}
                                                aria-label={`Delete ${listName}`}
                                                title="Delete list"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Confirm delete dialog */}
            <Dialog open={!!deletingName} onOpenChange={(open) => !open && setDeletingName(null)}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>Delete &ldquo;{deletingName}&rdquo;?</DialogTitle>
                        <DialogDescription>
                            This will permanently remove the list and all its entries. This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingName(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}