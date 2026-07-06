"use client";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

// Builds the sequence of page numbers/ellipses to render, e.g.
// [1, "ellipsis", 4, 5, 6, "ellipsis", 10] instead of listing every page.
function getPageRange(current: number, total: number): (number | "ellipsis")[] {
    const delta = 1; // how many pages to show on each side of current
    const range: (number | "ellipsis")[] = [];

    const start = Math.max(2, current - delta);
    const end = Math.min(total - 1, current + delta);

    range.push(1); // always show first page

    if (start > 2) range.push("ellipsis");

    for (let i = start; i <= end; i++) range.push(i);

    if (end < total - 1) range.push("ellipsis");

    if (total > 1) range.push(total); // always show last page

    return range;
}

export function MoviePagination({
    page,
    totalPages,
    onPageChange,
    disabled,
}: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
}) {
    if (totalPages <= 1) return null;

    const pages = getPageRange(page, totalPages);

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        aria-disabled={page <= 1 || disabled}
                        className={page <= 1 || disabled ? "pointer-events-none opacity-50" : ""}
                        onClick={(e) => {
                            e.preventDefault();
                            if (page > 1) onPageChange(page - 1);
                        }}
                    />
                </PaginationItem>

                {pages.map((p, i) =>
                    p === "ellipsis" ? (
                        <PaginationItem key={`ellipsis-${i}`}>
                            <PaginationEllipsis />
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={p}>
                            <PaginationLink
                                href="#"
                                isActive={p === page}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onPageChange(p);
                                }}
                            >
                                {p}
                            </PaginationLink>
                        </PaginationItem>
                    )
                )}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        aria-disabled={page >= totalPages || disabled}
                        className={page >= totalPages || disabled ? "pointer-events-none opacity-50" : ""}
                        onClick={(e) => {
                            e.preventDefault();
                            if (page < totalPages) onPageChange(page + 1);
                        }}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}