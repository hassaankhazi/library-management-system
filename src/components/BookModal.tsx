import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Book } from '../types/library';

interface BookModalProps {
  isOpen: boolean;
  bookToEdit: Book | null;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const CATEGORIES = [
  'Computer Science',
  'Software Engineering',
  'Database Systems',
  'DevOps & Cloud',
  'Artificial Intelligence',
  'Philosophy & Math',
  'Physics & Hardware',
  'General Stack',
];

export const BookModal: React.FC<BookModalProps> = ({
  isOpen,
  bookToEdit,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [publisher, setPublisher] = useState('');
  const [publishedYear, setPublishedYear] = useState(new Date().getFullYear());
  const [totalCopies, setTotalCopies] = useState(4);
  const [availableCopies, setAvailableCopies] = useState(4);
  const [shelfLocation, setShelfLocation] = useState('Shelf CS-01A');
  const [synopsis, setSynopsis] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setAuthor(bookToEdit.author);
      setIsbn(bookToEdit.isbn);
      setCategory(bookToEdit.category);
      setPublisher(bookToEdit.publisher);
      setPublishedYear(bookToEdit.publishedYear);
      setTotalCopies(bookToEdit.totalCopies);
      setAvailableCopies(bookToEdit.availableCopies);
      setShelfLocation(bookToEdit.shelfLocation);
      setSynopsis(bookToEdit.synopsis || '');
    } else {
      setTitle('');
      setAuthor('');
      setIsbn('');
      setCategory(CATEGORIES[0]);
      setPublisher('');
      setPublishedYear(new Date().getFullYear());
      setTotalCopies(4);
      setAvailableCopies(4);
      setShelfLocation('Shelf CS-01A');
      setSynopsis('');
    }
    setErrors({});
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!author.trim()) newErrors.author = 'Author name is required';

    // ISBN validation: must be 10 or 13 digits with optional dashes
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    if (!cleanIsbn) {
      newErrors.isbn = 'ISBN is required';
    } else if (!/^(97[89])?\d{9}[\dX]$/i.test(cleanIsbn)) {
      newErrors.isbn = 'Invalid ISBN. Provide a valid 10 or 13 digit ISBN (e.g. 978-0134494166)';
    }

    if (!publisher.trim()) newErrors.publisher = 'Publisher is required';

    const total = Number(totalCopies);
    const avail = Number(availableCopies);

    if (isNaN(total) || total < 1) {
      newErrors.totalCopies = 'Total copies must be at least 1';
    }
    if (isNaN(avail) || avail < 0) {
      newErrors.availableCopies = 'Available copies cannot be negative';
    } else if (avail > total) {
      newErrors.availableCopies = `Available copies (${avail}) cannot exceed total copies (${total})`;
    }

    if (!shelfLocation.trim()) newErrors.shelfLocation = 'Shelf location required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim(),
        category,
        publisher: publisher.trim(),
        publishedYear: Number(publishedYear),
        totalCopies: Number(totalCopies),
        availableCopies: Number(availableCopies),
        shelfLocation: shelfLocation.trim(),
        synopsis: synopsis.trim(),
        coverGradient: bookToEdit ? bookToEdit.coverGradient : 'from-indigo-800 to-slate-900',
        rating: bookToEdit ? bookToEdit.rating : 4.8,
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden my-8">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            {bookToEdit ? 'Edit Bibliographic Record' : 'Catalog New Book'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {errors.form && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Book Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Designing Data-Intensive Applications"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            />
            {errors.title && <p className="text-[11px] text-rose-600 mt-0.5">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Author(s) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Martin Kleppmann"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
              {errors.author && <p className="text-[11px] text-rose-600 mt-0.5">{errors.author}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ISBN-10 / ISBN-13 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-0134494166"
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
              {errors.isbn && <p className="text-[11px] text-rose-600 mt-0.5">{errors.isbn}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Shelf Coordinates <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="e.g. Shelf CS-02B"
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
              {errors.shelfLocation && <p className="text-[11px] text-rose-600 mt-0.5">{errors.shelfLocation}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Publisher
              </label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="O'Reilly Media"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Total Copies <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={totalCopies}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 1;
                  setTotalCopies(val);
                  if (!bookToEdit) setAvailableCopies(val);
                }}
                className="w-full px-3 py-1.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
              {errors.totalCopies && <p className="text-[11px] text-rose-600 mt-0.5">{errors.totalCopies}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Available Copies
              </label>
              <input
                type="number"
                min="0"
                max={totalCopies}
                value={availableCopies}
                onChange={(e) => setAvailableCopies(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-1.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
              {errors.availableCopies && <p className="text-[11px] text-rose-600 mt-0.5">{errors.availableCopies}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Synopsis / Subject Summary
            </label>
            <textarea
              rows={2}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Brief summary of book contents and scope..."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : bookToEdit ? 'Save Changes' : 'Catalog Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
