import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface TagBadgeProps {
    tag: string
    onRemove?: () => void
    className?: string
    active?: boolean
    onClick?: () => void
}

export function TagBadge({ tag, onRemove, className, active, onClick }: TagBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full h-6 border px-2 py-0.5 text-[11px] capitalize font-medium transition-colors',
                active
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border bg-muted/50 text-muted-foreground',
                onClick && 'cursor-pointer hover:border-primary/60 hover:text-foreground',
                className
            )}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
        >
            {tag}
            {onRemove && (
                <Button
                    type="button"
                    variant={'outline'}
                    size={'xs'}
                    onClick={(e) => { e.stopPropagation(); onRemove() }}
                    className="ml-0.5 rounded-full h-auto text-muted-foreground capitalize bg-transparent shadow-none p-0 hover:text-foreground focus:outline-none cusrsor-pointer"
                    aria-label={`Remove tag ${tag}`}
                >
                    <X className="h-2.5 w-2.5" />
                </Button>
            )}
        </span>
    )
}
