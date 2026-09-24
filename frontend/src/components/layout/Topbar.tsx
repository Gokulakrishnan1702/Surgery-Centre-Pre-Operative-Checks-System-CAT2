import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Calendar,
  UserCheck,
  ChevronDown,
  LogOut,
  Shield,
  Activity,
  CheckCircle2,
  AlertCircle,
  User,
  Building,
  ClipboardCheck,
  X,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Patient, Surgery } from '../../types';
import { NotificationCenter } from './NotificationCenter';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    patients: Patient[];
    surgeries: Surgery[];
  }>({ patients: [], surgeries: [] });
  const [searchOpen, setSearchOpen] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener for search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search API execution with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults({ patients: [], surgeries: [] });
      setLoadingSearch(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const [ptsRes, srgRes] = await Promise.all([
          api.patients.list({ search: searchQuery.trim(), limit: 5 }),
          api.surgeries.list({ search: searchQuery.trim() })
        ]);
        setSearchResults({
          patients: ptsRes.patients || [],
          surgeries: (srgRes.surgeries || []).slice(0, 4)
        });
        setSearchOpen(true);
      } catch (err) {
        console.error('Search query failed', err);
      } finally {
        setLoadingSearch(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectPatient = (id: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/patients/${id}`);
  };

  const handleSelectSurgery = (patientId: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/patients/${patientId}`);
  };

  const hasResults = searchResults.patients.length > 0 || searchResults.surgeries.length > 0;

  return (
    <header className="h-18 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {title || 'Surgical Pre-Op Dashboard'}
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE DEMO
          </span>
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          {subtitle || 'Evidence-backed verification, role confirmations & immutable audit tracking'}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Date Display */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/60">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDate}</span>
        </div>

        {/* Global Search Bar with Live Results Dropdown */}
        <div className="relative hidden md:block w-72" ref={searchContainerRef}>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search patient, step, MRN... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => {
              if (searchQuery.trim().length >= 2) setSearchOpen(true);
            }}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {searchOpen && searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 text-slate-800 animate-in fade-in">
              <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Quick Search Results</span>
                {loadingSearch && <span className="text-blue-600">Searching...</span>}
              </div>

              {!loadingSearch && !hasResults ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No matching patients or procedures found.
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {/* Patients Section */}
                  {searchResults.patients.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                        Patients
                      </div>
                      {searchResults.patients.map((pt) => (
                        <button
                          key={pt.id}
                          onClick={() => handleSelectPatient(pt.id)}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[11px]">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-semibold text-xs text-slate-900 group-hover:text-blue-600">
                                {pt.name}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                <span className="font-mono text-slate-500">{pt.patient_id}</span> • {pt.surgery_type}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Surgeries Section */}
                  {searchResults.surgeries.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                        Surgical Procedures
                      </div>
                      {searchResults.surgeries.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleSelectSurgery(s.patient_id)}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                              <Building className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-semibold text-xs text-slate-900 group-hover:text-purple-600">
                                {s.procedure}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {s.patient_name} • <span className="font-mono">{s.operating_room}</span>
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-600 transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick Shortcut to Checklists Roster */}
                  <div className="p-2 bg-slate-50">
                    <button
                      onClick={() => {
                        setSearchOpen(false);
                        navigate('/checklists');
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-white text-xs font-semibold text-blue-600 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>Search in All Pre-Op Checklists</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-Time Notification Center */}
        <NotificationCenter />

        <div className="h-6 w-px bg-slate-200"></div>

        {/* Active Role Badge */}
        <div className="relative">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">ACTIVE ROLE</div>
              <div className="font-bold text-slate-900">{user?.role}</div>
            </div>
          </div>
        </div>

        {/* User Avatar Pill */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {user?.name?.slice(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="hidden xl:block text-left text-xs">
            <div className="font-semibold text-slate-800 leading-tight">{user?.name}</div>
            <div className="text-[10px] text-slate-400">{user?.email}</div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
export default Topbar;
