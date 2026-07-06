'use client';

export function EmptyState({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center gap-2 min-w-xl rounded-lg border border-dashed py-12 text-center">
            <Icon className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}