import { Book, Member, BorrowRecord, ActivityLog, SystemStats, TestSuiteSummary } from '../types/library';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Request failed with status ${res.status}`);
  }
  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Stats
  async getStats(): Promise<SystemStats> {
    return fetchJson<SystemStats>('/api/stats');
  },

  // Books
  async getBooks(params?: { search?: string; category?: string; status?: string }): Promise<Book[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return fetchJson<Book[]>(`/api/books${query}`);
  },

  async getBookById(id: string): Promise<Book & { loans: BorrowRecord[] }> {
    return fetchJson<Book & { loans: BorrowRecord[] }>(`/api/books/${id}`);
  },

  async createBook(data: Omit<Book, 'id' | 'addedAt'>): Promise<Book> {
    return fetchJson<Book>('/api/books', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateBook(id: string, data: Partial<Book>): Promise<Book> {
    return fetchJson<Book>(`/api/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteBook(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>(`/api/books/${id}`, {
      method: 'DELETE',
    });
  },

  // Members
  async getMembers(params?: { search?: string; role?: string; status?: string }): Promise<Member[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return fetchJson<Member[]>(`/api/members${query}`);
  },

  async getMemberById(id: string): Promise<Member & { loans: BorrowRecord[] }> {
    return fetchJson<Member & { loans: BorrowRecord[] }>(`/api/members/${id}`);
  },

  async createMember(data: Omit<Member, 'id' | 'membershipDate' | 'currentBorrowedCount'>): Promise<Member> {
    return fetchJson<Member>('/api/members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateMember(id: string, data: Partial<Member>): Promise<Member> {
    return fetchJson<Member>(`/api/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteMember(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>(`/api/members/${id}`, {
      method: 'DELETE',
    });
  },

  // Loans / Circulation
  async getLoans(params?: { status?: string; memberId?: string; bookId?: string }): Promise<BorrowRecord[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.memberId) searchParams.set('memberId', params.memberId);
    if (params?.bookId) searchParams.set('bookId', params.bookId);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return fetchJson<BorrowRecord[]>(`/api/loans${query}`);
  },

  async issueBook(params: { bookId: string; memberId: string; loanDays?: number; notes?: string }): Promise<BorrowRecord> {
    return fetchJson<BorrowRecord>('/api/loans/issue', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async returnBook(id: string, options?: { finePaid?: boolean }): Promise<BorrowRecord> {
    return fetchJson<BorrowRecord>(`/api/loans/${id}/return`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  },

  async renewLoan(id: string, days?: number): Promise<BorrowRecord> {
    return fetchJson<BorrowRecord>(`/api/loans/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify({ days: days || 14 }),
    });
  },

  async payFine(id: string): Promise<BorrowRecord> {
    return fetchJson<BorrowRecord>(`/api/loans/${id}/pay-fine`, {
      method: 'POST',
    });
  },

  // Activity
  async getActivity(): Promise<ActivityLog[]> {
    return fetchJson<ActivityLog[]>('/api/activity');
  },

  // System
  async resetDatabase(): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>('/api/system/reset', {
      method: 'POST',
    });
  },

  async exportDatabase(): Promise<any> {
    return fetchJson<any>('/api/system/export');
  },

  // Test Runner
  async runIntegrationTests(): Promise<TestSuiteSummary> {
    return fetchJson<TestSuiteSummary>('/api/test-runner/run-all', {
      method: 'POST',
    });
  },
};
