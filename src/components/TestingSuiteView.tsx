import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  Send,
  Layers,
  ShieldCheck,
  RefreshCw,
  Code,
} from 'lucide-react';
import { TestSuiteSummary, TestResultItem } from '../types/library';
import { api } from '../services/api';

interface TestingSuiteViewProps {
  onNotify: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const TestingSuiteView: React.FC<TestingSuiteViewProps> = ({ onNotify }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(null);

  // API Explorer state
  const [explorerMethod, setExplorerMethod] = useState<'GET' | 'POST'>('GET');
  const [explorerPath, setExplorerPath] = useState('/api/books');
  const [explorerBody, setExplorerBody] = useState('{\n  "category": "Computer Science"\n}');
  const [explorerLoading, setExplorerLoading] = useState(false);
  const [explorerResponse, setExplorerResponse] = useState<any>(null);
  const [explorerStatus, setExplorerStatus] = useState<number | null>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const summary = await api.runIntegrationTests();
      setTestSummary(summary);
      if (summary.failed === 0) {
        onNotify('success', 'All Test Cases Passed!', `${summary.passed}/${summary.total} tests executed in ${summary.durationMs}ms`);
      } else {
        onNotify('error', 'Test Failures Encountered', `${summary.failed} tests failed out of ${summary.total}`);
      }
    } catch (err: any) {
      onNotify('error', 'Test execution error', err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleExecuteApiExplorer = async () => {
    setExplorerLoading(true);
    setExplorerResponse(null);
    setExplorerStatus(null);
    try {
      const options: RequestInit = {
        method: explorerMethod,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (explorerMethod === 'POST' && explorerBody.trim()) {
        try {
          JSON.parse(explorerBody); // ensure valid JSON
          options.body = explorerBody;
        } catch (e: any) {
          throw new Error(`Invalid JSON in request payload: ${e.message}`);
        }
      }

      const res = await fetch(explorerPath, options);
      setExplorerStatus(res.status);
      const data = await res.json();
      setExplorerResponse(data);
    } catch (err: any) {
      setExplorerStatus(500);
      setExplorerResponse({ error: err.message });
    } finally {
      setExplorerLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Automated Testing & API Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Validate CRUD operations, input sanitization, stock invariants, circulation workflows, and test endpoints live.
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-2xs disabled:opacity-50 self-start sm:self-auto"
        >
          <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Running Test Suite...' : 'Run Automated Integration Suite'}</span>
        </button>
      </div>

      {/* Test Suite Summary Banner */}
      {testSummary && (
        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${
                  testSummary.failed === 0 ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              >
                {testSummary.failed === 0 ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {testSummary.failed === 0
                    ? '100% Test Suite Verification Passed'
                    : `${testSummary.failed} Assertion(s) Failed`}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-mono tabular-nums">{testSummary.passed} / {testSummary.total} passed</span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">{testSummary.durationMs}ms total latency</span>
                  <span>·</span>
                  <span>{new Date(testSummary.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRunTests}
              disabled={isRunning}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Re-run Suite
            </button>
          </div>
        </div>
      )}

      {/* Tests Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Virtual Internship Test Cases Specification
            </h2>
          </div>
          <span className="text-xs text-slate-400">10 Core Contract Assertions</span>
        </div>

        <div className="divide-y divide-slate-100">
          {(testSummary ? testSummary.results : defaultTestManifest).map((test) => {
            const isExecuted = testSummary !== null;
            const isPassed = test.status === 'passed';

            return (
              <div key={test.id} className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isExecuted ? (
                        isPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                        )
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">{test.id}</span>
                        <span className="font-semibold text-xs text-slate-900">{test.name}</span>
                        <span className="text-[11px] text-slate-400">· {test.category}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {test.assertion}
                      </p>
                      {test.error && (
                        <div className="mt-2 p-2 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 font-mono">
                          {test.error}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {isExecuted ? (
                      <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                        {test.durationMs}ms
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Pending</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive REST API Explorer */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Interactive REST API Explorer
            </h2>
          </div>
          <span className="text-xs text-slate-400">Test live server endpoints</span>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium mr-1 shrink-0">Presets:</span>
          <button
            onClick={() => {
              setExplorerMethod('GET');
              setExplorerPath('/api/books');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 whitespace-nowrap"
          >
            GET /api/books
          </button>
          <button
            onClick={() => {
              setExplorerMethod('GET');
              setExplorerPath('/api/stats');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 whitespace-nowrap"
          >
            GET /api/stats
          </button>
          <button
            onClick={() => {
              setExplorerMethod('GET');
              setExplorerPath('/api/members');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 whitespace-nowrap"
          >
            GET /api/members
          </button>
          <button
            onClick={() => {
              setExplorerMethod('GET');
              setExplorerPath('/api/loans?status=overdue');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 whitespace-nowrap"
          >
            GET /api/loans (overdue)
          </button>
          <button
            onClick={() => {
              setExplorerMethod('POST');
              setExplorerPath('/api/books');
              setExplorerBody(
                JSON.stringify(
                  {
                    title: 'Practical Distributed Systems',
                    author: 'Leslie Lamport',
                    isbn: '978-0131103627',
                    category: 'Computer Science',
                    publisher: 'Addison-Wesley',
                    publishedYear: 2024,
                    totalCopies: 4,
                    availableCopies: 4,
                    shelfLocation: 'Shelf CS-01C',
                    synopsis: 'Classic principles of clock synchronization and state-machine replication.',
                  },
                  null,
                  2
                )
              );
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 whitespace-nowrap"
          >
            POST /api/books
          </button>
        </div>

        {/* Request builder */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={explorerMethod}
            onChange={(e) => setExplorerMethod(e.target.value as 'GET' | 'POST')}
            className="w-24 px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>

          <input
            type="text"
            value={explorerPath}
            onChange={(e) => setExplorerPath(e.target.value)}
            className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />

          <button
            onClick={handleExecuteApiExplorer}
            disabled={explorerLoading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Request</span>
          </button>
        </div>

        {explorerMethod === 'POST' && (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              JSON Request Body
            </label>
            <textarea
              rows={4}
              value={explorerBody}
              onChange={(e) => setExplorerBody(e.target.value)}
              className="w-full p-2.5 text-xs font-mono bg-slate-900 text-slate-100 rounded-md border border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-700"
            />
          </div>
        )}

        {/* Response Viewer */}
        {explorerResponse !== null && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Response Payload</span>
              <span
                className={`font-mono font-bold tabular-nums ${
                  explorerStatus && explorerStatus < 300 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                HTTP {explorerStatus}
              </span>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded-md text-xs font-mono overflow-x-auto max-h-72">
              {JSON.stringify(explorerResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

// Initial manifest of tests before execution
const defaultTestManifest: TestResultItem[] = [
  {
    id: 'TC-01',
    name: 'Catalog Query & Schema Compliance',
    category: 'CRUD',
    status: 'passed',
    durationMs: 0,
    assertion: 'Books catalog should return populated list with valid ISBN, title, and copies count',
  },
  {
    id: 'TC-02',
    name: 'ISBN Validation: Reject Malformed ISBN',
    category: 'Validation',
    status: 'passed',
    durationMs: 0,
    assertion: 'Attempting to insert a book with invalid ISBN format should throw a validation error',
  },
  {
    id: 'TC-03',
    name: 'Inventory Invariant: availableCopies <= totalCopies',
    category: 'Validation',
    status: 'passed',
    durationMs: 0,
    assertion: 'Creating book with available copies exceeding total copies must be rejected',
  },
  {
    id: 'TC-04',
    name: 'Book Cataloging (CRUD Create)',
    category: 'CRUD',
    status: 'passed',
    durationMs: 0,
    assertion: 'Should successfully catalog a valid book and persist it into inventory',
  },
  {
    id: 'TC-05',
    name: 'Member Onboarding & Validation',
    category: 'Validation',
    status: 'passed',
    durationMs: 0,
    assertion: 'Should register member with verified email and default borrow quota',
  },
  {
    id: 'TC-06',
    name: 'Circulation Workflow: Issue Book & Decrement Stock',
    category: 'Circulation',
    status: 'passed',
    durationMs: 0,
    assertion: 'Issuing a book should create loan record, decrement availableCopies, and increment patron borrowedCount',
  },
  {
    id: 'TC-07',
    name: 'Integrity: Reject Deletion of Active Borrowed Book',
    category: 'Integrity',
    status: 'passed',
    durationMs: 0,
    assertion: 'Deleting a book with active loans must be rejected with cascade safeguard',
  },
  {
    id: 'TC-08',
    name: 'Circulation Workflow: Return Book & Restore Stock',
    category: 'Circulation',
    status: 'passed',
    durationMs: 0,
    assertion: 'Returning a loan should mark status as returned and restore inventory availableCopies',
  },
  {
    id: 'TC-09',
    name: 'Financial Logic: Automated Overdue Fine Calculation',
    category: 'Calculations',
    status: 'passed',
    durationMs: 0,
    assertion: 'Loans with overdue due dates must calculate fines at $0.50 per elapsed day',
  },
  {
    id: 'TC-10',
    name: 'Lifecycle Cleanup & Integrity Restoration',
    category: 'Integrity',
    status: 'passed',
    durationMs: 0,
    assertion: 'System should cleanly remove test records once dependencies have cleared',
  },
];
