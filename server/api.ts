import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { runLibraryIntegrationTests } from './testRunner.js';

export const apiRouter = Router();

// Middleware to log API requests
apiRouter.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// --- STATS ---
apiRouter.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- BOOKS ---
apiRouter.get('/books', (req: Request, res: Response) => {
  try {
    const { search, category, status } = req.query;
    const books = db.getBooks({
      search: search as string,
      category: category as string,
      status: status as string,
    });
    res.json({ success: true, count: books.length, data: books });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/books/:id', (req: Request, res: Response) => {
  try {
    const book = db.getBookById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    const loans = db.getLoans({ bookId: book.id });
    res.json({ success: true, data: { ...book, loans } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/books', (req: Request, res: Response) => {
  try {
    const newBook = db.createBook(req.body);
    res.status(201).json({ success: true, data: newBook });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.put('/books/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateBook(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.delete('/books/:id', (req: Request, res: Response) => {
  try {
    db.deleteBook(req.params.id);
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- MEMBERS ---
apiRouter.get('/members', (req: Request, res: Response) => {
  try {
    const { search, role, status } = req.query;
    const members = db.getMembers({
      search: search as string,
      role: role as string,
      status: status as string,
    });
    res.json({ success: true, count: members.length, data: members });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/members/:id', (req: Request, res: Response) => {
  try {
    const member = db.getMemberById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    res.json({ success: true, data: member });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/members', (req: Request, res: Response) => {
  try {
    const newMember = db.createMember(req.body);
    res.status(201).json({ success: true, data: newMember });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.put('/members/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateMember(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.delete('/members/:id', (req: Request, res: Response) => {
  try {
    db.deleteMember(req.params.id);
    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- CIRCULATION / LOANS ---
apiRouter.get('/loans', (req: Request, res: Response) => {
  try {
    const { status, memberId, bookId } = req.query;
    const loans = db.getLoans({
      status: status as string,
      memberId: memberId as string,
      bookId: bookId as string,
    });
    res.json({ success: true, count: loans.length, data: loans });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/loans/issue', (req: Request, res: Response) => {
  try {
    const { bookId, memberId, loanDays, notes } = req.body;
    if (!bookId || !memberId) {
      return res.status(400).json({ success: false, error: 'bookId and memberId are required' });
    }
    const loan = db.issueBook({ bookId, memberId, loanDays, notes });
    res.status(201).json({ success: true, data: loan });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.post('/loans/:id/return', (req: Request, res: Response) => {
  try {
    const { finePaid } = req.body;
    const loan = db.returnBook(req.params.id, { finePaid });
    res.json({ success: true, data: loan });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.post('/loans/:id/renew', (req: Request, res: Response) => {
  try {
    const { days } = req.body;
    const loan = db.renewLoan(req.params.id, days || 14);
    res.json({ success: true, data: loan });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.post('/loans/:id/pay-fine', (req: Request, res: Response) => {
  try {
    const loan = db.payFine(req.params.id);
    res.json({ success: true, data: loan });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- ACTIVITY AUDIT ---
apiRouter.get('/activity', (req: Request, res: Response) => {
  try {
    const logs = db.getActivity();
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- SYSTEM ADMINISTRATION ---
apiRouter.post('/system/reset', (req: Request, res: Response) => {
  try {
    db.resetDatabase();
    res.json({ success: true, message: 'Database reset to default seed dataset' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/system/export', (req: Request, res: Response) => {
  try {
    const data = db.exportDatabase();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/system/import', (req: Request, res: Response) => {
  try {
    db.importDatabase(req.body);
    res.json({ success: true, message: 'Database imported successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- AUTOMATED TEST RUNNER ---
apiRouter.post('/test-runner/run-all', (req: Request, res: Response) => {
  try {
    const report = runLibraryIntegrationTests();
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
