import React from 'react';
import {
  BookOpen,
  Users,
  ArrowRightLeft,
  AlertTriangle,
  DollarSign,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  BookmarkCheck,
  Search,
} from 'lucide-react';
import { SystemStats, BorrowRecord, ActivityLog, Book } from '../types/library';

interface DashboardViewProps {
  stats: SystemStats | null;
  overdueLoans: BorrowRecord[];
  recentActivity: ActivityLog[];
  recentBooks: Book[];
  onNavigate: (tab: 'books' | 'circulation' | 'members' | 'testing' | 'submission') => void;
  onOpenIssueModal: () => void;
  onReturnLoan: (loanId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  overdueLoans,
  recentActivity,
  recentBooks,
  onNavigate,
  onOpenIssueModal,
  onReturnLoan,
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            System Operations Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time library metrics, circulation telemetry, and inventory circulation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('testing')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Run Test Suite
          </button>
          <button
            onClick={() => onNavigate('submission')}
            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-2xs"
          >
            Internship Dossier
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs font-medium text-slate-500">Unique Titles</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {stats ? stats.totalBooks : '—'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">In primary stack</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs font-medium text-slate-500">Available Volume</div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {stats ? `${stats.availableCopies} / ${stats.totalCopies}` : '—'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Total shelf holdings</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs font-medium text-slate-500">Active Patrons</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {stats ? stats.totalMembers : '—'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Registered members</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs font-medium text-slate-500">Current Loans</div>
          <div className="mt-2 text-2xl font-bold text-blue-700 font-mono tabular-nums">
            {stats ? stats.activeLoans : '—'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Currently in circulation</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs font-medium text-slate-500">Overdue Items</div>
          <div
            className={`mt-2 text-2xl font-bold font-mono tabular-nums ${
              stats && stats.overdueLoans > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            {stats ? stats.overdueLoans : '—'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Past return date</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs font-medium text-slate-500">Unpaid Fines</div>
          <div className="mt-2 text-2xl font-bold text-amber-700 font-mono tabular-nums">
            ${stats ? stats.pendingFines.toFixed(2) : '0.00'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            ${stats ? stats.totalFinesCollected.toFixed(2) : '0.00'} collected
          </div>
        </div>
      </div>

      {/* Overdue Action Banner */}
      {overdueLoans.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-rose-900">
                  {overdueLoans.length} Overdue Book Loan{overdueLoans.length > 1 ? 's' : ''} Require Attention
                </h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  Fines accumulate at $0.50 per overdue day. Prompt return restocks catalog availability.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('circulation')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-md transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              Open Circulation Desk
            </button>
          </div>

          <div className="mt-3 divide-y divide-rose-200/60 border-t border-rose-200/60">
            {overdueLoans.slice(0, 3).map((loan) => (
              <div key={loan.id} className="py-2 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-slate-900">{loan.bookTitle}</span>
                  <span className="text-rose-800 ml-2">· {loan.memberName}</span>
                  <span className="text-rose-600 ml-2">· Due {loan.dueDate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold text-rose-700 tabular-nums">
                    ${loan.fineAmount.toFixed(2)} fine
                  </span>
                  <button
                    onClick={() => onReturnLoan(loan.id)}
                    className="px-2 py-0.5 text-[11px] font-medium bg-white text-rose-800 border border-rose-300 rounded hover:bg-rose-100 transition-colors"
                  >
                    Process Return
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Catalog & Quick Actions (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Circulation Card */}
          <div className="p-5 bg-white border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold tracking-tight text-slate-900">
                Circulation Quick Desk
              </h2>
              <span className="text-xs text-slate-400">Full stack workflows</span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-md bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900">Issue New Book Loan</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Verify patron limits, check active holds, select available copy, and set automated due date.
                </p>
                <button
                  onClick={onOpenIssueModal}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-900 hover:text-slate-700"
                >
                  <span>Launch Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-md bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-emerald-700 text-white flex items-center justify-center">
                    <BookmarkCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900">Catalog Search & Stock</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Instant debounced lookup by ISBN, title, author, or physical shelf location.
                </p>
                <button
                  onClick={() => onNavigate('books')}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 hover:text-emerald-950"
                >
                  <span>Browse Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Featured Books in Library */}
          <div className="p-5 bg-white border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold tracking-tight text-slate-900">
                High-Circulation Holdings
              </h2>
              <button
                onClick={() => onNavigate('books')}
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                View all titles &rarr;
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {recentBooks.slice(0, 4).map((book) => (
                <div key={book.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                      {book.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{book.author}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{book.shelfLocation}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[11px]">{book.isbn}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-medium tabular-nums">
                      <span
                        className={
                          book.availableCopies === 0
                            ? 'text-rose-600 font-semibold'
                            : book.availableCopies <= 2
                            ? 'text-amber-600 font-semibold'
                            : 'text-emerald-700 font-semibold'
                        }
                      >
                        {book.availableCopies}
                      </span>
                      <span className="text-slate-400"> / {book.totalCopies} left</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{book.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Activity Audit Stream & System Specs (1 col) */}
        <div className="space-y-6">
          {/* Recent Activity Audit */}
          <div className="p-5 bg-white border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold tracking-tight text-slate-900">
                Audit Stream
              </h2>
              <span className="text-xs text-slate-400">Persistent logs</span>
            </div>

            <div className="mt-4 space-y-3.5">
              {recentActivity.slice(0, 6).map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-800 leading-snug break-words font-medium">
                      {log.details}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span>{log.actor}</span>
                      <span>·</span>
                      <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Internship Project Architecture Summary */}
          <div className="p-5 bg-slate-900 text-slate-100 rounded-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Virtual Internship Module
            </h3>
            <h4 className="mt-1 text-sm font-semibold text-white">
              Full Stack Development Concepts
            </h4>
            <div className="mt-3 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Responsive interface with Tailwind CSS</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Persistent database with REST API</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Full CRUD for books, patrons, circulation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ISBN, email, and stock integrity validation</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('submission')}
              className="mt-4 w-full py-2 px-3 text-xs font-medium text-slate-900 bg-white hover:bg-slate-100 rounded transition-colors text-center"
            >
              Review Project Submission Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
