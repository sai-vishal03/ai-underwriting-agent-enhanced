'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Github, 
  Chrome, 
  Linkedin,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [tab, setTab] = useState<'admin' | 'user'>('user');
  const [userType, setUserType] = useState<'existing' | 'new'>('existing');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const passwordRules = [
    { label: 'Min 8 characters', met: password.length >= 8 },
    { label: '1 Uppercase', met: /[A-Z]/.test(password) },
    { label: '1 Lowercase', met: /[a-z]/.test(password) },
    { label: '1 Number', met: /[0-9]/.test(password) },
    { label: '1 Special Character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(email, password);
    if (success) {
      toast.success(`Welcome back, ${email.split('@')[0]}!`);
      router.push('/');
    } else {
      setError('Invalid credentials or password rules not met.');
      toast.error('Authentication Failed');
      setLoading(false);
    }
  };

  const setAdminDemo = () => {
    setEmail('admin@grabon.in');
    setPassword('admin123');
    setTab('admin');
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center bg-[#0d0d0d] p-6 relative overflow-y-auto font-sans py-12 pb-24">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#00ff84]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
      <div className="absolute top-[30%] left-[60%] w-[100px] h-[100px] bg-[#00ff84]/10 blur-[80px] rounded-full animate-pulse" />

      <div className="w-full max-w-xl relative z-10 flex flex-col items-center">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-[20px] flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.8)] mb-6 group transition-all hover:border-[#00ff84]/50 hover:scale-105 duration-500">
            <img 
              src="https://images.yourstory.com/cs/images/brandSpotlight/WhatsAppImage2023-09-20at11-1695236582304.jpeg" 
              alt="Logo" 
              className="w-8 h-8 rounded-lg object-cover grayscale brightness-125 group-hover:grayscale-0 transition-all duration-700"
            />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-2 italic drop-shadow-[0_0_20px_rgba(0,255,132,0.3)] text-center">GRABON <span className="text-[#00ff84]">CORE</span></h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] italic opacity-80">Institutional Underwriting AI</p>
        </div>


        <div className="bg-[#121212] border border-zinc-800 rounded-[32px] p-8 shadow-2xl shadow-black relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00ff84] via-emerald-500 to-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex gap-1 p-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl mb-8">
            <button 
              onClick={() => setTab('user')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                tab === 'user' ? "bg-zinc-800 text-white shadow-lg shadow-black/50" : "text-zinc-600 hover:text-zinc-400"
              )}
            >
              <UserCheck className="w-4 h-4" />
              User Access
            </button>
            <button 
              onClick={() => setTab('admin')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                tab === 'admin' ? "bg-zinc-800 text-white shadow-lg shadow-black/50" : "text-zinc-600 hover:text-zinc-400"
              )}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Portal
            </button>
          </div>

            {tab === 'user' && (
              <div className="flex gap-3 p-2 bg-zinc-900 border border-zinc-800 rounded-[24px] mb-10">
                <button 
                  onClick={() => setUserType('existing')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-4 rounded-[18px] text-[11px] font-black uppercase tracking-[0.2em] transition-all",
                    userType === 'existing' ? "bg-[#00ff84] text-black shadow-[0_0_30px_rgba(0,255,132,0.3)]" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  Existing User
                </button>
                <button 
                  onClick={() => setUserType('new')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-4 rounded-[18px] text-[11px] font-black uppercase tracking-[0.2em] transition-all",
                    userType === 'new' ? "bg-[#00ff84] text-black shadow-[0_0_30px_rgba(0,255,132,0.3)]" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  New User
                </button>
              </div>
            )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] ml-1">Identity Endpoint</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-zinc-600 group-focus-within:text-[#00ff84] transition-colors" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00ff84]/50 focus:ring-4 focus:ring-[#00ff84]/5 transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Secret Key</label>
                  <button type="button" className="text-[10px] text-[#00ff84] font-bold uppercase tracking-widest hover:underline">Recovery</button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-zinc-600 group-focus-within:text-[#00ff84] transition-colors" />
                  </div>
                  <input 
                    type={showPass ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:border-[#00ff84]/50 focus:ring-4 focus:ring-[#00ff84]/5 transition-all placeholder:text-zinc-700"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-4 flex items-center text-zinc-600 hover:text-zinc-300 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

                {/* Password Rules */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                  {passwordRules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {rule.met ? (
                        <CheckCircle2 className="w-3 h-3 text-[#00ff84]" />
                      ) : (
                        <Circle className="w-3 h-3 text-zinc-700" />
                      )}
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider",
                        rule.met ? "text-[#00ff84]" : "text-zinc-600"
                      )}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <p className="text-xs text-rose-400 font-medium">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#00ff84] text-black font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all hover:bg-[#00e676] hover:scale-[1.01] active:scale-[0.99] shadow-2xl shadow-[#00ff84]/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {tab === 'user' ? 'Login' : 'Authenticate'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {tab === 'user' && (
            <div className="mt-10">
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800/50"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#121212] px-4 text-zinc-600 font-black tracking-widest">Enterprise SSO</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button className="w-full flex items-center justify-center gap-3 bg-zinc-900 border border-zinc-800 text-zinc-300 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all hover:border-zinc-700">
                  <Chrome className="w-4 h-4" />
                  Login with Google
                </button>
                <button className="w-full flex items-center justify-center gap-3 bg-zinc-900 border border-zinc-800 text-zinc-300 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all hover:border-zinc-700">
                  <Github className="w-4 h-4" />
                  Login with GitHub
                </button>
                <button className="w-full flex items-center justify-center gap-3 bg-zinc-900 border border-zinc-800 text-zinc-300 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all hover:border-zinc-700">
                  <Linkedin className="w-4 h-4" />
                  Login with LinkedIn
                </button>
              </div>
            </div>
          )}

          {tab === 'admin' && (
            <div className="mt-8 p-4 bg-[#00ff84]/5 border border-dashed border-[#00ff84]/20 rounded-2xl">
               <p className="text-[10px] text-[#00ff84] font-bold uppercase tracking-widest mb-2 text-center">Development Simulation Mode</p>
               <button 
                 onClick={setAdminDemo}
                 className="w-full text-[10px] text-zinc-500 hover:text-white transition-colors underline decoration-dotted"
               >
                 Auto-fill Admin Credentials
               </button>
            </div>
          )}
        </div>

        <p className="mt-10 text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest italic">
          GrabOn Corporate Gateway • Security Protocol v9.2.0
        </p>
      </div>
    </div>
  );
}
