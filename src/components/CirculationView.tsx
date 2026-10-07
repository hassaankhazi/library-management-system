import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { BorrowRecord } from '../types/library';

interface CirculationViewProps {
  loans: BorrowRecord[];
  onOpenIssueModal: () => void;
  onReturnLoan: (loan: BorrowRecord) => void;
  onRenewLoan: (loanId: string) => void;
  onPayFine: (loanId: string) => void;
}

export const CirculationView: React.FC<CirculationViewProps> = ({
  loans,
  onOpenIssueModal,
  onReturnLoan,
  onRenewLoan,
  onPayFine,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'borrowed' | 'overdue' | 'returned'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLoans = loans.filter((loan) => {
    if (filterStatus !== 'all' && loan.status !== filterStatus) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchBook = loan.bookTitle.toLowerCase().includes(q);
      const matchMember = loan.memberName.toLowerCase().includes(q);
      const matchIsbn = loan.bookIsbn.toLowerCase().includes(q);
      const matchEmail = loan.memberEmail.toLowerCase().includes(q);
      return matchBook || matchMember || matchIsbn || matchEmail;
    }
    return true;
  });

  const activeCount = loans.filter((l) => l.status === 'borrowed').length;
  const overdueCount = loans.filter((l) => l.status === 'overdue').length;
  const returnedCount = loans.filter((l) => l.status === 'returned').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Circulation Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Issue books, process returns, calculate late fines automatically, and manage loan renewals.
          </p>
        </div>

        <button
          onClick={onOpenIssueModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New Loan</span>
        </button>
      </div>

      {/* Circulation Tabs & Filters */}
      <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status selector tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records ({loans.length})
            </button>
            <button
              onClick={() => setFilterStatus('borrowed')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                filterStatus === 'borrowed'
                  ? 'bg-white text-blue-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Loans ({activeCount})
            </button>
            <button
              onClick={() => setFilterStatus('overdue')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                filterStatus === 'overdue'
                  ? 'bg-white text-rose-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overdue ({overdueCount})
            </button>
            <button
              onClick={() => setFilterStatus('returned')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                filterStatus === 'returned'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Returned ({returnedCount})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search patron, book, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-2.5 px-4">Book Title & ISBN</th>
              <th className="py-2.5 px-3">Borrowing Patron</th>
              <th className="py-2.5 px-3">Loan Period</th>
              <th className="py-2.5 px-3">Status & Due</th>
              <th className="py-2.5 px-3 text-right">Fine Balance</th>
              <th className="py-2.5 px-4 text-right">Circulation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLoans.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                  No circulation records matching current criteria.
                </td>
              </tr>
            ) : (
              filteredLoans.map((loan) => {
                const isOverdue = loan.status === 'overdue';
                const isReturned = loan.status === 'returned';

                return (
                  <tr key={loan.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Book Info */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{loan.bookTitle}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">{loan.bookIsbn}</div>
                      {loan.notes && (
                        <div className="text-[10px] text-slate-400 italic mt-0.5">{loan.notes}</div>
                      )}
                    </td>

                    {/* Patron Info */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{loan.memberName}</div>
                      <div className="text-[11px] text-slate-500">{loan.memberEmail}</div>
                    </td>

                    {/* Loan Period */}
                    <td className="py-3 px-3">
                      <div className="text-slate-700">Borrowed: {loan.borrowDate}</div>
                      {isReturned ? (
                        <div className="text-[11px] text-emerald-700">Returned: {loan.returnDate}</div>
                      ) : (
                        <div className="text-[11px] text-slate-500">
                          Due: <span className="font-medium">{loan.dueDate}</span>
                          {loan.renewedCount > 0 && ` (${loan.renewedCount}x renewed)`}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {isReturned && (
                        <div className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Returned</span>
                        </div>
                      )}
                      {loan.status === 'borrowed' && (
                        <div className="inline-flex items-center gap-1 text-blue-700 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Active Loan</span>
                        </div>
                      )}
                      {isOverdue && (
                        <div className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Overdue</span>
                        </div>
                      )}
                    </td>

                    {/* Fine Balance */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {loan.fineAmount > 0 ? (
                        <div>
                          <div className={loan.finePaid ? 'text-slate-400 line-through' : 'text-rose-700 font-bold'}>
                            ${loan.fineAmount.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {loan.finePaid ? 'Settled' : 'Unpaid'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">$0.00</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {!isReturned ? (
                        <>
                          <button
                            onClick={() => onReturnLoan(loan)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                          >
                            Return
                          </button>
                          {!isOverdue && (
                            <button
                              onClick={() => onRenewLoan(loan.id)}
                              disabled={loan.renewedCount >= 2}
                              className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors disabled:opacity-40"
                              title="Renew loan for additional 14 days"
                            >
                              Renew
                            </button>
                          )}
                        </>
                      ) : (
                        loan.fineAmount > 0 && !loan.finePaid && (
                          <button
                            onClick={() => onPayFine(loan.id)}
                            className="px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded transition-colors"
                          >
                            Pay Fine
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
