import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, DollarSign } from 'lucide-react';
import { BorrowRecord } from '../types/library';

interface ReturnModalProps {
  isOpen: boolean;
  loan: BorrowRecord | null;
  onClose: () => void;
  onSubmit: (loanId: string, options: { finePaid: boolean }) => Promise<void>;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  loan,
  onClose,
  onSubmit,
}) => {
  const [finePaid, setFinePaid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !loan) return null;

  const isOverdue = loan.status === 'overdue' || loan.fineAmount > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(loan.id, { finePaid });
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
          <h2 className="text-sm font-bold text-slate-900">Process Book Return</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Book & Patron Details */}
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-2 text-xs">
            <div>
              <span className="text-slate-400">Book Title:</span>
              <p className="font-semibold text-slate-900 mt-0.5">{loan.bookTitle}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
              <div>
                <span className="text-slate-400">Borrower:</span>
                <p className="font-medium text-slate-800">{loan.memberName}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Due Date:</span>
                <p className="font-mono text-slate-800">{loan.dueDate}</p>
              </div>
            </div>
          </div>

          {/* Overdue / Fine Notice */}
          {isOverdue ? (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Overdue Assessment ($0.50/day rate)</span>
              </div>
              <div className="flex items-center justify-between text-xs text-rose-800 font-mono">
                <span>Calculated Late Fine:</span>
                <span className="text-base font-bold tabular-nums">${loan.fineAmount.toFixed(2)}</span>
              </div>

              <label className="flex items-center gap-2 pt-2 border-t border-rose-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={finePaid}
                  onChange={(e) => setFinePaid(e.target.checked)}
                  className="rounded text-rose-700 focus:ring-rose-500"
                />
                <span className="text-xs text-rose-900 font-medium">
                  Collect fine of ${loan.fineAmount.toFixed(2)} immediately at desk
                </span>
              </label>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Book is returned on schedule. No late penalties applicable.</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
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
              {isSubmitting ? 'Processing...' : 'Confirm Return & Restock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
