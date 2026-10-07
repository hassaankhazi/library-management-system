import React from 'react';
import { X, BookOpen, Users, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Book, Member, BorrowRecord } from '../types/library';

interface DetailsModalProps {
  isOpen: boolean;
  book: (Book & { loans?: BorrowRecord[] }) | null;
  member: (Member & { loans?: BorrowRecord[] }) | null;
  onClose: () => void;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  isOpen,
  book,
  member,
  onClose,
}) => {
  if (!isOpen || (!book && !member)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {book ? (
              <BookOpen className="w-4 h-4 text-slate-700" />
            ) : (
              <Users className="w-4 h-4 text-slate-700" />
            )}
            <h2 className="text-sm font-bold text-slate-900">
              {book ? 'Bibliographic Record & History' : 'Patron Profile & Activity'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {book && (
            <>
              <div>
                <h3 className="text-base font-bold text-slate-900">{book.title}</h3>
                <p className="text-slate-600 mt-0.5">{book.author}</p>
                <div className="flex items-center gap-2 text-slate-500 mt-2 text-[11px]">
                  <span>{book.category}</span>
                  <span>·</span>
                  <span>{book.publisher}</span>
                  <span>·</span>
                  <span>{book.publishedYear}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-md border border-slate-200">
                <div>
                  <span className="text-slate-400">ISBN:</span>
                  <p className="font-mono font-medium text-slate-800">{book.isbn}</p>
                </div>
                <div>
                  <span className="text-slate-400">Physical Shelf:</span>
                  <p className="font-mono font-medium text-slate-800">{book.shelfLocation}</p>
                </div>
                <div>
                  <span className="text-slate-400">Inventory Stock:</span>
                  <p className="font-mono font-medium tabular-nums text-slate-800">
                    {book.availableCopies} available / {book.totalCopies} total
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Cataloged Date:</span>
                  <p className="font-mono text-slate-800">{book.addedAt}</p>
                </div>
              </div>

              <div>
                <span className="font-medium text-slate-700">Synopsis:</span>
                <p className="text-slate-600 mt-1 leading-relaxed">{book.synopsis}</p>
              </div>

              {/* Loan History */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Circulation History for this Title</h4>
                {book.loans && book.loans.length > 0 ? (
                  <div className="space-y-2">
                    {book.loans.map((l) => (
                      <div
                        key={l.id}
                        className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-slate-800">{l.memberName}</div>
                          <div className="text-[11px] text-slate-400">
                            Borrowed: {l.borrowDate} · Due: {l.dueDate}
                          </div>
                        </div>
                        <span
                          className={`font-semibold capitalize ${
                            l.status === 'returned'
                              ? 'text-emerald-700'
                              : l.status === 'overdue'
                              ? 'text-rose-700'
                              : 'text-blue-700'
                          }`}
                        >
                          {l.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No checkout history recorded for this title.</p>
                )}
              </div>
            </>
          )}

          {member && (
            <>
              <div>
                <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
                <p className="text-slate-600 capitalize mt-0.5">{member.role} Patron</p>
                <div className="flex items-center gap-2 text-slate-500 mt-2 text-[11px]">
                  <span>{member.email}</span>
                  <span>·</span>
                  <span className="font-mono">{member.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-md border border-slate-200">
                <div>
                  <span className="text-slate-400">Department:</span>
                  <p className="font-medium text-slate-800">{member.department || 'General'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Account Status:</span>
                  <p className="font-medium capitalize text-slate-800">{member.status}</p>
                </div>
                <div>
                  <span className="text-slate-400">Borrowing Quota:</span>
                  <p className="font-mono font-medium tabular-nums text-slate-800">
                    {member.currentBorrowedCount} / {member.maxBorrowLimit} books
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Registered On:</span>
                  <p className="font-mono text-slate-800">{member.membershipDate}</p>
                </div>
              </div>

              {/* Loan History */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Patron Borrowing Activity</h4>
                {member.loans && member.loans.length > 0 ? (
                  <div className="space-y-2">
                    {member.loans.map((l) => (
                      <div
                        key={l.id}
                        className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-slate-800">{l.bookTitle}</div>
                          <div className="text-[11px] text-slate-400">
                            Due: {l.dueDate} {l.fineAmount > 0 && `· Fine: $${l.fineAmount.toFixed(2)}`}
                          </div>
                        </div>
                        <span
                          className={`font-semibold capitalize ${
                            l.status === 'returned'
                              ? 'text-emerald-700'
                              : l.status === 'overdue'
                              ? 'text-rose-700'
                              : 'text-blue-700'
                          }`}
                        >
                          {l.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No checkout history recorded for this patron.</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
