import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { BooksCatalogView } from './components/BooksCatalogView';
import { CirculationView } from './components/CirculationView';
import { MembersView } from './components/MembersView';
import { TestingSuiteView } from './components/TestingSuiteView';
import { SubmissionReportView } from './components/SubmissionReportView';
import { BookModal } from './components/BookModal';
import { MemberModal } from './components/MemberModal';
import { IssueModal } from './components/IssueModal';
import { ReturnModal } from './components/ReturnModal';
import { DetailsModal } from './components/DetailsModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Book, Member, BorrowRecord, ActivityLog, SystemStats } from './types/library';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [loading, setLoading] = useState(true);

  // Core Data
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loans, setLoans] = useState<BorrowRecord[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [preselectedBook, setPreselectedBook] = useState<Book | null>(null);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [loanToReturn, setLoanToReturn] = useState<BorrowRecord | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsBook, setDetailsBook] = useState<(Book & { loans?: BorrowRecord[] }) | null>(null);
  const [detailsMember, setDetailsMember] = useState<(Member & { loans?: BorrowRecord[] }) | null>(null);

  const [isResetting, setIsResetting] = useState(false);

  // Toast feedback
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load all system data
  const loadData = useCallback(async () => {
    try {
      const [statsData, booksData, membersData, loansData, activityData] = await Promise.all([
        api.getStats(),
        api.getBooks(),
        api.getMembers(),
        api.getLoans(),
        api.getActivity(),
      ]);
      setStats(statsData);
      setBooks(booksData);
      setMembers(membersData);
      setLoans(loansData);
      setActivity(activityData);
    } catch (err: any) {
      console.error('Failed to load library data:', err);
      addToast('error', 'Database Connection Error', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Books CRUD handlers
  const handleSaveBook = async (bookData: any) => {
    if (bookToEdit) {
      await api.updateBook(bookToEdit.id, bookData);
      addToast('success', 'Book Updated', `Successfully updated "${bookData.title}"`);
    } else {
      await api.createBook(bookData);
      addToast('success', 'Book Cataloged', `Successfully added "${bookData.title}" to catalog`);
    }
    await loadData();
  };

  const handleDeleteBook = async (bookId: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from the catalog?`)) {
      return;
    }
    try {
      await api.deleteBook(bookId);
      addToast('success', 'Book Deleted', `"${title}" removed from catalog.`);
      await loadData();
    } catch (err: any) {
      addToast('error', 'Cannot Delete Book', err.message);
    }
  };

  // Members CRUD handlers
  const handleSaveMember = async (memberData: any) => {
    if (memberToEdit) {
      await api.updateMember(memberToEdit.id, memberData);
      addToast('success', 'Patron Updated', `Updated details for ${memberData.name}`);
    } else {
      await api.createMember(memberData);
      addToast('success', 'Patron Registered', `Enrolled ${memberData.name} with borrow quota.`);
    }
    await loadData();
  };

  const handleDeleteMember = async (memberId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove patron ${name}?`)) {
      return;
    }
    try {
      await api.deleteMember(memberId);
      addToast('success', 'Patron Removed', `Patron account for ${name} deleted.`);
      await loadData();
    } catch (err: any) {
      addToast('error', 'Cannot Delete Patron', err.message);
    }
  };

  // Circulation Handlers
  const handleIssueBook = async (params: { bookId: string; memberId: string; loanDays: number; notes: string }) => {
    try {
      const loan = await api.issueBook(params);
      addToast('success', 'Book Issued Successfully', `Loan created. Due date: ${loan.dueDate}`);
      await loadData();
    } catch (err: any) {
      addToast('error', 'Checkout Failed', err.message);
      throw err;
    }
  };

  const handleReturnBook = async (loanId: string, options: { finePaid: boolean }) => {
    try {
      await api.returnBook(loanId, options);
      addToast('success', 'Book Returned', 'Catalog available copies restored.');
      await loadData();
    } catch (err: any) {
      addToast('error', 'Return Failed', err.message);
      throw err;
    }
  };

  const handleRenewLoan = async (loanId: string) => {
    try {
      const updated = await api.renewLoan(loanId);
      addToast('success', 'Loan Renewed', `New due date: ${updated.dueDate}`);
      await loadData();
    } catch (err: any) {
      addToast('error', 'Renewal Failed', err.message);
    }
  };

  const handlePayFine = async (loanId: string) => {
    try {
      await api.payFine(loanId);
      addToast('success', 'Fine Payment Processed', 'Late fine balance marked as settled.');
      await loadData();
    } catch (err: any) {
      addToast('error', 'Payment Failed', err.message);
    }
  };

  // Reset database to standard seed data
  const handleResetDatabase = async () => {
    if (!confirm('Reset database to default Virtual Internship seed records? This will restore sample books, patrons, and loans.')) {
      return;
    }
    setIsResetting(true);
    try {
      await api.resetDatabase();
      addToast('info', 'Database Reset', 'Default internship seed dataset restored.');
      await loadData();
    } catch (err: any) {
      addToast('error', 'Reset Failed', err.message);
    } finally {
      setIsResetting(false);
    }
  };

  // Open Details Modal for Book or Patron
  const handleOpenBookDetails = async (book: Book) => {
    try {
      const fullBook = await api.getBookById(book.id);
      setDetailsBook(fullBook);
      setDetailsMember(null);
      setIsDetailsModalOpen(true);
    } catch (e: any) {
      addToast('error', 'Failed to load details', e.message);
    }
  };

  const handleOpenMemberDetails = async (member: Member) => {
    try {
      const fullMember = await api.getMemberById(member.id);
      setDetailsMember(fullMember);
      setDetailsBook(null);
      setIsDetailsModalOpen(true);
    } catch (e: any) {
      addToast('error', 'Failed to load details', e.message);
    }
  };

  const overdueLoans = loans.filter((l) => l.status === 'overdue');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenIssueModal={() => {
          setPreselectedBook(null);
          setIsIssueModalOpen(true);
        }}
        onOpenAddBookModal={() => {
          setBookToEdit(null);
          setIsBookModalOpen(true);
        }}
        onResetDatabase={handleResetDatabase}
        isResetting={isResetting}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Connecting to Library Database...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                overdueLoans={overdueLoans}
                recentActivity={activity}
                recentBooks={books}
                onNavigate={setActiveTab}
                onOpenIssueModal={() => {
                  setPreselectedBook(null);
                  setIsIssueModalOpen(true);
                }}
                onReturnLoan={(loanId) => {
                  const target = loans.find((l) => l.id === loanId);
                  if (target) {
                    setLoanToReturn(target);
                    setIsReturnModalOpen(true);
                  }
                }}
              />
            )}

            {activeTab === 'books' && (
              <BooksCatalogView
                books={books}
                onOpenAddModal={() => {
                  setBookToEdit(null);
                  setIsBookModalOpen(true);
                }}
                onOpenEditModal={(book) => {
                  setBookToEdit(book);
                  setIsBookModalOpen(true);
                }}
                onOpenDetailsModal={handleOpenBookDetails}
                onDeleteBook={handleDeleteBook}
                onQuickIssue={(book) => {
                  setPreselectedBook(book);
                  setIsIssueModalOpen(true);
                }}
              />
            )}

            {activeTab === 'circulation' && (
              <CirculationView
                loans={loans}
                onOpenIssueModal={() => {
                  setPreselectedBook(null);
                  setIsIssueModalOpen(true);
                }}
                onReturnLoan={(loan) => {
                  setLoanToReturn(loan);
                  setIsReturnModalOpen(true);
                }}
                onRenewLoan={handleRenewLoan}
                onPayFine={handlePayFine}
              />
            )}

            {activeTab === 'members' && (
              <MembersView
                members={members}
                onOpenAddModal={() => {
                  setMemberToEdit(null);
                  setIsMemberModalOpen(true);
                }}
                onOpenEditModal={(member) => {
                  setMemberToEdit(member);
                  setIsMemberModalOpen(true);
                }}
                onOpenDetailsModal={handleOpenMemberDetails}
                onDeleteMember={handleDeleteMember}
              />
            )}

            {activeTab === 'testing' && (
              <TestingSuiteView onNotify={addToast} />
            )}

            {activeTab === 'submission' && (
              <SubmissionReportView stats={stats} onNotify={addToast} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            <span>BiblioStack LMS</span>
            <span className="mx-2">·</span>
            <span>Virtual Internship Full Stack Development Project</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>React 19 & TypeScript</span>
            <span>Express REST API</span>
            <span className="font-mono">Port 3000</span>
          </div>
        </div>
      </footer>

      {/* Modal Dialogs */}
      <BookModal
        isOpen={isBookModalOpen}
        bookToEdit={bookToEdit}
        onClose={() => setIsBookModalOpen(false)}
        onSubmit={handleSaveBook}
      />

      <MemberModal
        isOpen={isMemberModalOpen}
        memberToEdit={memberToEdit}
        onClose={() => setIsMemberModalOpen(false)}
        onSubmit={handleSaveMember}
      />

      <IssueModal
        isOpen={isIssueModalOpen}
        books={books}
        members={members}
        preselectedBook={preselectedBook}
        onClose={() => {
          setIsIssueModalOpen(false);
          setPreselectedBook(null);
        }}
        onSubmit={handleIssueBook}
      />

      <ReturnModal
        isOpen={isReturnModalOpen}
        loan={loanToReturn}
        onClose={() => {
          setIsReturnModalOpen(false);
          setLoanToReturn(null);
        }}
        onSubmit={handleReturnBook}
      />

      <DetailsModal
        isOpen={isDetailsModalOpen}
        book={detailsBook}
        member={detailsMember}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setDetailsBook(null);
          setDetailsMember(null);
        }}
      />

      {/* Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
