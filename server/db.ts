import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSchema, Book, Member, BorrowRecord, ActivityLog, SystemStats } from './types.js';
import { getInitialSeedData } from './seeds.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'library_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class LibraryDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
    this.recalculateOverdueFines();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.books && parsed.members && parsed.loans) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read database file, initializing with fresh seed data.', e);
    }

    const initial = getInitialSeedData();
    this.saveData(initial);
    return initial;
  }

  private saveData(customData?: DatabaseSchema): void {
    const toSave = customData || this.data;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing to database file:', e);
    }
  }

  public recalculateOverdueFines(): void {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const FINE_PER_DAY = 0.50; // $0.50 per day overdue

    let modified = false;
    for (const loan of this.data.loans) {
      if (loan.status !== 'returned') {
        const dueDate = new Date(loan.dueDate);
        const overdueDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        if (overdueDays > 0) {
          loan.status = 'overdue';
          const calculatedFine = Number((overdueDays * FINE_PER_DAY).toFixed(2));
          if (loan.fineAmount !== calculatedFine && !loan.finePaid) {
            loan.fineAmount = calculatedFine;
            modified = true;
          }
        } else {
          loan.status = 'borrowed';
        }
      }
    }

    // Refresh current borrowed counts for members
    const memberCounts: Record<string, number> = {};
    for (const loan of this.data.loans) {
      if (loan.status !== 'returned') {
        memberCounts[loan.memberId] = (memberCounts[loan.memberId] || 0) + 1;
      }
    }
    for (const member of this.data.members) {
      const activeCount = memberCounts[member.id] || 0;
      if (member.currentBorrowedCount !== activeCount) {
        member.currentBorrowedCount = activeCount;
        modified = true;
      }
    }

    if (modified) {
      this.saveData();
    }
  }

  public logActivity(action: ActivityLog['action'], details: string, entityId: string, actor: string = 'Staff / System'): void {
    const item: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      entityId,
      actor,
    };
    this.data.activity.unshift(item);
    // Keep last 100 entries
    if (this.data.activity.length > 100) {
      this.data.activity = this.data.activity.slice(0, 100);
    }
    this.saveData();
  }

  // --- STATS ---
  public getStats(): SystemStats {
    this.recalculateOverdueFines();
    const totalBooks = this.data.books.length;
    let totalCopies = 0;
    let availableCopies = 0;
    for (const b of this.data.books) {
      totalCopies += b.totalCopies;
      availableCopies += b.availableCopies;
    }
    const totalMembers = this.data.members.length;
    const activeLoans = this.data.loans.filter(l => l.status === 'borrowed').length;
    const overdueLoans = this.data.loans.filter(l => l.status === 'overdue').length;
    const returnedLoans = this.data.loans.filter(l => l.status === 'returned').length;

    let totalFinesCollected = 0;
    let pendingFines = 0;
    for (const l of this.data.loans) {
      if (l.fineAmount > 0) {
        if (l.finePaid) {
          totalFinesCollected += l.fineAmount;
        } else {
          pendingFines += l.fineAmount;
        }
      }
    }

    return {
      totalBooks,
      totalCopies,
      availableCopies,
      totalMembers,
      activeLoans,
      overdueLoans,
      returnedLoans,
      totalFinesCollected: Number(totalFinesCollected.toFixed(2)),
      pendingFines: Number(pendingFines.toFixed(2)),
    };
  }

  // --- BOOKS CRUD ---
  public getBooks(query?: { search?: string; category?: string; status?: string }): Book[] {
    let list = [...this.data.books];
    if (query?.category && query.category !== 'all') {
      list = list.filter(b => b.category.toLowerCase() === query.category!.toLowerCase());
    }
    if (query?.status) {
      if (query.status === 'available') {
        list = list.filter(b => b.availableCopies > 0);
      } else if (query.status === 'unavailable') {
        list = list.filter(b => b.availableCopies === 0);
      } else if (query.status === 'low_stock') {
        list = list.filter(b => b.availableCopies > 0 && b.availableCopies <= 2);
      }
    }
    if (query?.search && query.search.trim()) {
      const q = query.search.toLowerCase().trim();
      list = list.filter(
        b =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q) ||
          b.shelfLocation.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getBookById(id: string): Book | undefined {
    return this.data.books.find(b => b.id === id);
  }

  public createBook(bookInput: Omit<Book, 'id' | 'addedAt'>): Book {
    // Validation
    if (!bookInput.title?.trim()) {
      throw new Error('Book title is required');
    }
    if (!bookInput.author?.trim()) {
      throw new Error('Author is required');
    }
    if (!bookInput.isbn?.trim()) {
      throw new Error('ISBN is required');
    }
    // Simple ISBN format check (10 or 13 digits with optional hyphens)
    const cleanIsbn = bookInput.isbn.replace(/[-\s]/g, '');
    if (!/^(97[89])?\d{9}[\dX]$/i.test(cleanIsbn)) {
      throw new Error('Invalid ISBN format. Must be a valid ISBN-10 or ISBN-13 identifier.');
    }

    // Check duplicate ISBN
    if (this.data.books.some(b => b.isbn.replace(/[-\s]/g, '') === cleanIsbn)) {
      throw new Error(`A book with ISBN ${bookInput.isbn} already exists in the catalog.`);
    }

    const total = Number(bookInput.totalCopies);
    const avail = Number(bookInput.availableCopies ?? total);

    if (isNaN(total) || total < 1) {
      throw new Error('Total copies must be at least 1.');
    }
    if (isNaN(avail) || avail < 0 || avail > total) {
      throw new Error('Available copies cannot exceed total copies or be negative.');
    }

    const newBook: Book = {
      ...bookInput,
      id: `book-${Date.now()}`,
      totalCopies: total,
      availableCopies: avail,
      shelfLocation: bookInput.shelfLocation?.trim() || 'General Stack A',
      coverGradient: bookInput.coverGradient || 'from-indigo-800 to-slate-900',
      synopsis: bookInput.synopsis?.trim() || 'No synopsis provided.',
      rating: bookInput.rating || 4.5,
      addedAt: new Date().toISOString().split('T')[0],
    };

    this.data.books.unshift(newBook);
    this.logActivity('BOOK_ADDED', `Cataloged "${newBook.title}" by ${newBook.author} (ISBN: ${newBook.isbn})`, newBook.id);
    this.saveData();
    return newBook;
  }

  public updateBook(id: string, updates: Partial<Book>): Book {
    const bookIndex = this.data.books.findIndex(b => b.id === id);
    if (bookIndex === -1) {
      throw new Error(`Book with id ${id} not found.`);
    }

    const current = this.data.books[bookIndex];

    if (updates.isbn && updates.isbn !== current.isbn) {
      const cleanIsbn = updates.isbn.replace(/[-\s]/g, '');
      if (!/^(97[89])?\d{9}[\dX]$/i.test(cleanIsbn)) {
        throw new Error('Invalid ISBN format.');
      }
      if (this.data.books.some(b => b.id !== id && b.isbn.replace(/[-\s]/g, '') === cleanIsbn)) {
        throw new Error(`Another book with ISBN ${updates.isbn} already exists.`);
      }
    }

    const total = updates.totalCopies !== undefined ? Number(updates.totalCopies) : current.totalCopies;
    const avail = updates.availableCopies !== undefined ? Number(updates.availableCopies) : current.availableCopies;

    if (total < 1) {
      throw new Error('Total copies must be at least 1.');
    }
    if (avail > total) {
      throw new Error('Available copies cannot exceed total copies.');
    }

    // Ensure we don't reduce total copies below active loans
    const activeLoansForBook = this.data.loans.filter(l => l.bookId === id && l.status !== 'returned').length;
    if (total < activeLoansForBook) {
      throw new Error(`Cannot set total copies to ${total}. There are ${activeLoansForBook} copies currently checked out.`);
    }

    const updated: Book = {
      ...current,
      ...updates,
      id: current.id,
      totalCopies: total,
      availableCopies: avail,
    };

    this.data.books[bookIndex] = updated;
    this.logActivity('BOOK_UPDATED', `Updated catalog record for "${updated.title}"`, updated.id);
    this.saveData();
    return updated;
  }

  public deleteBook(id: string): void {
    const book = this.getBookById(id);
    if (!book) {
      throw new Error(`Book with id ${id} not found.`);
    }

    // Cascade guard: Check active loans
    const hasActiveLoan = this.data.loans.some(l => l.bookId === id && l.status !== 'returned');
    if (hasActiveLoan) {
      throw new Error(`Cannot delete "${book.title}". There are copies currently checked out to library patrons.`);
    }

    this.data.books = this.data.books.filter(b => b.id !== id);
    this.logActivity('BOOK_DELETED', `Removed "${book.title}" from library inventory`, id);
    this.saveData();
  }

  // --- MEMBERS CRUD ---
  public getMembers(query?: { search?: string; role?: string; status?: string }): Member[] {
    this.recalculateOverdueFines();
    let list = [...this.data.members];
    if (query?.role && query.role !== 'all') {
      list = list.filter(m => m.role.toLowerCase() === query.role!.toLowerCase());
    }
    if (query?.status && query.status !== 'all') {
      list = list.filter(m => m.status === query.status);
    }
    if (query?.search && query.search.trim()) {
      const q = query.search.toLowerCase().trim();
      list = list.filter(
        m =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.department?.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getMemberById(id: string): (Member & { loans: BorrowRecord[] }) | undefined {
    const member = this.data.members.find(m => m.id === id);
    if (!member) return undefined;
    const memberLoans = this.data.loans.filter(l => l.memberId === id);
    return {
      ...member,
      loans: memberLoans,
    };
  }

  public createMember(memberInput: Omit<Member, 'id' | 'membershipDate' | 'currentBorrowedCount'>): Member {
    if (!memberInput.name?.trim()) {
      throw new Error('Member name is required.');
    }
    if (!memberInput.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberInput.email.trim())) {
      throw new Error('Valid email address is required.');
    }

    const emailNorm = memberInput.email.toLowerCase().trim();
    if (this.data.members.some(m => m.email.toLowerCase() === emailNorm)) {
      throw new Error(`Member with email ${memberInput.email} already registered.`);
    }

    const limitMap = {
      student: 4,
      faculty: 8,
      researcher: 6,
      general: 3,
    };

    const newMember: Member = {
      ...memberInput,
      id: `mem-${Date.now()}`,
      email: emailNorm,
      membershipDate: new Date().toISOString().split('T')[0],
      currentBorrowedCount: 0,
      maxBorrowLimit: memberInput.maxBorrowLimit || limitMap[memberInput.role] || 4,
      status: memberInput.status || 'active',
    };

    this.data.members.unshift(newMember);
    this.logActivity('MEMBER_REGISTERED', `Enrolled new patron: ${newMember.name} (${newMember.role})`, newMember.id);
    this.saveData();
    return newMember;
  }

  public updateMember(id: string, updates: Partial<Member>): Member {
    const idx = this.data.members.findIndex(m => m.id === id);
    if (idx === -1) {
      throw new Error(`Member with id ${id} not found.`);
    }

    const current = this.data.members[idx];
    if (updates.email && updates.email !== current.email) {
      const emailNorm = updates.email.toLowerCase().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
        throw new Error('Valid email address is required.');
      }
      if (this.data.members.some(m => m.id !== id && m.email.toLowerCase() === emailNorm)) {
        throw new Error(`Another member with email ${updates.email} already exists.`);
      }
    }

    const updated: Member = {
      ...current,
      ...updates,
      id: current.id,
    };

    this.data.members[idx] = updated;
    this.logActivity('MEMBER_UPDATED', `Updated patron details for ${updated.name}`, updated.id);
    this.saveData();
    return updated;
  }

  public deleteMember(id: string): void {
    const member = this.data.members.find(m => m.id === id);
    if (!member) {
      throw new Error(`Member with id ${id} not found.`);
    }

    const activeLoans = this.data.loans.filter(l => l.memberId === id && l.status !== 'returned');
    if (activeLoans.length > 0) {
      throw new Error(`Cannot delete patron ${member.name}. They have ${activeLoans.length} active borrowed book(s).`);
    }

    this.data.members = this.data.members.filter(m => m.id !== id);
    this.logActivity('MEMBER_DELETED', `Removed member ${member.name} (${member.email})`, id);
    this.saveData();
  }

  // --- LOANS & CIRCULATION ---
  public getLoans(query?: { status?: string; memberId?: string; bookId?: string }): BorrowRecord[] {
    this.recalculateOverdueFines();
    let list = [...this.data.loans];
    if (query?.status && query.status !== 'all') {
      list = list.filter(l => l.status === query.status);
    }
    if (query?.memberId) {
      list = list.filter(l => l.memberId === query.memberId);
    }
    if (query?.bookId) {
      list = list.filter(l => l.bookId === query.bookId);
    }
    return list;
  }

  public issueBook(params: { bookId: string; memberId: string; loanDays?: number; notes?: string }): BorrowRecord {
    this.recalculateOverdueFines();
    const { bookId, memberId, loanDays = 14, notes = '' } = params;

    const book = this.getBookById(bookId);
    if (!book) {
      throw new Error('Book not found.');
    }
    if (book.availableCopies <= 0) {
      throw new Error(`No available copies of "${book.title}" in stock.`);
    }

    const member = this.data.members.find(m => m.id === memberId);
    if (!member) {
      throw new Error('Member not found.');
    }
    if (member.status !== 'active') {
      throw new Error(`Cannot issue book: Patron account is currently ${member.status}.`);
    }

    // Check borrow limit
    if (member.currentBorrowedCount >= member.maxBorrowLimit) {
      throw new Error(
        `Borrowing limit exceeded: ${member.name} has reached the maximum allowed of ${member.maxBorrowLimit} books.`
      );
    }

    // Check overdue loans or unpaid fines
    const overdueLoans = this.data.loans.filter(
      l => l.memberId === memberId && (l.status === 'overdue' || (l.fineAmount > 0 && !l.finePaid))
    );
    if (overdueLoans.length > 0) {
      throw new Error(
        `Borrowing restriction: ${member.name} has overdue book(s) or outstanding fines. Please resolve before issuing.`
      );
    }

    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + Number(loanDays));

    const newLoan: BorrowRecord = {
      id: `loan-${Date.now()}`,
      bookId: book.id,
      memberId: member.id,
      bookTitle: book.title,
      bookIsbn: book.isbn,
      memberName: member.name,
      memberEmail: member.email,
      borrowDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      returnDate: null,
      status: 'borrowed',
      fineAmount: 0.0,
      finePaid: false,
      notes,
      renewedCount: 0,
    };

    // Decrement inventory & increment member count
    book.availableCopies -= 1;
    member.currentBorrowedCount += 1;
    this.data.loans.unshift(newLoan);

    this.logActivity(
      'BOOK_BORROWED',
      `Issued "${book.title}" to ${member.name} (Due: ${newLoan.dueDate})`,
      newLoan.id
    );
    this.saveData();
    return newLoan;
  }

  public returnBook(loanId: string, options?: { finePaid?: boolean }): BorrowRecord {
    this.recalculateOverdueFines();
    const loan = this.data.loans.find(l => l.id === loanId);
    if (!loan) {
      throw new Error(`Loan record with ID ${loanId} not found.`);
    }
    if (loan.status === 'returned') {
      throw new Error('This loan has already been marked as returned.');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    loan.returnDate = todayStr;
    loan.status = 'returned';

    if (options?.finePaid !== undefined) {
      loan.finePaid = options.finePaid;
    } else if (loan.fineAmount === 0) {
      loan.finePaid = true;
    }

    // Restock book
    const book = this.getBookById(loan.bookId);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
    }

    // Decrement member borrowed count
    const member = this.data.members.find(m => m.id === loan.memberId);
    if (member) {
      member.currentBorrowedCount = Math.max(0, member.currentBorrowedCount - 1);
    }

    this.logActivity(
      'BOOK_RETURNED',
      `Returned "${loan.bookTitle}" from ${loan.memberName}${loan.fineAmount > 0 ? ` (Fine: $${loan.fineAmount.toFixed(2)})` : ''}`,
      loan.id
    );
    this.saveData();
    return loan;
  }

  public renewLoan(loanId: string, additionalDays: number = 14): BorrowRecord {
    this.recalculateOverdueFines();
    const loan = this.data.loans.find(l => l.id === loanId);
    if (!loan) {
      throw new Error(`Loan record with ID ${loanId} not found.`);
    }
    if (loan.status === 'returned') {
      throw new Error('Cannot renew a returned book.');
    }
    if (loan.status === 'overdue') {
      throw new Error('Cannot renew an overdue book. Please return the book and settle overdue fines.');
    }
    if (loan.renewedCount >= 2) {
      throw new Error('Maximum renewal limit reached (2 renewals per loan term).');
    }

    const currentDue = new Date(loan.dueDate);
    currentDue.setDate(currentDue.getDate() + additionalDays);
    loan.dueDate = currentDue.toISOString().split('T')[0];
    loan.renewedCount += 1;

    this.logActivity('BOOK_RENEWED', `Renewed loan for "${loan.bookTitle}" by ${additionalDays} days (New Due: ${loan.dueDate})`, loan.id);
    this.saveData();
    return loan;
  }

  public payFine(loanId: string): BorrowRecord {
    const loan = this.data.loans.find(l => l.id === loanId);
    if (!loan) {
      throw new Error(`Loan record with ID ${loanId} not found.`);
    }
    if (loan.fineAmount <= 0) {
      throw new Error('No fine balance on this record.');
    }

    loan.finePaid = true;
    this.logActivity('FINE_PAID', `Received late fine payment of $${loan.fineAmount.toFixed(2)} from ${loan.memberName}`, loan.id);
    this.saveData();
    return loan;
  }

  public getActivity(): ActivityLog[] {
    return this.data.activity;
  }

  public resetDatabase(): void {
    const fresh = getInitialSeedData();
    this.data = fresh;
    this.recalculateOverdueFines();
    this.logActivity('DB_RESET', 'Database reset to standardized virtual internship seed records', 'system');
    this.saveData();
  }

  public exportDatabase(): DatabaseSchema {
    this.recalculateOverdueFines();
    return this.data;
  }

  public importDatabase(schema: DatabaseSchema): void {
    if (!Array.isArray(schema.books) || !Array.isArray(schema.members) || !Array.isArray(schema.loans)) {
      throw new Error('Invalid database schema structure for import.');
    }
    this.data = schema;
    this.recalculateOverdueFines();
    this.logActivity('DB_RESET', 'Imported external library database state', 'admin');
    this.saveData();
  }
}

export const db = new LibraryDatabase();
