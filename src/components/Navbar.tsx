import React from 'react';
import { BookOpen, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'books' | 'circulation' | 'members' | 'testing' | 'submission';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenIssueModal: () => void;
  onOpenAddBookModal: () => void;
  onResetDatabase: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenIssueModal,
  onOpenAddBookModal,
  onResetDatabase,
  isResetting,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 transition-colors">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                BiblioStack LMS
              </span>
            </button>
          </div>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onSelectTab('books')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'books'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Books Catalog
            </button>
            <button
              onClick={() => onSelectTab('circulation')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'circulation'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Circulation Desk
            </button>
            <button
              onClick={() => onSelectTab('members')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'members'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Patrons Directory
            </button>
            <button
              onClick={() => onSelectTab('testing')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'testing'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Testing Suite
            </button>
            <button
              onClick={() => onSelectTab('submission')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'submission'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Project PDF & Dossier</span>
            </button>
          </nav>

          {/* Zone 3: Primary action controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onResetDatabase}
              disabled={isResetting}
              title="Reset Database to Standard Virtual Internship Seed Data"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset Data</span>
            </button>

            <button
              onClick={onOpenAddBookModal}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Book</span>
            </button>

            <button
              onClick={onOpenIssueModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue Book</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center gap-1 py-2 overflow-x-auto border-t border-slate-100 text-xs">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${
              activeTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('books')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${
              activeTab === 'books' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => onSelectTab('circulation')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${
              activeTab === 'circulation' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Circulation
          </button>
          <button
            onClick={() => onSelectTab('members')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${
              activeTab === 'members' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Patrons
          </button>
          <button
            onClick={() => onSelectTab('testing')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${
              activeTab === 'testing' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Tests
          </button>
          <button
            onClick={() => onSelectTab('submission')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium ${
              activeTab === 'submission' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Project PDF
          </button>
        </div>
      </div>
    </header>
  );
};
