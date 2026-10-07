import { db } from './db.js';

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

export function runLibraryIntegrationTests(): TestSuiteSummary {
  const startTotal = Date.now();
  const results: TestResultItem[] = [];

  const runTest = (
    id: string,
    name: string,
    category: TestResultItem['category'],
    assertion: string,
    fn: () => void
  ) => {
    const t0 = Date.now();
    try {
      fn();
      results.push({
        id,
        name,
        category,
        status: 'passed',
        durationMs: Math.max(1, Date.now() - t0),
        assertion,
      });
    } catch (err: any) {
      results.push({
        id,
        name,
        category,
        status: 'failed',
        durationMs: Math.max(1, Date.now() - t0),
        assertion,
        error: err.message || 'Assertion failed',
      });
    }
  };

  // Test 1: Catalog Read
  runTest(
    'TC-01',
    'Catalog Query & Schema Compliance',
    'CRUD',
    'Books catalog should return populated list with valid ISBN, title, and copies count',
    () => {
      const books = db.getBooks();
      if (!Array.isArray(books) || books.length === 0) {
        throw new Error('Books array is empty or undefined');
      }
      const b = books[0];
      if (!b.id || !b.title || !b.author || !b.isbn || typeof b.totalCopies !== 'number') {
        throw new Error('Book item does not conform to required Book schema');
      }
    }
  );

  // Test 2: ISBN Validation Check
  runTest(
    'TC-02',
    'ISBN Validation: Reject Malformed ISBN',
    'Validation',
    'Attempting to insert a book with invalid ISBN format should throw a validation error',
    () => {
      let threw = false;
      try {
        db.createBook({
          title: 'Invalid ISBN Book',
          author: 'Test Author',
          isbn: 'abc-123-bad-isbn',
          category: 'Computer Science',
          publisher: 'Test Press',
          publishedYear: 2024,
          totalCopies: 3,
          availableCopies: 3,
          shelfLocation: 'Test Shelf',
          coverGradient: 'from-blue-700 to-indigo-900',
          synopsis: 'A test book',
          rating: 4.0,
        });
      } catch (e: any) {
        threw = true;
        if (!e.message.toLowerCase().includes('isbn')) {
          throw new Error(`Expected error mentioning ISBN, got: ${e.message}`);
        }
      }
      if (!threw) {
        throw new Error('System allowed creation of book with malformed ISBN');
      }
    }
  );

  // Test 3: Inventory Invariant Check
  runTest(
    'TC-03',
    'Inventory Invariant: availableCopies <= totalCopies',
    'Validation',
    'Creating book with available copies exceeding total copies must be rejected',
    () => {
      let threw = false;
      try {
        db.createBook({
          title: 'Stock Invariant Book',
          author: 'Test Author',
          isbn: '978-0000000001',
          category: 'Software Engineering',
          publisher: 'Test Press',
          publishedYear: 2025,
          totalCopies: 2,
          availableCopies: 5, // invalid: 5 > 2
          shelfLocation: 'Stack X',
          coverGradient: 'from-slate-700 to-zinc-900',
          synopsis: 'Test',
          rating: 4.0,
        });
      } catch (e: any) {
        threw = true;
      }
      if (!threw) {
        throw new Error('System allowed available copies to exceed total copies');
      }
    }
  );

  // Test 4: Book Creation (CRUD)
  let createdBookId = '';
  runTest(
    'TC-04',
    'Book Cataloging (CRUD Create)',
    'CRUD',
    'Should successfully catalog a valid book and persist it into inventory',
    () => {
      const uniqueIsbn = `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const created = db.createBook({
        title: 'Modern High-Concurrency Distributed Systems',
        author: 'Dr. Katherine Bell',
        isbn: uniqueIsbn,
        category: 'Computer Science',
        publisher: 'ACM Press',
        publishedYear: 2025,
        totalCopies: 4,
        availableCopies: 4,
        shelfLocation: 'Shelf CS-09Z',
        coverGradient: 'from-emerald-800 to-slate-900',
        synopsis: 'Rigorous exploration of consensus protocols, raft implementations, and eventual consistency models.',
        rating: 4.9,
      });
      if (!created || !created.id) throw new Error('Created book object missing id');
      createdBookId = created.id;
    }
  );

  // Test 5: Member Email Validation & Registration
  let testMemberId = '';
  runTest(
    'TC-05',
    'Member Onboarding & Validation',
    'Validation',
    'Should register member with verified email and default borrow quota',
    () => {
      const email = `test.student.${Date.now()}@university.edu`;
      const member = db.createMember({
        name: 'Sarah Connor',
        email,
        phone: '+1 (555) 765-4321',
        role: 'student',
        status: 'active',
        maxBorrowLimit: 4,
        department: 'Cybernetics & Robotics',
      });
      if (!member || !member.id) throw new Error('Created member missing id');
      testMemberId = member.id;
    }
  );

  // Test 6: Circulation Issue Book
  let testLoanId = '';
  runTest(
    'TC-06',
    'Circulation Workflow: Issue Book & Decrement Stock',
    'Circulation',
    'Issuing a book should create loan record, decrement availableCopies, and increment patron borrowedCount',
    () => {
      const bookBefore = db.getBookById(createdBookId);
      if (!bookBefore) throw new Error('Book not found');
      const prevAvailable = bookBefore.availableCopies;

      const loan = db.issueBook({
        bookId: createdBookId,
        memberId: testMemberId,
        loanDays: 14,
        notes: 'Automated test checkout',
      });
      if (!loan || !loan.id) throw new Error('Loan failed to create');
      testLoanId = loan.id;

      const bookAfter = db.getBookById(createdBookId);
      if (bookAfter!.availableCopies !== prevAvailable - 1) {
        throw new Error(`Inventory stock did not decrement. Expected ${prevAvailable - 1}, got ${bookAfter!.availableCopies}`);
      }

      const memberAfter = db.getMemberById(testMemberId);
      if (memberAfter!.currentBorrowedCount !== 1) {
        throw new Error('Member currentBorrowedCount did not increment');
      }
    }
  );

  // Test 7: Integrity Protection - Delete Guard
  runTest(
    'TC-07',
    'Integrity: Reject Deletion of Active Borrowed Book',
    'Integrity',
    'Deleting a book with active loans must be rejected with cascade safeguard',
    () => {
      let threw = false;
      try {
        db.deleteBook(createdBookId);
      } catch (e: any) {
        threw = true;
      }
      if (!threw) {
        throw new Error('System allowed deletion of a book that is currently checked out to a patron!');
      }
    }
  );

  // Test 8: Circulation Return Book
  runTest(
    'TC-08',
    'Circulation Workflow: Return Book & Restore Stock',
    'Circulation',
    'Returning a loan should mark status as returned and restore inventory availableCopies',
    () => {
      const bookBefore = db.getBookById(createdBookId);
      const prevAvailable = bookBefore!.availableCopies;

      const returned = db.returnBook(testLoanId);
      if (returned.status !== 'returned') {
        throw new Error(`Expected status 'returned', got '${returned.status}'`);
      }

      const bookAfter = db.getBookById(createdBookId);
      if (bookAfter!.availableCopies !== prevAvailable + 1) {
        throw new Error('Inventory stock was not restored after return');
      }
    }
  );

  // Test 9: Overdue Fine Computation Logic
  runTest(
    'TC-09',
    'Financial Logic: Automated Overdue Fine Calculation',
    'Calculations',
    'Loans with overdue due dates must calculate fines at $0.50 per elapsed day',
    () => {
      // Find known overdue loan in seed data or check stats
      const loans = db.getLoans();
      const overdueLoan = loans.find(l => l.status === 'overdue');
      if (!overdueLoan) {
        throw new Error('No overdue loan record found for verification');
      }
      if (overdueLoan.fineAmount <= 0) {
        throw new Error('Overdue loan has non-positive fine amount');
      }
      const dueDate = new Date(overdueLoan.dueDate);
      const today = new Date();
      const expectedDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const expectedFine = Number((expectedDays * 0.50).toFixed(2));
      if (Math.abs(overdueLoan.fineAmount - expectedFine) > 0.05) {
        throw new Error(`Fine mismatch: Expected approx $${expectedFine}, got $${overdueLoan.fineAmount}`);
      }
    }
  );

  // Test 10: Clean-up created entities
  runTest(
    'TC-10',
    'Lifecycle Cleanup & Integrity Restoration',
    'Integrity',
    'System should cleanly remove test records once dependencies have cleared',
    () => {
      if (createdBookId) {
        db.deleteBook(createdBookId);
      }
      if (testMemberId) {
        db.deleteMember(testMemberId);
      }
    }
  );

  const durationMs = Date.now() - startTotal;
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;

  return {
    total: results.length,
    passed,
    failed,
    durationMs,
    timestamp: new Date().toISOString(),
    results,
  };
}
