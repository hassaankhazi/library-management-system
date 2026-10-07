import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ArrowRightLeft, Calendar } from 'lucide-react';
import { Book, Member } from '../types/library';

interface IssueModalProps {
  isOpen: boolean;
  books: Book[];
  members: Member[];
  preselectedBook?: Book | null;
  onClose: () => void;
  onSubmit: (data: { bookId: string; memberId: string; loanDays: number; notes: string }) => Promise<void>;
}

export const IssueModal: React.FC<IssueModalProps> = ({
  isOpen,
  books,
  members,
  preselectedBook,
  onClose,
  onSubmit,
}) => {
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loanDays, setLoanDays] = useState(14);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedBook) {
      setSelectedBookId(preselectedBook.id);
    } else if (books.length > 0) {
      const avail = books.find((b) => b.availableCopies > 0);
      if (avail) setSelectedBookId(avail.id);
    }

    if (members.length > 0) {
      setSelectedMemberId(members[0].id);
    }
    setError(null);
  }, [isOpen, preselectedBook, books, members]);

  if (!isOpen) return null;

  const currentBook = books.find((b) => b.id === selectedBookId);
  const currentMember = members.find((m) => m.id === selectedMemberId);

  // Compute preview due date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + Number(loanDays));
  const dueDateStr = dueDate.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedBookId) {
      setError('Please select a book to issue.');
      return;
    }
    if (!selectedMemberId) {
      setError('Please select a patron.');
      return;
    }

    if (currentBook && currentBook.availableCopies <= 0) {
      setError(`"${currentBook.title}" has no available copies left in stock.`);
      return;
    }

    if (currentMember) {
      if (currentMember.status !== 'active') {
        setError(`Cannot issue book: Patron account is ${currentMember.status}.`);
        return;
      }
      if (currentMember.currentBorrowedCount >= currentMember.maxBorrowLimit) {
        setError(
          `Patron has reached their maximum borrowing quota of ${currentMember.maxBorrowLimit} books.`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        bookId: selectedBookId,
        memberId: selectedMemberId,
        loanDays: Number(loanDays),
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center">
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Issue Book to Patron</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {error && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Patron */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Select Patron / Member <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            >
              {members.map((m) => {
                const isMax = m.currentBorrowedCount >= m.maxBorrowLimit;
                return (
                  <option key={m.id} value={m.id} disabled={m.status !== 'active'}>
                    {m.name} ({m.role.toUpperCase()}) — {m.currentBorrowedCount}/{m.maxBorrowLimit} books
                    {m.status !== 'active' ? ` [${m.status.toUpperCase()}]` : ''}
                    {isMax ? ' [QUOTA FULL]' : ''}
                  </option>
                );
              })}
            </select>

            {currentMember && (
              <div className="mt-1.5 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Contact: {currentMember.email}</span>
                <span className="font-mono tabular-nums">
                  Quota: {currentMember.currentBorrowedCount} / {currentMember.maxBorrowLimit}
                </span>
              </div>
            )}
          </div>

          {/* Select Book */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Select Book Title <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                  {b.title} ({b.availableCopies}/{b.totalCopies} available)
                  {b.availableCopies <= 0 ? ' [NO COPIES]' : ''}
                </option>
              ))}
            </select>

            {currentBook && (
              <div className="mt-1.5 text-[11px] text-slate-500 flex items-center justify-between">
                <span className="font-mono">{currentBook.shelfLocation}</span>
                <span className="font-mono tabular-nums text-emerald-700 font-medium">
                  {currentBook.availableCopies} available copies
                </span>
              </div>
            )}
          </div>

          {/* Loan Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Loan Term
              </label>
              <select
                value={loanDays}
                onChange={(e) => setLoanDays(parseInt(e.target.value, 10))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              >
                <option value={7}>7 Days (1 Week)</option>
                <option value={14}>14 Days (Standard 2 Weeks)</option>
                <option value={21}>21 Days (3 Weeks)</option>
                <option value={28}>28 Days (Faculty 4 Weeks)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Calculated Due Date
              </label>
              <div className="px-3 py-1.5 text-xs font-mono tabular-nums bg-slate-100 border border-slate-200 rounded-md text-slate-800">
                {dueDateStr}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Circulation Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Thesis research project, textbook reserve"
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
              {isSubmitting ? 'Checking out...' : 'Confirm Loan Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
