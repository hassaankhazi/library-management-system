import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Grid,
  List,
  Edit2,
  Trash2,
  BookOpen,
  ArrowRightLeft,
  CheckCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Book } from '../types/library';

interface BooksCatalogViewProps {
  books: Book[];
  onOpenAddModal: () => void;
  onOpenEditModal: (book: Book) => void;
  onOpenDetailsModal: (book: Book) => void;
  onDeleteBook: (bookId: string, title: string) => void;
  onQuickIssue: (book: Book) => void;
}

export const BooksCatalogView: React.FC<BooksCatalogViewProps> = ({
  books,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDetailsModal,
  onDeleteBook,
  onQuickIssue,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => set.add(b.category));
    return ['all', ...Array.from(set)];
  }, [books]);

  // Filter books
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Category filter
      if (selectedCategory !== 'all' && book.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'available' && book.availableCopies === 0) return false;
      if (selectedStatus === 'low_stock' && (book.availableCopies === 0 || book.availableCopies > 2)) return false;
      if (selectedStatus === 'unavailable' && book.availableCopies > 0) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesTitle = book.title.toLowerCase().includes(q);
        const matchesAuthor = book.author.toLowerCase().includes(q);
        const matchesIsbn = book.isbn.toLowerCase().includes(q);
        const matchesShelf = book.shelfLocation.toLowerCase().includes(q);
        return matchesTitle || matchesAuthor || matchesIsbn || matchesShelf;
      }

      return true;
    });
  }, [books, selectedCategory, selectedStatus, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Books Catalog Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore holdings, manage bibliographic records, monitor inventory shelf status, and perform full CRUD.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Catalog New Book</span>
        </button>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, author, ISBN (e.g. 978-...), or shelf..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Availability Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md text-xs">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                selectedStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setSelectedStatus('available')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                selectedStatus === 'available' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setSelectedStatus('low_stock')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                selectedStatus === 'low_stock' ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setSelectedStatus('unavailable')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                selectedStatus === 'unavailable' ? 'bg-white text-rose-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Checked Out
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-md p-1 bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium mr-1 shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors capitalize ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat === 'all' ? 'All Disciplines' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Filter Status */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-900 font-mono tabular-nums">{filteredBooks.length}</span> of{' '}
          <span className="font-mono tabular-nums">{books.length}</span> titles
        </div>
        {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
            className="text-slate-500 hover:text-slate-800 underline"
          >
            Reset active filters
          </button>
        )}
      </div>

      {/* Zero State */}
      {filteredBooks.length === 0 && (
        <div className="py-12 px-4 text-center bg-white border border-slate-200 rounded-lg">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900">No books found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            No bibliographic records matched your search criteria or category filter.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Clear filters
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
            >
              Add New Book
            </button>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredBooks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => {
            const isAvailable = book.availableCopies > 0;
            const isLow = book.availableCopies > 0 && book.availableCopies <= 2;

            return (
              <div
                key={book.id}
                className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  {/* Decorative book spine header */}
                  <div
                    className={`h-2 rounded-t-sm w-full bg-linear-to-r ${book.coverGradient} mb-3`}
                  />

                  {/* Title and Author */}
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                    {book.title}
                  </h3>
                  <div className="text-xs text-slate-600 mt-1">{book.author}</div>

                  {/* Unboxed metadata with typographic separators (Rule 1.A) */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
                    <span>{book.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{book.publishedYear}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{book.shelfLocation}</span>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {book.synopsis}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  {/* Stock Availability indicator */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-500 font-mono text-[11px]">
                      ISBN: {book.isbn}
                    </span>
                    <span className="font-mono font-medium tabular-nums">
                      <span
                        className={
                          !isAvailable
                            ? 'text-rose-600 font-semibold'
                            : isLow
                            ? 'text-amber-600 font-semibold'
                            : 'text-emerald-700 font-semibold'
                        }
                      >
                        {book.availableCopies}
                      </span>
                      <span className="text-slate-400"> / {book.totalCopies}</span>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-3">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        !isAvailable ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{
                        width: `${Math.round((book.availableCopies / book.totalCopies) * 100)}%`,
                      }}
                    />
                  </div>

                  {/* Actions bar */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenDetailsModal(book)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenEditModal(book)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                        title="Edit Book"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteBook(book.id, book.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Book"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onQuickIssue(book)}
                      disabled={!isAvailable}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                        isAvailable
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isAvailable ? 'Issue Copy' : 'Checked Out'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredBooks.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Title & Author</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">ISBN</th>
                <th className="py-2.5 px-3">Shelf</th>
                <th className="py-2.5 px-3 text-right">Stock</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBooks.map((book) => {
                const isAvailable = book.availableCopies > 0;
                return (
                  <tr key={book.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{book.title}</div>
                      <div className="text-[11px] text-slate-500">{book.author} · {book.publisher} ({book.publishedYear})</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{book.category}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{book.isbn}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">{book.shelfLocation}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      <span className={isAvailable ? 'text-emerald-700 font-medium' : 'text-rose-600 font-medium'}>
                        {book.availableCopies}
                      </span>
                      <span className="text-slate-400"> / {book.totalCopies}</span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => onQuickIssue(book)}
                        disabled={!isAvailable}
                        className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                          isAvailable
                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Issue
                      </button>
                      <button
                        onClick={() => onOpenEditModal(book)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        onClick={() => onDeleteBook(book.id, book.title)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
