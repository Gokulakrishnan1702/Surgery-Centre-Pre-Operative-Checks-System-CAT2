import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  Lock, 
  Eye, 
  EyeOff, 
  Stethoscope, 
  HeartPulse, 
  Syringe, 
  ScanLine, 
  Microscope, 
  ClipboardList, 
  ShieldAlert, 
  CheckCircle2,
  Activity,
  Layers,
  FileCheck2,
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface RolePersona {
  role: UserRole;
  label: string;
  name: string;
  email: string;
  department: string;
  badgeClass: string;
  icon: React.ComponentType<{ className?: string }>;
  responsibilities: string;
}

const PERSONAS: RolePersona[] = [
  {
    role: 'SURGEON',
    label: 'Lead Surgeon',
    name: 'Dr. Marcus Vance',
    email: 'surgeon@demo.com',
    department: 'Department of General & Cardiothoracic Surgery',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Stethoscope,
    responsibilities: 'Final pre-operative clearance, high-risk surgical sign-off, emergency override approvals.'
  },
  {
    role: 'CARDIOLOGIST',
    label: 'Consultant Cardiologist',
    name: 'Dr. Kenneth Chen',
    email: 'cardiologist@demo.com',
    department: 'Cardiovascular Medicine & Echo Lab',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: HeartPulse,
    responsibilities: 'Echocardiogram and 12-lead ECG review, cardiovascular clearance attestation.'
  },
  {
    role: 'NURSE',
    label: 'Charge Nurse',
    name: 'Nurse Clara Barton',
    email: 'nurse@demo.com',
    department: 'Pre-Operative Holding Unit',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ClipboardList,
    responsibilities: 'Vitals verification, allergy & medication reconciliation, primary evidence attachment.'
  },
  {
    role: 'ANESTHETIST',
    label: 'Chief Anesthetist',
    name: 'Dr. Arthur Pendelton',
    email: 'anesthetist@demo.com',
    department: 'Anesthesiology & Perioperative Care',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Syringe,
    responsibilities: 'ASA I-VI physical classification, airway evaluation, anesthetic risk clearance.'
  },
  {
    role: 'RADIOLOGIST',
    label: 'Consultant Radiologist',
    name: 'Dr. Sanjay Patel',
    email: 'radiologist@demo.com',
    department: 'Diagnostic Imaging & PACS',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: ScanLine,
    responsibilities: 'Pre-op diagnostic imaging review (CT/MRI/X-Ray) and landmark verification.'
  },
  {
    role: 'PATHOLOGIST',
    label: 'Clinical Pathologist',
    name: 'Dr. Helena Rostova',
    email: 'pathologist@demo.com',
    department: 'Division of Clinical Pathology',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Microscope,
    responsibilities: 'Hematology (CBC), renal function, and coagulation panels (PT/INR) sign-off.'
  },
  {
    role: 'AUDITOR',
    label: 'Forensic Auditor',
    name: 'Sarah Jenkins',
    email: 'auditor@demo.com',
    department: 'Clinical Governance & Compliance',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: ShieldAlert,
    responsibilities: 'Read-only access to immutable audit trails, safety compliance metrics, and fairness reports.'
  },
  {
    role: 'ADMIN',
    label: 'Chief Medical Officer',
    name: 'Dr. Evelyn Reed',
    email: 'admin@demo.com',
    department: 'Chief Medical Office & Executive Directorate',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: ShieldCheck,
    responsibilities: 'Full system oversight, institutional configuration, user management, and global overrides.'
  }
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('surgeon@demo.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<RolePersona>(PERSONAS[0]);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSelectPersona = (p: RolePersona) => {
    setSelectedPersona(p);
    setEmail(p.email);
    setPassword('password');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide your clinical email and account password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or connection error. Please verify your password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotEmail) {
      setForgotSuccess(true);
      setTimeout(() => {
        setForgotModalOpen(false);
        setForgotSuccess(false);
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-900 text-slate-100">
      {/* LEFT SIDE: Healthcare & AI Concept Branding */}
      <div className="lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/40">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-cyan-400">SURGICAL SAFETY AI</span>
              <h1 className="text-xl font-bold text-white tracking-tight">Onco-Periop Safety System</h1>
            </div>
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold text-white leading-snug mb-4">
            Evidence-Backed Pre-Operative Verification & Clinical Governance
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            A high-assurance clinical decision-support platform designed to eliminate passive checklist ticking. 
            Requires verified source evidence, transparent explainable risk analysis, and authenticated specialist human sign-off before surgical induction.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8 relative z-10">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">WHO 3-Phase Lifecycle</h3>
            <p className="text-xs text-slate-400">Structured Sign-In, Time-Out, and Sign-Out protocols aligned with international surgical guidelines.</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">SHA-256 Evidence Hashing</h3>
            <p className="text-xs text-slate-400">Cryptographically hashed evidence artifacts ensuring tamper-proof clinical records and auditability.</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Explainable AI Risk Engine</h3>
            <p className="text-xs text-slate-400">Transparent factor attributions (Age, Cardiac, Lab, Allergies) with decision-support disclaimers.</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Strict RBAC & Overrides</h3>
            <p className="text-xs text-slate-400">No silent overrides. Server-side role gating with dual-signoff on critical safety exceptions.</p>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Dual-Mode Data Store: PostgreSQL Primary / Resilient In-Memory Active</span>
          </div>
          <span>Academic & Viva Demonstration Edition</span>
        </div>
      </div>

      {/* RIGHT SIDE: Clean Modern Clinical Login Card */}
      <div className="lg:w-1/2 bg-slate-950 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 text-slate-800 shadow-2xl border border-slate-200">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>Verified Clinician Access</span>
              </div>
              <span className="text-xs text-slate-600 font-mono">v2.4 Production</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Clinician Sign In</h2>
            <p className="text-xs text-slate-600 mt-1">Authenticate with your hospital credentials or select a Viva test persona below.</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Failed</p>
                <p className="text-[11px] text-rose-600">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Clinical Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="clinician@hospital.org"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-600">Remember credentials</span>
              </label>
              <span className="text-[11px] text-slate-600">Bcrypt Hashing Active</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md hover:shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>Sign In as {selectedPersona.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* VIVA DEMO MODE QUICK-FILL DRAWER */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Viva Quick-Persona Select
              </span>
              <span className="text-[10px] text-slate-600">1-Click Credential Fill</span>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              Click a clinical persona to auto-populate credentials for role-based access demonstration:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {PERSONAS.map((p) => {
                const isSelected = email.toLowerCase() === p.email.toLowerCase();
                const IconComponent = p.icon;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    className={`p-2 rounded-lg text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 ring-1 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 leading-tight truncate">
                      {p.label}
                    </div>
                    <div className="text-[9px] text-slate-600 truncate">{p.name.split(' ')[0]}</div>
                  </button>
                );
              })}
            </div>

            {/* Selected Persona Info Card */}
            <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-slate-800">{selectedPersona.name}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${selectedPersona.badgeClass}`}>
                  {selectedPersona.role}
                </span>
              </div>
              <p className="text-slate-500 text-[10px] leading-tight">{selectedPersona.department}</p>
              <p className="text-slate-600 text-[10px] mt-1 italic">"{selectedPersona.responsibilities}"</p>
            </div>
          </div>

          {/* Registration Redirect */}
          <div className="mt-6 text-center text-xs text-slate-500">
            <span>New medical staff member? </span>
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
              Register clinical account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-slate-800 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Credential Reset</h3>
              </div>
              <button onClick={() => setForgotModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <p className="font-semibold">Reset Token Dispatched</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">Please check your clinical inbox for reset link.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-slate-600">
                  Enter your registered hospital email address to receive password reset instructions:
                </p>
                <input
                  type="email"
                  required
                  placeholder="clinician@hospital.org"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl"
                >
                  Send Reset Token
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
