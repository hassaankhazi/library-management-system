export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  publishedYear: number;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  coverGradient: string;
  synopsis: string;
  rating: number;
  addedAt: string;
}

export type MemberRole = 'student' | 'faculty' | 'researcher' | 'general';
export type MemberStatus = 'active' | 'suspended' | 'expired';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: MemberRole;
  membershipDate: string;
  status: MemberStatus;
  maxBorrowLimit: number;
  currentBorrowedCount: number;
  department?: string;
}

export type LoanStatus = 'borrowed' | 'returned' | 'overdue';

export interface BorrowRecord {
  id: string;
  bookId: string;
  memberId: string;
  bookTitle: string;
  bookIsbn: string;
  memberName: string;
  memberEmail: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: LoanStatus;
  fineAmount: number;
  finePaid: boolean;
  notes?: string;
  renewedCount: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action:
    | 'BOOK_ADDED'
    | 'BOOK_UPDATED'
    | 'BOOK_DELETED'
    | 'BOOK_BORROWED'
    | 'BOOK_RETURNED'
    | 'BOOK_RENEWED'
    | 'MEMBER_REGISTERED'
    | 'MEMBER_UPDATED'
    | 'MEMBER_DELETED'
    | 'FINE_PAID'
    | 'DB_RESET';
  details: string;
  entityId: string;
  actor: string;
}

export interface SystemStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  totalMembers: number;
  activeLoans: number;
  overdueLoans: number;
  returnedLoans: number;
  totalFinesCollected: number;
  pendingFines: number;
}

export interface TestResultItem {
  id: string;
  name: string;
  category: 'Validation' | 'CRUD' | 'Circulation' | 'Integrity' | 'Calculations';
  status: 'passed' | 'failed';
  durationMs: number;
  assertion: string;
  details?: string;
  error?: string;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  timestamp: string;
  results: TestResultItem[];
}
