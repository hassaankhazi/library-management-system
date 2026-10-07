import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
  BookOpen,
} from 'lucide-react';
import { Member } from '../types/library';

interface MembersViewProps {
  members: Member[];
  onOpenAddModal: () => void;
  onOpenEditModal: (member: Member) => void;
  onOpenDetailsModal: (member: Member) => void;
  onDeleteMember: (memberId: string, name: string) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDetailsModal,
  onDeleteMember,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredMembers = members.filter((member) => {
    if (roleFilter !== 'all' && member.role !== roleFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchName = member.name.toLowerCase().includes(q);
      const matchEmail = member.email.toLowerCase().includes(q);
      const matchDept = member.department?.toLowerCase().includes(q);
      return matchName || matchEmail || matchDept;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Patrons & Membership Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage library users, students, researchers, faculty accounts, borrow quotas, and status validation.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Patron</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Role Filters */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md text-xs">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                roleFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Patrons
            </button>
            <button
              onClick={() => setRoleFilter('student')}
              className={`px-3 py-1.5 rounded font-medium transition-colors capitalize ${
                roleFilter === 'student' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setRoleFilter('faculty')}
              className={`px-3 py-1.5 rounded font-medium transition-colors capitalize ${
                roleFilter === 'faculty' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Faculty
            </button>
            <button
              onClick={() => setRoleFilter('researcher')}
              className={`px-3 py-1.5 rounded font-medium transition-colors capitalize ${
                roleFilter === 'researcher' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Researchers
            </button>
            <button
              onClick={() => setRoleFilter('general')}
              className={`px-3 py-1.5 rounded font-medium transition-colors capitalize ${
                roleFilter === 'general' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              General
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search patron by name, email, dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Patrons Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-2.5 px-4">Patron Name & Contact</th>
              <th className="py-2.5 px-3">Role & Department</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Active Borrowing Quota</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400 text-xs">
                  No patrons found.
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => {
                const isLimitReached = member.currentBorrowedCount >= member.maxBorrowLimit;

                return (
                  <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Name & Contact */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{member.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{member.email}</span>
                        <span>·</span>
                        <span className="font-mono">{member.phone}</span>
                      </div>
                    </td>

                    {/* Role & Department */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800 capitalize">{member.role}</div>
                      <div className="text-[11px] text-slate-500">{member.department || 'General Library'}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {member.status === 'active' && (
                        <span className="text-emerald-700 font-medium">Active Member</span>
                      )}
                      {member.status === 'suspended' && (
                        <span className="text-rose-700 font-medium">Suspended</span>
                      )}
                      {member.status === 'expired' && (
                        <span className="text-amber-700 font-medium">Card Expired</span>
                      )}
                    </td>

                    {/* Quota */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      <span className={isLimitReached ? 'text-amber-700 font-bold' : 'text-slate-800 font-semibold'}>
                        {member.currentBorrowedCount}
                      </span>
                      <span className="text-slate-400"> / {member.maxBorrowLimit} books</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => onOpenDetailsModal(member)}
                        className="p-1 text-slate-500 hover:text-slate-900 rounded"
                        title="View Profile & Borrow History"
                      >
                        <Eye className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        onClick={() => onOpenEditModal(member)}
                        className="p-1 text-slate-500 hover:text-slate-900 rounded"
                        title="Edit Patron"
                      >
                        <Edit2 className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        onClick={() => onDeleteMember(member.id, member.name)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete Patron"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
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
