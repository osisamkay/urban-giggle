'use client';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize?: number;
    totalItems?: number;
    showPageSize?: boolean;
    pageSizeOptions?: number[];
    onPageSizeChange?: (size: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    pageSize = 10,
    totalItems,
    showPageSize = false,
    pageSizeOptions = [10, 20, 50, 100],
    onPageSizeChange,
}: PaginationProps) {
    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('ellipsis');
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('ellipsis');
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (totalPages <= 1 && !showPageSize) {
        return null;
    }

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems || currentPage * pageSize);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            {/* Page size selector */}
            {showPageSize && onPageSizeChange && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Show</span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-meat-500 focus:border-meat-500 outline-none"
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                    <span>per page</span>
                </div>
            )}

            {/* Item count */}
            {totalItems !== undefined && (
                <div className="text-sm text-gray-600">
                    Showing {startItem} to {endItem} of {totalItems} items
                </div>
            )}

            {/* Pagination controls */}
            {totalPages > 1 && (
                <div className="flex items-center gap-1">
                    {/* Previous button */}
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`
                            p-2 rounded-md transition-colors
                            ${currentPage === 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }
                        `}
                        aria-label="Previous page"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, idx) => (
                            page === 'ellipsis' ? (
                                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-400">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`
                                        px-3 py-1 rounded-md text-sm font-medium transition-colors
                                        ${currentPage === page
                                            ? 'bg-meat-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }
                                    `}
                                    aria-label={`Page ${page}`}
                                    aria-current={currentPage === page ? 'page' : undefined}
                                >
                                    {page}
                                </button>
                            )
                        ))}
                    </div>

                    {/* Next button */}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`
                            p-2 rounded-md transition-colors
                            ${currentPage === totalPages
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }
                        `}
                        aria-label="Next page"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}

// Hook for managing pagination state
export function usePagination(initialPage = 1, initialPageSize = 10) {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    const reset = () => {
        setCurrentPage(1);
    };

    return {
        currentPage,
        pageSize,
        setCurrentPage: handlePageChange,
        setPageSize: handlePageSizeChange,
        reset,
    };
}

import { useState } from 'react';

// Paginate an array of items
export function paginateItems<T>(items: T[], page: number, pageSize: number): {
    items: T[];
    totalPages: number;
    totalItems: number;
} {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
        items: items.slice(startIndex, endIndex),
        totalPages,
        totalItems,
    };
}
