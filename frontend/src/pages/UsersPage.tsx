import React, { useState, useEffect } from 'react';
import { UserCog, Shield, CheckCircle2, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('SURGEON');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.users.list();
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string) => {
    try {
      await api.users.updateRole(userId, newRole);
      setEditingUserId(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clinician Roles & Access Control</h2>
          <p className="text-xs text-slate-500 font-medium">
            Role-Based Access Control (RBAC) governance and verification rights matrix
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>Strict Server-Side RBAC Enforced</span>
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Clinician Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-3">Active Role</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-5">Assigned Gating Permissions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4">
                      <div className="h-4 bg-slate-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : (
                users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  const isEditing = editingUserId === u.id;

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCurrent ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{u.name}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {u.email}
                      </td>

                      <td className="py-3.5 px-3">
                        {isEditing ? (
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value as any)}
                            className="p-1 border border-slate-300 rounded text-xs"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="SURGEON">SURGEON</option>
                            <option value="NURSE">NURSE</option>
                            <option value="CARDIOLOGIST">CARDIOLOGIST</option>
                            <option value="ANESTHETIST">ANESTHETIST</option>
                            <option value="RADIOLOGIST">RADIOLOGIST</option>
                            <option value="PATHOLOGIST">PATHOLOGIST</option>
                            <option value="AUDITOR">AUDITOR</option>
                          </select>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-800 border border-slate-200">
                            {u.role}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ACTIVE</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {u.last_login || '2025-04-28 08:30'}
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="flex flex-wrap gap-1 max-w-[320px]">
                          {(u.permissions || []).map((perm, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleUpdateRole(u.id)}
                                className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingUserId(null)}
                                className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[11px]"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingUserId(u.id);
                                  setNewRole(u.role);
                                }}
                                className="px-2 py-1 text-slate-600 hover:text-blue-600 rounded text-xs font-semibold"
                              >
                                Edit Role
                              </button>

                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
